/**
 * API Route: UI STYLE. Given the original task and the resolved component
 * specs that make up ONE generated UI, returns a single coherent visual
 * style specification (plain text) for that whole UI. The caller stores it in the
 * styleSpec registry keyed by the task id; every component of the UI is then
 * generated with this style injected in place of the GENERATE route's fallback,
 * so independently generated boxes share one visual identity.
 */
import Anthropic from "@anthropic-ai/sdk";
import { STYLE_SYSTEM_PROMPT, COMPONENT_SPEC_PROTOCOL } from "../SKILLS";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(req: Request) {
  // components = the UI's specs already resolved to the full protocol shape
  // ({ name, genInstructions, role?, connectivity?, include, exclude }) — the same
  // resolved view the generator and layout routes see per component.
  const { task, components } = await req.json();

  const userContent =
    `Task: ${task}\n` +
    `These are the components that make up this single UI: ${JSON.stringify(components)}.`;

  const msg = await anthropic.messages.create({
    model: "claude-opus-4-8", // design-stage quality, like plan/layout
    max_tokens: 4000,
    system: STYLE_SYSTEM_PROMPT + COMPONENT_SPEC_PROTOCOL,
    messages: [{ role: "user", content: userContent }],
  });

  // Style is free-form prose, not JSON — just concatenate the text block(s).
  const style = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");

  return Response.json({ style });
}
