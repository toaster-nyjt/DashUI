/**
 * Standard API route location that generates React components using Claude
 */
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompt";
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
    EVERYTHING MUST FIT INSIDE THE BOX AT ONCE — absolutely NO scrolling and NO clipping. The content fills the full width AND the full height (lay the body out as a flex column whose main region is "flex-1").
    When there is more content than comfortably fits in ${Math.round(boxSize.y)}px of height, CONDENSE it so all of it is visible at once: tighten spacing/gaps, shrink text and cards, reduce per-item padding, or show fewer items
     — never a scrollbar, and never an item cut off at an edge. Size every item so the whole set collectively fits within the box.`
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
    system: SYSTEM_PROMPT + sizeNote, // Main instructions + per-box size context
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
