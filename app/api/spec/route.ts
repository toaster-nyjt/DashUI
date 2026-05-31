/**
 * Generates a customization preset (DefaultCompSpec) for a custom component
 * type name, using Claude. Returns JSON the client appends to defaultSpec.
 */
import Anthropic from "@anthropic-ai/sdk";
import { stripCodeFences } from "@/app/utils/helpers";
import { SYSTEM_PROMPT } from "./prompt";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(req: Request) {
  const { name } = await req.json();

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Component type: ${name}` }],
  });

  // Pull the text, strip any stray code fences, and parse the JSON
  const raw = msg.content[0].type === "text" ? msg.content[0].text : "{}";
  const parsed = JSON.parse(stripCodeFences(raw));

  // Wrap into the DefaultCompSpec shape
  return Response.json({
    name,
    genInstructions: parsed.genInstructions ?? "",
    spec: {
      specArr: parsed.specArr ?? [],
      defaultSpecArrIdx: parsed.defaultSpecArrIdx ?? [],
    },
  });
}
