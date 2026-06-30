/**
 * API Route: UI PLANNER. Takes a high-level user task and returns a JSON
 * array of DefaultCompSpec — one functionality-aware preset per component the
 * UI needs. The caller appends these to the shared defaultSpec registry.
 */
import Anthropic from "@anthropic-ai/sdk";
import { stripCodeFences } from "@/app/utils/helpers";
import { PLAN_SYSTEM_PROMPT } from "../SKILLS";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(req: Request) {
  // width/height = the available pixel area the UI will occupy. The planner
  // scales component count to it (only splitting when there's room for each piece).
  // previousError = set on a connectivity-validation retry (see fetchValidPlan).
  const { task, width, height, previousError } = await req.json();

  const sizeNote = (width && height)
    ? `\nAvailable area: ${Math.round(width)}px wide by ${Math.round(height)}px tall. Make ALL decisions relative to this space — only create multiple components if each gets enough pixel area to be legible and useful; in a small area, prefer a single focused component.`
    : "";

  // On a retry, tell the planner exactly which connectivity link was invalid.
  const retryNote = previousError
    ? `\n\nYour previous attempt was REJECTED for invalid connectivity: ${previousError}\nFix the wiring so every connection "name" matches another component's "name" exactly, then return the full corrected JSON array.`
    : "";

  const msg = await anthropic.messages.create({
    model: "claude-opus-4-8", // most capable model for component functionality decomposition
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    system: PLAN_SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Task: ${task}${sizeNote}${retryNote}` }],
  });

  // Reasoning stays in `thinking` blocks, so the text block(s) are just the JSON.
  // Concatenate every text block (interleaved thinking can split it across more
  // than one), strip any stray markdown fences, and parse.
  const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const parsed = JSON.parse(stripCodeFences(raw));

  return Response.json(parsed);
}
