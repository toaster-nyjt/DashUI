// SERVER-ONLY: one leaf's generation pipeline, shared by the generate route (streams one leaf to
// its box) and the build route (generates a UI's leaves on the server as their primitives finish):
// prompt (buildLeafSystem) + leaf:start log, then after the model call the refusal fallback,
// compile guarantee (repairSyntax, else one regeneration), post-processor and leaf:done log.
import Anthropic from "@anthropic-ai/sdk";
import { XY, LeafPrimitives } from "./spec";
import { extractComponentCode, heldTypeNames } from "./helpers";
import { sanitizeLeaf } from "./leafSanitizer";
import { repairSyntax, syntaxIssues } from "./syntaxRepair";
import { buildLeafSystem } from "./leafPrompt";
import { runLog, usageOf } from "./runLog";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// One Messages request's model config. LEAF_MODEL is the measured leaf config (Opus 5,
// adaptive thinking, effort low — see PRIMITIVE_HOIST_PLAN §0.1). REFUSAL_FALLBACK re-runs
// a leaf Opus 5 declined, on the previous tested config.
export const LEAF_MODEL = { model: "claude-opus-5", max_tokens: 64000, thinking: { type: "adaptive" }, output_config: { effort: "low" } } as const;
// Leaf prompt layout: true = one SIZE BUDGET block at the end with the sum written as a comment
// (measured, see docs/fixtures/model-exp/LEAF_BUDGET_COMPARISON.md); false = floors in the library block.
const LEAF_SIZE_BUDGET = true;
const REFUSAL_FALLBACK = { model: "claude-opus-4-8", max_tokens: 16000, thinking: { type: "disabled" }, output_config: { effort: "max" } } as const;

export type LeafRequest = {
  prompt: string;                    // the resolved component JSON (resolveComponent)
  history?: Anthropic.MessageParam[];
  boxSize?: XY;
  style?: string;                    // the UI's style sheet; absent -> fallback style
  primitives?: LeafPrimitives;       // absent -> hand-built leaf, the base prompt
  taskID?: number;                   // run-log file; undefined for manual boxes
  leafKey?: string;                  // the box key, to tell leaves apart in the run log
};

export type PreparedLeaf = {
  system: string;
  messages: Anthropic.MessageParam[];
  hasLibrary: boolean;
  leaf: string;
  req: LeafRequest;
  t0: number;
};

// Builds the system prompt and messages, and logs leaf:start.
export function prepareLeaf(req: LeafRequest): PreparedLeaf {
  const { prompt, history, boxSize, style, primitives, taskID, leafKey } = req;
  const t0 = Date.now();
  let spec: { name?: string; features?: string[] | Record<string, string[] | null> } = {};
  try {
    spec = JSON.parse(prompt);
  } catch {
    console.log("[generate] spec is not JSON:\n" + prompt);
  }

  const { system, hasLibrary, handBuilt, focal, library } = buildLeafSystem({ spec, boxSize, style, primitives, budget: LEAF_SIZE_BUDGET });

  const leaf = spec.name ?? leafKey ?? "?";
  runLog(taskID, "leaf:start", `${leaf} — ${hasLibrary ? (handBuilt ? "primitives + hand-built" : "primitives only") : "hand-built (base prompt)"}, ${boxSize ? Math.round(boxSize.x) + "x" + Math.round(boxSize.y) + "px" : "no box size"}`, {
    leaf, leafKey, spec, hasLibrary, handBuilt, boxSize, historyTurns: history?.length ?? 0,
    library, floors: primitives?.floors, focal: focal.length ? focal : undefined,
    held: Object.fromEntries((primitives?.library ?? []).filter((t) => heldTypeNames(t).length).map((t) => [t.type, heldTypeNames(t)])),
    styleChars: style?.length ?? 0, systemChars: system.length, system,
  });

  // History is persistent -> Supports multi-turn interactions
  const messages: Anthropic.MessageParam[] = [...(history || []), { role: "user", content: prompt }];
  return { system, messages, hasLibrary, leaf, req, t0 };
}

// The model call for a prepared leaf (the generate route streams it itself).
export const streamLeaf = (p: PreparedLeaf) => anthropic.messages.stream({ ...LEAF_MODEL, system: p.system, messages: p.messages });

