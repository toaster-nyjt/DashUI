/**
 * API Route location, generates a customization preset (DefaultCompSpec) for a custom component using Claude, 
 * returns JSON that is appended to defaultSpec.
 */
import Anthropic from "@anthropic-ai/sdk";
import { stripCodeFences } from "@/app/utils/helpers";
import { SYSTEM_PROMPT } from "./prompt";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Front end calls a POST request -> Next.js calls this method -> req is the custom name string
export async function POST(req: Request) {
  // Grabbing name is async because HTTP requests are always streams
  const { name } = await req.json();

  // No stream, just return JSON string
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Component type: ${name}` }],
  });

  // Pull the text, strip any stray code fences
  const raw = msg.content[0].type === "text" ? msg.content[0].text : "{}";
  const parsed = JSON.parse(stripCodeFences(raw)); // Turn into object

  // Wrap object into the DefaultCompSpec shape to return
  return Response.json({
    name,
    genInstructions: parsed.genInstructions ?? "",
    spec: {
      specArr: parsed.specArr ?? [],
      defaultSpecArrIdx: parsed.defaultSpecArrIdx ?? [],
    },
  });
}
