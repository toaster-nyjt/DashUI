/**
 * Generates a customization preset (DefaultCompSpec) for a custom component
 * type name, using Claude. Returns JSON the client appends to defaultSpec.
 */
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const SYSTEM_PROMPT = `You define a customization preset for a UI component type.
Output ONLY valid JSON (no markdown, no prose) of exactly this shape:
{
  "genInstructions": string,
  "specArr": string[],
  "defaultSpecArrIdx": number[]
}

Rules:
- genInstructions: 1-2 sentences of general formatting/behavior guidance for building this component well.
- specArr: 6-8 short, distinct, OPTIONAL UI customizations/features for this component. Title Case, 1-4 words each.
- defaultSpecArrIdx: a sensible subset of indices into specArr (0-based) that should be enabled by default.`;

export async function POST(req: Request) {
  const { name } = await req.json();

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Component type: ${name}` }],
  });

  // Pull the text, strip any stray code fences, and parse the JSON
  const raw = msg.content[0].type === "text" ? msg.content[0].text : "{}";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(cleaned);

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
