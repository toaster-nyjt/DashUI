/**
 * API Route: dashboard PLANNER. Takes a high-level user task and returns a JSON
 * array of DefaultCompSpec — one functionality-aware preset per component the
 * dashboard needs. The caller appends these to the shared defaultSpec registry.
 */
import Anthropic from "@anthropic-ai/sdk";
import { stripCodeFences } from "@/app/utils/helpers";
import { PLAN_SYSTEM_PROMPT } from "../SKILLS";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(req: Request) {
  const { task } = await req.json();

  const msg = await anthropic.messages.create({
    model: "claude-opus-4-8", // most capable model for component functionality decomposition
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    system: PLAN_SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Task: ${task}` }],
  });

  // Reasoning stays in `thinking` blocks, so the text block(s) are just the JSON.
  // Concatenate every text block (interleaved thinking can split it across more
  // than one), strip any stray markdown fences, and parse.
  const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const parsed = JSON.parse(stripCodeFences(raw));

  return Response.json(parsed);
}
