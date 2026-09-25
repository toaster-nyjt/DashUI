/**
 * API Route: HOIST. Given the task and every resolved component of ONE generated UI,
 * returns the UI's shared primitive library plus a feature -> primitive-type map per
 * component ({ library, components }, see HoistResult). ONE holistic call. The caller
 * (fetchValidHoist) validates coverage and re-calls with `previousError` on failure.
 */
import Anthropic from "@anthropic-ai/sdk";
import { stripCodeFences } from "@/app/utils/helpers";
import { HOIST_SYSTEM_PROMPT, COMPONENT_PROTOCOL } from "../SKILLS";
import { runLog, usageOf } from "@/app/utils/runLog";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(req: Request) {
  const { task, components, previousError, taskID } = await req.json();
  const t0 = Date.now();

  // On a retry, tell the model exactly why its last attempt was rejected.
  const retryNote = previousError
    ? `\n\nYour previous attempt was REJECTED: ${previousError}\nFix exactly that and return the full corrected JSON.`
    : "";

  const userContent = `Task: ${task}\nComponents: ${JSON.stringify(components)}${retryNote}`;

  // Opus 5, adaptive thinking, effort low: the measured hoist config (see
  // docs/fixtures/model-exp/HOIST_MODEL_COMPARISON.md). Streamed so a long think can't time out.
  const request = { system: HOIST_SYSTEM_PROMPT + COMPONENT_PROTOCOL, messages: [{ role: "user" as const, content: userContent }] };
  let msg = await anthropic.messages.stream({
    model: "claude-opus-5",
    max_tokens: 64000,
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    ...request,
  }).finalMessage();

  // Declined: regenerate once on the previous tested config (Opus 4.8, adaptive, low).
  if (msg.stop_reason === "refusal") {
    console.error("[hoist] refusal; regenerating on claude-opus-4-8", msg.stop_details ?? "");
    msg = await anthropic.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      ...request,
    }).finalMessage();
  }

  const meta = { previousError, ...usageOf(msg), secs: (Date.now() - t0) / 1000 };
  if (msg.stop_reason === "refusal") {
    runLog(taskID, "hoist", "REFUSAL on both models", { ...meta, stop_details: msg.stop_details });
    return Response.json({ error: "The model declined to design this UI's primitives." }, { status: 502 });
  }

  // Text blocks only (thinking blocks never carry the answer).
  const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  try {
    const hoist = JSON.parse(stripCodeFences(raw.trim()));
    runLog(taskID, "hoist", `${hoist?.library?.length ?? "?"} type(s)${previousError ? " (retry)" : ""}`, { ...meta, components, hoist });
    return Response.json(hoist);
  } catch {
    runLog(taskID, "hoist", "output was not valid JSON", { ...meta, raw });
    // 422 + a readable reason, so the caller can feed it back on retry.
    const why = msg.stop_reason === "max_tokens" ? "it was cut off before finishing" : "it was not valid JSON";
    return Response.json({ error: `Your output could not be parsed: ${why}. Return ONLY the JSON object.` }, { status: 422 });
  }
}
