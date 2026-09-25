/**
 * Standard API route location that generates React components using Claude
 */
import Anthropic from "@anthropic-ai/sdk";
import { XY, LeafPrimitives } from "@/app/utils/spec";
import { extractComponentCode, LEAF_REPLACE_MARKER } from "@/app/utils/helpers";
import { sanitizeLeaf } from "@/app/utils/leafSanitizer";
import { buildLeafSystem } from "@/app/utils/leafPrompt";
import { runLog, usageOf } from "@/app/utils/runLog";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// One Messages request's model config. LEAF_MODEL is the measured leaf config (Opus 5,
// adaptive thinking, effort low — see PRIMITIVE_HOIST_PLAN §0.1). REFUSAL_FALLBACK re-runs
// a leaf Opus 5 declined, on the previous tested config.
const LEAF_MODEL = { model: "claude-opus-5", max_tokens: 64000, thinking: { type: "adaptive" }, output_config: { effort: "low" } } as const;
// Leaf prompt layout: true = one SIZE BUDGET block at the end with the sum written as a comment
// (measured, see docs/fixtures/model-exp/LEAF_BUDGET_COMPARISON.md); false = floors in the library block.
const LEAF_SIZE_BUDGET = true;
const REFUSAL_FALLBACK = { model: "claude-opus-4-8", max_tokens: 16000, thinking: { type: "disabled" }, output_config: { effort: "max" } } as const;

// One of four HTTP verbs, named with Next.js convention
// Front end calls a POST request -> Next.js calls this method
export async function POST(req: Request) {
  // Destructures the resulting obj promise. boxSize = current pixel dimensions of
  // the box this component renders into, so the model can size logic to it.
  const { prompt, history, boxSize, style, primitives, taskID, leafKey } = await req.json() as {
    taskID?: number;   // the generated UI this leaf belongs to (run log file); undefined for manual boxes
    leafKey?: string;  // the box key, to tell leaves apart in the run log
    prompt: string;
    history?: Anthropic.MessageParam[];
    boxSize?: XY;
    // Per-UI visual style (from the STYLE route) shared by every component of a
    // generated UI. When absent, fall back to the default style block.
    style?: string;
    // Per-UI primitive library + floors. When absent (manual boxes, or a UI built without
    // primitives) the leaf is hand-built with the base prompt.
    primitives?: LeafPrimitives;
  };

  // Log the full resolved component spec (name/genInstructions/role/connectivity/
  // include/exclude) that drives this generation. prompt IS that spec JSON; parse
  // to pretty-print, falling back to the raw string if it isn't JSON.
  const t0 = Date.now();
  let spec: { name?: string; features?: string[] | Record<string, string[] | null> } = {};
  try {
    spec = JSON.parse(prompt);
  } catch {
    console.log("[generate] spec is not JSON:\n" + prompt);
  }

  const { system, hasLibrary, handBuilt } = buildLeafSystem({ spec, boxSize, style, primitives, budget: LEAF_SIZE_BUDGET });

  const leaf = spec.name ?? leafKey ?? "?";
  runLog(taskID, "leaf:start", `${leaf} — ${hasLibrary ? (handBuilt ? "primitives + hand-built" : "primitives only") : "hand-built (base prompt)"}, ${boxSize ? Math.round(boxSize.x) + "x" + Math.round(boxSize.y) + "px" : "no box size"}`, {
    leaf, leafKey, spec, hasLibrary, handBuilt, boxSize, historyTurns: history?.length ?? 0,
    library: primitives?.library.map((t) => t.type), floors: primitives?.floors,
    styleChars: style?.length ?? 0, systemChars: system.length, system,
  });

  // History is persistent -> Supports multi-turn interactions
  const messages: Anthropic.MessageParam[] = [
    ...(history || []),
    { role: "user", content: prompt },
  ];

  // Sends the messages to Claude's streaming API, returns stream obj immediately
  const stream = anthropic.messages.stream({ ...LEAF_MODEL, system, messages });

  // Primitive leaves get the deterministic post-processor. It never fails a leaf: on any
  // parser error the model's code is used as-is.
  const finish = (code: string) => {
    if (!hasLibrary) return code;
    try { return sanitizeLeaf(code, primitives!.library.map((t) => t.type)); }
    catch (e) { console.error("[generate] post-processor failed; using raw code", e); return code; }
  };

  const encoder = new TextEncoder();

  // What the post-processor did, for the run log: the class tokens it removed and added.
  const postProcessed = (before: string, after: string) => {
    const toks = (s: string) => (s.match(/"[^"\n]*"/g) ?? []).flatMap((q) => q.slice(1, -1).split(/\s+/)).filter(Boolean);
    const count = (a: string[]) => a.reduce((m, t) => m.set(t, (m.get(t) ?? 0) + 1), new Map<string, number>());
    const b = count(toks(before)), a = count(toks(after));
    const diff = (x: Map<string, number>, y: Map<string, number>) => [...x].flatMap(([t, n]) => Array<string>(Math.max(0, n - (y.get(t) ?? 0))).fill(t));
    return { postProcessed: before !== after, classesRemoved: diff(b, a), classesAdded: diff(a, b) };
  };

  // Allows for lines of the text to appear progressively
  const readableStream = new ReadableStream({
    async start(controller) {
      let text = "";
      // Reads the responses as they come through. Only text deltas are code; thinking
      // blocks stream as other delta types and are never forwarded.
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          text += event.delta.text;
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      const final = await stream.finalMessage();

      if (final.stop_reason === "refusal") {
        // Declined (before or mid output): regenerate on the fallback config and replace
        // whatever partial code was streamed.
        console.error("[generate] refusal; regenerating on " + REFUSAL_FALLBACK.model, final.stop_details ?? "");
        const retry = await anthropic.messages.stream({ ...REFUSAL_FALLBACK, system, messages }).finalMessage();
        const code = extractComponentCode(retry.content.map((b) => (b.type === "text" ? b.text : "")).join(""));
        const clean = finish(code);
        controller.enqueue(encoder.encode(LEAF_REPLACE_MARKER + clean));
        runLog(taskID, "leaf:done", `${leaf} — REFUSAL on ${LEAF_MODEL.model}, regenerated on ${REFUSAL_FALLBACK.model}`, {
          leaf, leafKey, stop_details: final.stop_details, partial: text, first: usageOf(final), ...usageOf(retry),
          ...postProcessed(code, clean), code: clean, secs: (Date.now() - t0) / 1000,
        });
      } else {
        if (final.stop_reason === "max_tokens") console.error("[generate] hit max_tokens; the leaf may be incomplete");
        const code = extractComponentCode(text);
        const clean = finish(code);
        // Only when something changed, so an already-clean leaf never re-renders.
        if (clean !== code) controller.enqueue(encoder.encode(LEAF_REPLACE_MARKER + clean));
        const pp = postProcessed(code, clean);
        runLog(taskID, "leaf:done", `${leaf} — ${final.stop_reason}, ${final.usage.output_tokens} out, ${((Date.now() - t0) / 1000).toFixed(0)}s${hasLibrary ? ", post-processor " + (pp.postProcessed ? "changed " + pp.classesRemoved.length + " class(es)" : "no change") : ""}`, {
          leaf, leafKey, raw: text, code: clean, ...pp, ...usageOf(final), secs: (Date.now() - t0) / 1000,
        });
      }
      controller.close();
    },
  });

  // Runs immediately and concurrent with the stream
  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
