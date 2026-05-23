/**
 * Standard API route location that generates React components using Claude
 */
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert React developer. Generate a single React functional component based on the user's request.

Rules:
- Output ONLY the React component code, no explanations or markdown
- Use TypeScript with proper types
- Use Tailwind CSS for all styling
- The component should be a default export named "GeneratedComponent"
- Do not include any imports - assume React hooks (useState, useEffect, useRef, useMemo, useCallback, etc.) are already in scope and can be used directly
- Make the component self-contained and visually appealing
- Use modern React patterns (hooks, functional components)
- IMPORTANT: Never use template literals (backticks with \${}) inside JSX attributes. Use string concatenation instead. For example, use key={"item-" + index} instead of key={\`item-\${index}\`}
- IMPORTANT: Use hooks directly (useState, useEffect, etc.) - do NOT use React.useState or React.useEffect syntax

Example output format:
export default function GeneratedComponent() {
  return (
    <div className="p-4">
      {/* component content */}
    </div>
  );
}`;

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
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
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

