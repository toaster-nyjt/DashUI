// SERVER-ONLY, dev-only: one JSON line per pipeline event in logs/task-<taskID>.jsonl, so a
// whole generated UI (plan -> style/hoist/layout -> primitives -> leaves -> wiring) can be
// read back in one file. Manual boxes (no taskID) go to logs/manual.jsonl. The terminal
// gets one short line per event.
import fs from "fs";
import path from "path";

const DIR = path.join(process.cwd(), "logs");

export function runLog(taskID: number | undefined, stage: string, summary: string, data: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "production") return;
  const file = path.join(DIR, taskID !== undefined ? `task-${taskID}.jsonl` : "manual.jsonl");
  console.log(`[run ${taskID ?? "manual"}] ${stage}: ${summary}`);
  try {
    fs.mkdirSync(DIR, { recursive: true });
    fs.appendFileSync(file, JSON.stringify({ t: new Date().toISOString(), stage, summary, ...data }) + "\n");
  } catch (e) {
    console.error("[runLog] could not write " + file, e);
  }
}

// Token usage + stop reason of one Messages response, in the shape every stage logs.
export const usageOf = (msg: { model?: string; stop_reason?: string | null; usage?: { input_tokens?: number; output_tokens?: number } }) =>
  ({ model: msg.model, stop: msg.stop_reason, inTok: msg.usage?.input_tokens, outTok: msg.usage?.output_tokens });
