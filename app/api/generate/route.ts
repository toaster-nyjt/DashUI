/**
 * Standard API route location that generates React components using Claude
 */
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompt";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// One of four HTTP verbs, named with Next.js convention
// Front end calls a POST request -> Next.js calls this method
export async function POST(req: Request) {
  // Destructures the resulting obj promise
  const { prompt, history } = await req.json(); // Prompt was latest prompt

  // History is persistent -> Supports multi-turn interactions
  const messages: Anthropic.MessageParam[] = [
    ...(history || []),
    { role: "user", content: prompt },
  ];

  // Sends the messages to Claude's streaming API, returns stream obj immediately
  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT, // Main instructions here
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
