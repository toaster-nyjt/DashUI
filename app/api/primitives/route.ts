/**
 * API Route: PRIMITIVES. Generates EVERY type of ONE generated UI's primitive library, in that
 * UI's style, all in parallel on the server, each with its own validate-and-retry loop
 * (generatePrimitive). One request for the whole stage, so the browser's per-host connection
 * limit never queues types behind each other. Returns the types that passed (code + floor);
 * a type that never passed is left out, and the caller hands its features to leaves as null.
 */
import { HoistResult, PrimitiveFloor } from "@/app/utils/spec";
import { derivePrimitiveUsage } from "@/app/utils/helpers";
import { generatePrimitive } from "@/app/utils/primitiveGen";
import { runLog } from "@/app/utils/runLog";

export async function POST(req: Request) {
  const { task, hoist, style, taskID } = await req.json() as {
    task: string;
    hoist: HoistResult;
    style: string;   // the UI's token sheet (VISUAL GUIDELINES)
    taskID?: number;
  };
  const t0 = Date.now();

  const usage = derivePrimitiveUsage(hoist);
  const results = await Promise.all(hoist.library.map(async (prim) =>
    [prim.type, await generatePrimitive(task, prim, usage[prim.type], style, taskID)] as const));

  const code: Record<string, string> = {};
  const floors: Record<string, PrimitiveFloor> = {};
  for (const [type, r] of results) if (r.code && r.floor) { code[type] = r.code; floors[type] = r.floor; }
  const dropped = results.filter(([, r]) => !r.code || !r.floor).map(([type]) => type);

  runLog(taskID, "primitives:done", `${Object.keys(code).length}/${hoist.library.length} type(s) usable in ${((Date.now() - t0) / 1000).toFixed(1)}s`,
    { usable: Object.keys(code), dropped, attempts: Object.fromEntries(results.map(([t, r]) => [t, r.attempts])), floors });

  return Response.json({ code, floors });
}
