/**
 * API Route: WIRE (the right-click Wire action). Given every component of ONE generated UI
 * (name + current code + role) and its deterministic CHANNELS, makes a typed contract per channel
 * (contract agent, split per receiver), then wires each component on its own call, in parallel,
 * and streams the results as NDJSON, one event per line:
 *   { type: "contracts", contracts, failed } | { type: "leaf", name, code } | { type: "leaf-failed", name, error } | { type: "done" }
 * The bus itself is injected by Preview.tsx and relayed between the UI's iframes by SpatialGrid.
 */
import { WireChannel } from "@/app/utils/helpers";
import { runWire } from "@/app/utils/wireGen";

export async function POST(req: Request) {
  const { components, channels, taskID } = await req.json() as {
    components: { name: string; code: string; role?: string }[];
    channels: WireChannel[];
    taskID?: number;
  };
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: Record<string, unknown>) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        await runWire(components, channels, taskID, send);
      } catch (e) {
        send({ type: "error", error: e instanceof Error ? e.message : String(e) });
      }
      send({ type: "done" });
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Transfer-Encoding": "chunked" } });
}
