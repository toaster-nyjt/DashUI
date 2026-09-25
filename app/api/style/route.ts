/**
 * API Route: UI STYLE. Given the original task and the resolved component
 * specs that make up ONE generated UI, returns a single coherent visual
 * style specification (plain text) for that whole UI. The caller stores it in the
 * styleSpec registry keyed by the task id; every component of the UI is then
 * generated with this style injected in place of the GENERATE route's fallback,
 * so independently generated boxes share one visual identity. The caller
 * (fetchValidStyle) validates the sheet and re-calls with `previousError` on failure.
 */
import Anthropic from "@anthropic-ai/sdk";
import { STYLE_SYSTEM_PROMPT, COMPONENT_PROTOCOL } from "../SKILLS";
import { runLog, usageOf } from "@/app/utils/runLog";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(req: Request) {
  // components = the UI's definitions already resolved to the full protocol shape
  // ({ name, genInstructions, role?, connectivity?, features, excludedFeatures }) — the
  // same resolved view the generator and layout routes see per component.
  const { task, components, previousError, taskID } = await req.json();
  const t0 = Date.now();

  // On a retry, tell the model exactly which rule its last sheet broke.
  const retryNote = previousError
    ? `\n\nYour previous sheet was REJECTED: ${previousError}\nReturn the full corrected token sheet.`
    : "";

  const userContent =
    `Task: ${task}\n` +
    `These are the components that make up this single UI: ${JSON.stringify(components)}.` +
    retryNote;

  const msg = await anthropic.messages.create({
    model: "claude-opus-4-8", // design-stage quality, like plan/layout
    max_tokens: 4000,
    system: STYLE_SYSTEM_PROMPT + COMPONENT_PROTOCOL,
    messages: [{ role: "user", content: userContent }],
  });

  // Style is free-form prose, not JSON — just concatenate the text block(s).
  const style = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");

  runLog(taskID, "style", `${style.length} chars${previousError ? " (retry)" : ""}`, { previousError, components, style, ...usageOf(msg), secs: (Date.now() - t0) / 1000 });

  return Response.json({ style });
}
