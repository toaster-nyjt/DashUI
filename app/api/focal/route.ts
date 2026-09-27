/**
 * API Route: FOCAL. After the hoist, picks the ONE library type the whole UI is recognized
 * by ({ focal }). The caller (fetchValidFocal) validates and repairs the picks (validateFocal)
 * and re-calls with `previousError` on failure. Evidence: docs/fixtures/model-exp/FOCAL_PRIMITIVES.md.
 */
import Anthropic from "@anthropic-ai/sdk";
import { HoistResult } from "@/app/utils/spec";
import { stripCodeFences, derivePrimitiveUsage } from "@/app/utils/helpers";
import { FOCAL_SYSTEM_PROMPT, focalRequest } from "../SKILLS";
import { runLog, usageOf } from "@/app/utils/runLog";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(req: Request) {
  const { task, components, hoist, previousError, taskID } = await req.json() as {
    task: string;
    components: { name: string; role?: string }[];
    hoist: HoistResult;
    previousError?: string;
    taskID?: number;
  };
  const t0 = Date.now();

  const retryNote = previousError ? `\n\nYour previous answer was REJECTED: ${previousError}` : "";
  const request = {
    system: FOCAL_SYSTEM_PROMPT,
    messages: [{ role: "user" as const, content: focalRequest(task, components, hoist.library, derivePrimitiveUsage(hoist)) + retryNote }],
  };

  // Opus 5, adaptive thinking, effort high (the output is a few tokens; the room is for thinking).
  let msg = await anthropic.messages.create({ model: "claude-opus-5", max_tokens: 16000, thinking: { type: "adaptive" }, output_config: { effort: "high" }, ...request });
  if (msg.stop_reason === "refusal") {
    console.error("[focal] refusal; regenerating on claude-opus-4-8", msg.stop_details ?? "");
    msg = await anthropic.messages.create({ model: "claude-opus-4-8", max_tokens: 8000, thinking: { type: "adaptive" }, output_config: { effort: "low" }, ...request });
  }

  const meta = { previousError, ...usageOf(msg), secs: (Date.now() - t0) / 1000 };
  if (msg.stop_reason === "refusal") {
    runLog(taskID, "focal", "REFUSAL on both models", { ...meta, stop_details: msg.stop_details });
    return Response.json({ error: "The model declined to pick focal primitives." }, { status: 502 });
  }

  const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  try {
    const result = JSON.parse(stripCodeFences(raw.trim()));
    runLog(taskID, "focal", `${JSON.stringify(result?.focal)}${previousError ? " (retry)" : ""}`, { ...meta, result });
    return Response.json(result);
  } catch {
    runLog(taskID, "focal", "output was not valid JSON", { ...meta, raw });
    return Response.json({ error: `Your output could not be parsed. Return ONLY the JSON object {"focal": [...]}.` }, { status: 422 });
  }
}
