/**
 * Standard API route location that generates React components using Claude. Streams ONE leaf to
 * its box: manual boxes, and a generated UI's leaf regenerated later (feature toggle,
 * customization). A new UI's leaves are generated on the server by the build route. The leaf
 * pipeline itself (prompt, refusal fallback, compile guarantee, post-processor, logs) is shared
 * with that route: app/utils/leafGen.ts.
 */
import { LEAF_REPLACE_MARKER } from "@/app/utils/helpers";
import { prepareLeaf, streamLeaf, finishLeaf, LeafRequest } from "@/app/utils/leafGen";

// One of four HTTP verbs, named with Next.js convention
// Front end calls a POST request -> Next.js calls this method
export async function POST(req: Request) {
  // prompt = the resolved component JSON; boxSize = current pixel dimensions of the box this
  // component renders into; style / primitives = the UI's, absent for manual boxes.
  const p = prepareLeaf(await req.json() as LeafRequest);

  // Sends the messages to Claude's streaming API, returns stream obj immediately
  const stream = streamLeaf(p);
  const encoder = new TextEncoder();

  // Allows for lines of the text to appear progressively
  const readableStream = new ReadableStream({
    async start(controller) {
      let text = "";
      // Reads the responses as they come through. Only text deltas are code; thinking
      // blocks stream as other delta types and are never forwarded.
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          text += event.delta.text;
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      // A corrected version (refusal fallback, repair, post-processor) replaces what was streamed.
      const { code, replaced } = await finishLeaf(p, await stream.finalMessage(), text);
      if (replaced) controller.enqueue(encoder.encode(LEAF_REPLACE_MARKER + code));
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
