/**
 * API Route: dashboard LAYOUT. Given the visible grid size (in blocks), the list
 * of component specs, and the original task, returns a JSON array of placements
 * ({ name, colStart, colEnd, rowStart, rowEnd }) that tile the window exactly.
 * The caller validates the result and re-calls with `previousError` on failure.
 */
import Anthropic from "@anthropic-ai/sdk";
import { stripCodeFences } from "@/app/utils/helpers";
import { LAYOUT_SYSTEM_PROMPT, COMPONENT_SPEC_PROTOCOL } from "../SKILLS";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(req: Request) {
  const { task, components, cols, rows, previousError } = await req.json();

  // On a retry, tell the model exactly why its last attempt was rejected.
  const retryNote = previousError
    ? `\n\nYour previous attempt was REJECTED: ${previousError}\nReturn a corrected tiling that satisfies every hard constraint.`
    : "";

  const userContent =
    `Task: ${task}\n` +
    `Grid: ${cols} columns x ${rows} rows (1-indexed, inclusive coordinates).\n` +
    `Place each of these components exactly once: ${JSON.stringify(components)}.` +
    retryNote;

  const msg = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    system: LAYOUT_SYSTEM_PROMPT + COMPONENT_SPEC_PROTOCOL,
    messages: [{ role: "user", content: userContent }],
  });

  // Pull the text, strip any stray code fences, and parse the JSON array
  const raw = msg.content[0].type === "text" ? msg.content[0].text : "[]";
  const parsed = JSON.parse(stripCodeFences(raw));

  return Response.json(parsed);
}
