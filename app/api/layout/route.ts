/**
 * API Route: UI LAYOUT. Given the visible grid size (in blocks), the resolved
 * component definitions (full protocol view — name/genInstructions/role/connectivity/
 * features/excludedFeatures), and the original task, returns a JSON array of placements
 * ({ name, colStart, colEnd, rowStart, rowEnd }) that tile the window exactly.
 * The caller validates the result and re-calls with `previousError` on failure.
 */
import Anthropic from "@anthropic-ai/sdk";
import { stripCodeFences } from "@/app/utils/helpers";
import { LAYOUT_SYSTEM_PROMPT, COMPONENT_PROTOCOL } from "../SKILLS";
import { runLog, usageOf } from "@/app/utils/runLog";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(req: Request) {
  const { task, components, cols, rows, previousError, taskID } = await req.json();
  const t0 = Date.now();

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
    system: LAYOUT_SYSTEM_PROMPT + COMPONENT_PROTOCOL,
    messages: [{ role: "user", content: userContent }],
  });

  // Pull the text, strip any stray code fences, and parse the JSON array
  const raw = msg.content[0].type === "text" ? msg.content[0].text : "[]";
  let parsed;
  try { parsed = JSON.parse(stripCodeFences(raw)); }
  catch (e) { runLog(taskID, "layout", "output was not valid JSON", { cols, rows, previousError, raw, ...usageOf(msg), secs: (Date.now() - t0) / 1000 }); throw e; }
  runLog(taskID, "layout", `${Array.isArray(parsed) ? parsed.length : "?"} placement(s) on ${cols}x${rows}${previousError ? " (retry)" : ""}`, { cols, rows, previousError, placements: parsed, ...usageOf(msg), secs: (Date.now() - t0) / 1000 });

  return Response.json(parsed);
}
