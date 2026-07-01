/**
 * API Route: PATH (functional wiring). Given every component of ONE generated UI
 * (name + current code + role) and a deterministic list of CHANNELS (functional
 * links derived app-side from the planner's connectivity), returns each wired
 * component's updated code with the runtime bus (bus.emit / bus.on) injected — a
 * thin wiring layer, not a redesign. The caller (fetchValidWiring) validates that
 * every channel id was actually referenced and re-calls with `previousError`.
 *
 * The bus itself is injected into each Sandpack iframe by Preview.tsx and relayed
 * between sibling iframes of the same UI by the host bus relay in SpatialGrid.
 */
import Anthropic from "@anthropic-ai/sdk";
import { extractComponentCode } from "@/app/utils/helpers";
import { PATH_SYSTEM_PROMPT } from "../SKILLS";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(req: Request) {
  const { components, channels, previousError } = await req.json() as {
    components: { name: string; code: string; role?: string }[];
    channels: { id: string; from: string; to: string; description: string }[];
    previousError?: string;
  };

  // On a retry, tell the model exactly which channel it failed to wire.
  const retryNote = previousError
    ? `\n\nYour previous attempt was REJECTED: ${previousError}\nReturn corrected blocks — every channel's source must call bus.emit with the EXACT channel id and every channel's receiver must call bus.on with the EXACT channel id.`
    : "";

  // The channels to wire, then each component's current code (same block format the
  // model must echo back for the ones it edits).
  const channelList = channels
    .map((c) => `Channel "${c.id}": FROM "${c.from}" TO "${c.to}". ${c.description}`)
    .join("\n");
  const componentBlocks = components
    .map((c) => `<<<COMPONENT name="${c.name}">>>\nROLE: ${c.role ?? "(none)"}\nCODE:\n${c.code}\n<<<END>>>`)
    .join("\n\n");

  const userContent =
    `CHANNELS TO WIRE:\n${channelList}\n\nCOMPONENTS (current code):\n${componentBlocks}${retryNote}`;

  // STREAM (not create): with max_tokens this high + adaptive thinking, the SDK's
  // non-streaming path is rejected up front ("Streaming is required for operations
  // that may take longer than 10 minutes"). We still return one JSON response — we
  // just consume the model output as a stream and await the assembled message.
  const stream = anthropic.messages.stream({
    model: "claude-opus-4-8", // reasoning over existing code — mirrors the planner's config
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    system: PATH_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });
  const msg = await stream.finalMessage();

  // Reasoning stays in thinking blocks; concatenate the text block(s).
  const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");

  // Parse the delimited output blocks -> [{ name, code }]. extractComponentCode drops
  // any stray fence/preamble the model may have wrapped a block's code in.
  const out: { name: string; code: string }[] = [];
  const re = /<<<COMPONENT name="([\s\S]*?)">>>\s*([\s\S]*?)\s*<<<END>>>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    out.push({ name: m[1].trim(), code: extractComponentCode(m[2]) });
  }

  return Response.json(out);
}
