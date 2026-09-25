// SERVER-ONLY: generate one hoisted primitive type for one UI, with the same validate-and-
// retry loop the other stages use (first failed check fed back, PRIMITIVE_RETRIES attempts).
// Used by /api/primitives, which runs every type of a UI in parallel on the server — one
// browser request instead of one per type, so the browser's per-host connection limit
// never queues them.
import Anthropic from "@anthropic-ai/sdk";
import { PRIMITIVE_SYSTEM_PROMPT, primitiveRequest } from "@/app/api/SKILLS";
import { PrimitiveType, PrimitiveUse, PrimitiveFloor } from "./spec";
import { checkPrimitive, extractPrimitiveCode } from "./primitiveChecks";
import { runLog, usageOf } from "./runLog";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export const PRIMITIVE_RETRIES = 3;

// Opus 5, adaptive thinking, effort low: the measured primitive config (see
// docs/fixtures/model-exp/PRIMITIVE_MODEL_COMPARISON.md). max_tokens covers thinking + code.
const PRIMITIVE_MODEL = { model: "claude-opus-5", max_tokens: 64000, thinking: { type: "adaptive" }, output_config: { effort: "low" } } as const;
// A declined request regenerates once on the previous tested config.
const REFUSAL_FALLBACK = { model: "claude-opus-4-8", max_tokens: 16000, thinking: { type: "disabled" }, output_config: { effort: "max" } } as const;

// One attempt: the model call (with the refusal fallback) and the static checks.
async function attempt(task: string, prim: PrimitiveType, uses: PrimitiveUse[], style: string, previousError: string | undefined, taskID?: number):
  Promise<{ code?: string; floor?: PrimitiveFloor; error?: string }> {
  const t0 = Date.now();
  const retryNote = previousError
    ? `\n\nYour previous attempt was REJECTED: ${previousError}\nReturn the full corrected primitive.`
    : "";
  const request = {
    system: PRIMITIVE_SYSTEM_PROMPT + `\n\nVISUAL GUIDELINES — follow these guidelines so this primitive matches the rest of its UI:\n${style}`,
    messages: [{ role: "user" as const, content: primitiveRequest(task, prim, uses) + retryNote }],
  };

  let msg = await anthropic.messages.stream({ ...PRIMITIVE_MODEL, ...request }).finalMessage();
  if (msg.stop_reason === "refusal") {
    console.error(`[primitive] ${prim.type}: refusal; regenerating on ${REFUSAL_FALLBACK.model}`, msg.stop_details ?? "");
    msg = await anthropic.messages.stream({ ...REFUSAL_FALLBACK, ...request }).finalMessage();
    if (msg.stop_reason === "refusal") {
      runLog(taskID, "primitive", `${prim.type}: REFUSAL on both models`, { type: prim.type, previousError, ...usageOf(msg), stop_details: msg.stop_details });
      return { error: "The model declined to generate this primitive." };
    }
  }

  const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const code = extractPrimitiveCode(raw);
  const { errors, floor } = checkPrimitive(prim, code);
  if (msg.stop_reason === "max_tokens") errors.unshift("the output was cut off before the primitive was finished; write it more compactly");
  runLog(taskID, "primitive", `${prim.type}: ${errors.length ? "REJECTED — " + errors[0].slice(0, 120) : "ok, floor " + JSON.stringify(floor)}${previousError ? " (retry)" : ""}`,
    { type: prim.type, prim, uses, previousError, errors, floor, code, ...usageOf(msg), secs: (Date.now() - t0) / 1000 });
  return errors.length ? { error: errors[0], code } : { code, floor };
}

// Up to PRIMITIVE_RETRIES attempts. Returns the passing code + floor, or the last error
// (the caller then leaves the type out, and its features are hand-built).
export async function generatePrimitive(task: string, prim: PrimitiveType, uses: PrimitiveUse[], style: string, taskID?: number):
  Promise<{ code?: string; floor?: PrimitiveFloor; error?: string; attempts: number }> {
  let previousError: string | undefined;
  for (let n = 1; n <= PRIMITIVE_RETRIES; n++) {
    try {
      const r = await attempt(task, prim, uses, style, previousError, taskID);
      if (!r.error) return { code: r.code, floor: r.floor, attempts: n };
      previousError = r.error;
    } catch (e) {
      previousError = e instanceof Error ? e.message : String(e);
      runLog(taskID, "primitive:errored", `${prim.type} attempt ${n}/${PRIMITIVE_RETRIES}: ${previousError}`, { type: prim.type });
    }
  }
  runLog(taskID, "primitive:dropped", `${prim.type}: its features will be hand-built. Last error: ${previousError}`, { type: prim.type });
  return { error: previousError, attempts: PRIMITIVE_RETRIES };
}
