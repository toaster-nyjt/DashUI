/**
 * Standard API route location that generates React components using Claude
 */
import Anthropic from "@anthropic-ai/sdk";
import { GENERATE_SYSTEM_PROMPT, COMPONENT_SPEC_PROTOCOL } from "../SKILLS";
import { XY } from "@/app/utils/spec";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// One of four HTTP verbs, named with Next.js convention
// Front end calls a POST request -> Next.js calls this method
export async function POST(req: Request) {
  // Destructures the resulting obj promise. boxSize = current pixel dimensions of
  // the box this component renders into, so the model can size logic to it.
  const { prompt, history, boxSize } = await req.json() as {
    prompt: string;
    history?: Anthropic.MessageParam[];
    boxSize?: XY;
  };

  // Tell the model the concrete dimensions it's designing for. Still responsive
  // (the box can be resized), but this anchors the initial layout to the real shape.
  const sizeNote = boxSize
    ? `\n\nThe box this component renders into is currently ${Math.round(boxSize.x)}px wide by ${Math.round(boxSize.y)}px tall
    (aspect ratio ${(boxSize.x / boxSize.y).toFixed(2)}). Drive ALL layout, sizing, and density decisions in relation to these dimensions
    — choose horizontal vs. vertical arrangement, how many items/columns fit, and text sizes based on this actual width and height.
    The component as a whole MUST fit the box — nothing spills past its edges and it NEVER scrolls the host page. Fill the full width AND the full height (lay the body out as a flex column whose main region is "flex-1").
    When there is more content than comfortably fits in ${Math.round(boxSize.y)}px of height, FIRST try to fit it by condensing to a still-legible size: tighten spacing/gaps, shrink text and cards, reduce per-item padding, or show fewer items — but never crush past legibility.
    Only if a list or feed STILL has more items than fit legibly, give that region its own internal scroll ("overflow-y-auto") with its scrollbar HIDDEN ("[scrollbar-width:none] [&::-webkit-scrollbar]:hidden") rather than crushing rows until text collides. Never render a visible scrollbar, never clip text mid-glyph at an edge, and keep every row's stacked lines from overlapping.`
    : "";

  // History is persistent -> Supports multi-turn interactions
  const messages: Anthropic.MessageParam[] = [
    ...(history || []),
    { role: "user", content: prompt },
  ];

  // Sends the messages to Claude's streaming API, returns stream obj immediately
  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    system: GENERATE_SYSTEM_PROMPT + COMPONENT_SPEC_PROTOCOL + sizeNote, // Main instructions + spec-JSON protocol + per-box size context
    messages, // Shorthand for messages: messages
  });

  const encoder = new TextEncoder();

  // Allows for lines of the text to appear progressively
  const readableStream = new ReadableStream({
    async start(controller) {
      // Reads the reponses as they come through
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  // Runs immediately and concurrent with the stream
  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
