/**
 * API Route: BUILD. Generates ONE UI's primitives and leaves on the server, in one request, and
 * streams the results as they finish (NDJSON, one event per line):
 *   { type: "primitive", name, code, floor } | { type: "dropped", name }
 *   { type: "leaf", leafKey, code } | { type: "leaf-failed", leafKey, error } | { type: "done" }
 * Every primitive starts at once (generatePrimitive: checks + retries). Each leaf starts as soon
 * as all of its own types have passed or been dropped, with exactly the prompt the client would
 * build then (resolveComponent JSON with the type-mapped features; a dropped type -> null).
 * One request, so the browser's per-host connection limit never queues leaves.
 */
import { HoistResult, PrimitiveSet, XY } from "@/app/utils/spec";
import { derivePrimitiveUsage, derivePrimitiveCompanions, heldTypeNames, leafFeatures, leafLibrary, ownTypes } from "@/app/utils/helpers";
import { generatePrimitive } from "@/app/utils/primitiveGen";
import { generateLeaf } from "@/app/utils/leafGen";
import { runLog } from "@/app/utils/runLog";

type BuildLeaf = {
  leafKey: string;
  prompt: string;   // resolveComponent JSON WITHOUT primitives: features are the plain active names
  boxSize: XY;
};

export async function POST(req: Request) {
  const { task, hoist, style, focal = [], leaves, taskID } = await req.json() as {
    task: string;
    hoist: HoistResult;
    style: string;
    focal?: string[];
    leaves: BuildLeaf[];
    taskID?: number;
  };
  const t0 = Date.now();
  const set: PrimitiveSet = { hoist, code: {}, floors: {}, focal };
  const usage = derivePrimitiveUsage(hoist);
  const companions = derivePrimitiveCompanions(hoist);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: Record<string, unknown>) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));

      // One promise per type, settled when it passes or is dropped.
      const attempts: Record<string, number> = {};
      const settled: Record<string, Promise<void>> = Object.fromEntries(hoist.library.map((prim) => [prim.type, (async () => {
        const r = await generatePrimitive(task, prim, hoist.library, usage[prim.type], companions[prim.type], style, focal, taskID);
        attempts[prim.type] = r.attempts;
        if (r.code && r.floor) {
          set.code[prim.type] = r.code; set.floors[prim.type] = r.floor;
          send({ type: "primitive", name: prim.type, code: r.code, floor: r.floor });
        } else send({ type: "dropped", name: prim.type });
      })()]));

      const allPrims = Promise.all(Object.values(settled)).then(() => {
        const usable = Object.keys(set.code);
        runLog(taskID, "primitives:done", `${usable.length}/${hoist.library.length} type(s) usable in ${((Date.now() - t0) / 1000).toFixed(1)}s`,
          { usable, dropped: hoist.library.map((t) => t.type).filter((t) => !(t in set.code)), focal, held: Object.fromEntries(hoist.library.filter((t) => heldTypeNames(t).length).map((t) => [t.type, heldTypeNames(t)])), attempts, floors: set.floors });
      });

      // Each leaf waits only for its own types, then runs the shared leaf pipeline.
      const leafJobs = leaves.map(async (l) => {
        try {
          const spec = JSON.parse(l.prompt);
          const own = ownTypes(hoist, spec.name, spec.features);
          await Promise.all(own.map((t) => settled[t]).filter(Boolean));
          // A UI with no usable primitive yet builds the leaf as a plain component, as the
          // client did when no primitive set was stored.
          const hasPrims = Object.keys(set.code).length > 0;
          if (hasPrims) spec.features = leafFeatures(set, spec.name, spec.features);
          runLog(taskID, "leaf:ready", `${spec.name}: own types settled at ${((Date.now() - t0) / 1000).toFixed(1)}s`, { leafKey: l.leafKey, own });
          const code = await generateLeaf({
            prompt: JSON.stringify(spec), boxSize: l.boxSize, style, taskID, leafKey: l.leafKey,
            primitives: hasPrims ? { library: leafLibrary(set), floors: set.floors, focal } : undefined,
          });
          send({ type: "leaf", leafKey: l.leafKey, code });
        } catch (e) {
          const error = e instanceof Error ? e.message : String(e);
          runLog(taskID, "leaf:failed", `${l.leafKey}: ${error}; the box generates itself`, { leafKey: l.leafKey });
          send({ type: "leaf-failed", leafKey: l.leafKey, error });
        }
      });

      await Promise.all([allPrims, ...leafJobs]);
      runLog(taskID, "build:done", `primitives and ${leaves.length} leaves in ${((Date.now() - t0) / 1000).toFixed(1)}s`, {});
      send({ type: "done" });
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Transfer-Encoding": "chunked" } });
}
