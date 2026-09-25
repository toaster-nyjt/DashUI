/**
 * API Route: LOG (dev only). Lets the client add its own events — validation verdicts,
 * exhausted retries, dropped primitives, stage timings — to the same run log the routes
 * write (app/utils/runLog.ts), so one file holds the whole generated UI.
 */
import { runLog } from "@/app/utils/runLog";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 204 });
  const { taskID, stage, summary, data } = await req.json() as {
    taskID?: number; stage: string; summary: string; data?: Record<string, unknown>;
  };
  runLog(taskID, stage, summary, data ?? {});
  return new Response(null, { status: 204 });
}
