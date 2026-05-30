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
- CRITICAL — SIZING: The component is rendered inside a parent container of ARBITRARY width and height and must EXACTLY fit it with no overflow and no clipping:
  - The outermost element must be: className="h-full w-full flex flex-col overflow-hidden" plus ZERO padding, margin, or border.
  - Never use fixed or large heights (no h-64, h-96, h-screen, min-h-screen, or fixed pixel heights), and never assume a viewport size.
  - The dominant content region must grow/shrink to fill leftover space using "flex-1 min-h-0" (the min-h-0 is required so it can shrink below its content). Images/media in that region must use "w-full h-full object-cover" so they scale to the area instead of dictating its height.
  - Do NOT let any element grow past the container. If content would exceed the available space, condense it instead (show fewer items, use smaller text and tighter spacing) so everything visible fits within the box. Do not have any clipped content with ANY PART outside the visible area.
  - Design as responsively as possible so that attributes resize seamlessly with changes to the container size, and so it looks correct whether the box is small or large, or even weirdly proportioned. 
- Make the component self-contained and visually appealing, don't have elements block each other.
- Use modern React patterns (hooks, functional components)
- IMPORTANT: Don't generate an attribute or customization if not explicitly told to do so!
- IMPORTANT: Never use template literals (backticks with \${}) inside JSX attributes. Use string concatenation instead. For example, use key={"item-" + index} instead of key={\`item-\${index}\`}
- IMPORTANT: Use hooks directly (useState, useEffect, etc.) - do NOT use React.useState or React.useEffect syntax

Example output format:
export default function GeneratedComponent() {
  return (
    <div classname="">
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