// What the post-processor did, for the run log: the class tokens it removed and added.
const postProcessed = (before: string, after: string) => {
  const toks = (s: string) => (s.match(/"[^"\n]*"/g) ?? []).flatMap((q) => q.slice(1, -1).split(/\s+/)).filter(Boolean);
  const count = (a: string[]) => a.reduce((m, t) => m.set(t, (m.get(t) ?? 0) + 1), new Map<string, number>());
  const b = count(toks(before)), a = count(toks(after));
  const diff = (x: Map<string, number>, y: Map<string, number>) => [...x].flatMap(([t, n]) => Array<string>(Math.max(0, n - (y.get(t) ?? 0))).fill(t));
  return { postProcessed: before !== after, classesRemoved: diff(b, a), classesAdded: diff(a, b) };
};

// After the model call: refusal fallback, compile guarantee, post-processor, leaf:done log.
// Returns the final code and whether it differs from what was streamed (so the generate route
// knows to send a replacement).
export async function finishLeaf(p: PreparedLeaf, final: Anthropic.Message, text: string): Promise<{ code: string; replaced: boolean }> {
  const { system, messages, hasLibrary, leaf, t0 } = p;
  const { primitives, taskID, leafKey } = p.req;

  // Primitive leaves get the deterministic post-processor. It never fails a leaf: on any
  // parser error the model's code is used as-is.
  const finish = (code: string) => {
    if (!hasLibrary) return code;
    try { return sanitizeLeaf(code, primitives!.library.map((t) => t.type)); }
    catch (e) { console.error("[generate] post-processor failed; using raw code", e); return code; }
  };

  // Every leaf must compile: deterministic repair first (repairSyntax), and only when that can't
  // fix it, one regeneration with the compile error fed back.
  const ensureCompiles = async (code: string): Promise<{ code: string; syntax: Record<string, unknown> }> => {
    const r = repairSyntax(code);
    if (r) return { code: r.code, syntax: r.repairs.length ? { syntaxRepairs: r.repairs } : {} };
    const issue = syntaxIssues(code)[0];
    console.error("[generate] leaf does not compile; regenerating once:", issue);
    const retry = await anthropic.messages.stream({ ...LEAF_MODEL, system, messages: [...messages,
      { role: "assistant", content: code },
      { role: "user", content: "Your component does not compile: " + issue.message + " at line " + issue.line + ": " + issue.snippet + "\nReturn the full corrected component." }] }).finalMessage();
    const code2 = extractComponentCode(retry.content.map((b) => (b.type === "text" ? b.text : "")).join(""));
    const r2 = repairSyntax(code2);
    return { code: r2 ? r2.code : code2, syntax: { syntaxError: issue, syntaxRegenerated: true, syntaxStillBroken: !r2, syntaxRepairs: r2?.repairs, syntaxRetry: usageOf(retry) } };
  };

  if (final.stop_reason === "refusal") {
    // Declined (before or mid output): regenerate on the fallback config and replace
    // whatever partial code was streamed.
    console.error("[generate] refusal; regenerating on " + REFUSAL_FALLBACK.model, final.stop_details ?? "");
    const retry = await anthropic.messages.stream({ ...REFUSAL_FALLBACK, system, messages }).finalMessage();
    const code = extractComponentCode(retry.content.map((b) => (b.type === "text" ? b.text : "")).join(""));
    const { code: compiled, syntax } = await ensureCompiles(code);
    const clean = finish(compiled);
    runLog(taskID, "leaf:done", `${leaf} — REFUSAL on ${LEAF_MODEL.model}, regenerated on ${REFUSAL_FALLBACK.model}`, {
      leaf, leafKey, stop_details: final.stop_details, partial: text, first: usageOf(final), ...usageOf(retry),
      ...postProcessed(compiled, clean), ...syntax, code: clean, secs: (Date.now() - t0) / 1000,
    });
    return { code: clean, replaced: true };
  }

  if (final.stop_reason === "max_tokens") console.error("[generate] hit max_tokens; the leaf may be incomplete");
  const code = extractComponentCode(text);
  const { code: compiled, syntax } = await ensureCompiles(code);
  const clean = finish(compiled);
  const pp = postProcessed(compiled, clean);
  const syn = syntax.syntaxRegenerated ? (syntax.syntaxStillBroken ? ", DOES NOT COMPILE after regeneration" : ", regenerated to compile") : syntax.syntaxRepairs ? ", syntax repaired" : "";
  runLog(taskID, "leaf:done", `${leaf} — ${final.stop_reason}, ${final.usage.output_tokens} out, ${((Date.now() - t0) / 1000).toFixed(0)}s${hasLibrary ? ", post-processor " + (pp.postProcessed ? "changed " + pp.classesRemoved.length + " class(es)" : "no change") : ""}${syn}`, {
    leaf, leafKey, raw: text, code: clean, ...pp, ...syntax, ...usageOf(final), secs: (Date.now() - t0) / 1000,
  });
  return { code: clean, replaced: clean !== code };
}

// The whole pipeline without streaming to a client (the build route).
export async function generateLeaf(req: LeafRequest): Promise<string> {
  const p = prepareLeaf(req);
  const final = await streamLeaf(p).finalMessage();
  const text = final.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  return (await finishLeaf(p, final, text)).code;
}
