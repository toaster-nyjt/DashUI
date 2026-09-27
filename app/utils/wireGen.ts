// SERVER-ONLY: the Wire action for one UI. Contracts first (generateContractsSplit), then every
// component on a contracted channel is wired by its own call, all in parallel, each checked
// (checkLeafWiring) and retried on its own. Used by /api/wire and docs/fixtures/wire-run.cjs.
import Anthropic from "@anthropic-ai/sdk";
import { WIRE_SYSTEM_PROMPT, wireRequest, WireSpec } from "@/app/api/SKILLS";
import { extractComponentCode, WireChannel } from "./helpers";
import { ChannelContract } from "./spec";
import { generateContractsSplit } from "./contractGen";
import { checkLeafWiring } from "./wireChecks";
import { repairSyntax } from "./syntaxRepair";
import { runLog, usageOf } from "./runLog";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export const WIRE_RETRIES = 3;

// Opus 4.8, thinking off: the whole budget goes to echoing the component.
const WIRE_MODEL = { model: "claude-opus-4-8", max_tokens: 32000, thinking: { type: "disabled" }, output_config: { effort: "max" } } as const;
// A declined request regenerates once on Opus 5.
const REFUSAL_FALLBACK = { model: "claude-opus-5", max_tokens: 64000, thinking: { type: "adaptive" }, output_config: { effort: "low" } } as const;

type Component = { name: string; code: string; role?: string };
type Attempt = { secs: number; inTok?: number; outTok?: number; stop?: string | null; error?: string };

// Wires one component. Up to WIRE_RETRIES attempts; returns the passing code or the last error
// (the component then stays unwired).
export async function wireLeaf(component: Component, sends: WireSpec[], receives: WireSpec[], taskID?: number):
  Promise<{ code?: string; error?: string; attempts: Attempt[] }> {
  const attempts: Attempt[] = [];
  let previousError: string | undefined;
  for (let n = 1; n <= WIRE_RETRIES; n++) {
    const t0 = Date.now();
    try {
      const retryNote = previousError ? `\n\nYour previous attempt was REJECTED: ${previousError}\nReturn the full corrected component.` : "";
      const request = { system: WIRE_SYSTEM_PROMPT, messages: [{ role: "user" as const, content: wireRequest(component, sends, receives) + retryNote }] };
      let msg = await anthropic.messages.stream({ ...WIRE_MODEL, ...request }).finalMessage();
      if (msg.stop_reason === "refusal") {
        console.error(`[wire] ${component.name}: refusal; regenerating on ${REFUSAL_FALLBACK.model}`, msg.stop_details ?? "");
        msg = await anthropic.messages.stream({ ...REFUSAL_FALLBACK, ...request }).finalMessage();
      }
      const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
      const extracted = extractComponentCode(raw);
      const repaired = repairSyntax(extracted);
      const code = repaired?.code ?? extracted;
      const errors = msg.stop_reason === "refusal" ? ["The model declined to wire this component."] : checkLeafWiring(code, sends, receives);
      if (msg.stop_reason === "max_tokens") errors.unshift("the output was cut off before the component was finished");
      const a = { secs: (Date.now() - t0) / 1000, ...usageOf(msg), error: errors[0] };
      attempts.push(a);
      runLog(taskID, "wire:leaf", `${component.name}: ${errors.length ? "REJECTED — " + errors[0].slice(0, 120) : "ok"}${previousError ? " (retry)" : ""}`,
        { component: component.name, sends: sends.map((s) => s.channel.id), receives: receives.map((s) => s.channel.id), previousError, errors, syntaxRepairs: repaired?.repairs.length ? repaired.repairs : undefined, code, ...a });
      if (!errors.length) return { code, attempts };
      previousError = errors[0];
    } catch (e) {
      previousError = e instanceof Error ? e.message : String(e);
      attempts.push({ secs: (Date.now() - t0) / 1000, error: previousError });
      runLog(taskID, "wire:errored", `${component.name} attempt ${n}/${WIRE_RETRIES}: ${previousError}`, {});
    }
  }
  return { error: previousError, attempts };
}

export type WireEvent =
  | { type: "contracts"; contracts: ChannelContract[]; failed: string[] }
  | { type: "leaf"; name: string; code: string }
  | { type: "leaf-failed"; name: string; error?: string };

// The whole Wire action: contracts, then every component with a contracted channel, in parallel.
// A channel without a contract, or whose end failed, is left unwired.
export async function runWire(components: Component[], channels: WireChannel[], taskID: number | undefined, onEvent: (e: WireEvent) => void) {
  const t0 = Date.now();
  const c = await generateContractsSplit(channels, components, taskID);
  onEvent({ type: "contracts", contracts: c.contracts, failed: c.failed.map((f) => f.id) });
  runLog(taskID, "wire:contracts", `${c.contracts.length}/${channels.length} channel(s) contracted in ${((Date.now() - t0) / 1000).toFixed(1)}s (${c.calls.length} call(s))`,
    { contracts: c.contracts, failed: c.failed.map((f) => f.id), calls: c.calls.map((x) => ({ channels: x.channels, secs: x.attempts.map((a) => a.secs), error: x.error })) });

  const byId = new Map(c.contracts.map((k) => [k.id, k]));
  const specs: WireSpec[] = channels.filter((ch) => byId.has(ch.id)).map((ch) => ({ channel: ch, contract: byId.get(ch.id)! }));
  const leaves = components.map((comp) => ({ comp, sends: specs.filter((s) => s.channel.from === comp.name), receives: specs.filter((s) => s.channel.to === comp.name) }))
    .filter((l) => l.sends.length || l.receives.length);
  const results = await Promise.all(leaves.map(async (l) => {
    const r = await wireLeaf(l.comp, l.sends, l.receives, taskID);
    onEvent(r.code ? { type: "leaf", name: l.comp.name, code: r.code } : { type: "leaf-failed", name: l.comp.name, error: r.error });
    return { name: l.comp.name, ...r };
  }));
  const failed = results.filter((r) => !r.code).map((r) => r.name);
  // A channel is half-open when one of its ends failed: the other end is wired but unanswered.
  const halfOpen = specs.filter((s) => failed.includes(s.channel.from) !== failed.includes(s.channel.to)).map((s) => s.channel.id);
  runLog(taskID, "wire:done", `${results.length - failed.length}/${results.length} component(s) wired in ${((Date.now() - t0) / 1000).toFixed(1)}s${halfOpen.length ? `, ${halfOpen.length} half-open channel(s)` : ""}`,
    { failed, halfOpen, secs: (Date.now() - t0) / 1000 });
  return { contracts: c, results, failed, halfOpen, secs: (Date.now() - t0) / 1000 };
}
