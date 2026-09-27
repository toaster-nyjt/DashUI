// SERVER-ONLY: the contract agent for one UI (made when Wire is pressed), with the same
// validate-and-retry loop the other stages use (first failed check fed back).
import Anthropic from "@anthropic-ai/sdk";
import { CONTRACT_SYSTEM_PROMPT, contractRequest } from "@/app/api/SKILLS";
import { stripCodeFences, WireChannel } from "./helpers";
import { ChannelContract } from "./spec";
import { validateContracts } from "./contractChecks";
import { runLog, usageOf } from "./runLog";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export const CONTRACT_RETRIES = 3;

// Opus 4.8, thinking off: 16/16 valid first try, fastest (docs/fixtures/model-exp/WIRING_CONTRACTS.md).
export const CONTRACT_MODEL = { model: "claude-opus-4-8", max_tokens: 16000, thinking: { type: "disabled" }, output_config: { effort: "max" } } as const;
// A declined request regenerates once on Opus 5.
const REFUSAL_FALLBACK = { model: "claude-opus-5", max_tokens: 16000, thinking: { type: "adaptive" }, output_config: { effort: "low" } } as const;

type ModelConfig = Omit<Anthropic.MessageCreateParamsNonStreaming, "messages" | "system">;
type Attempt = { secs: number; inTok?: number; outTok?: number; stop?: string | null; error?: string; raw?: string };

// Time is ~1.3s per channel written, so a call gets at most this many (~14s).
export const CONTRACT_MAX_PER_CALL = 8;

// Splits channels into as few calls as possible of at most `max` channels, keeping every
// channel into the same receiver in one call (so its inputs get consistent shapes). A
// receiver with more than `max` stays whole. Largest group first, into the lightest call.
export function splitChannels(channels: WireChannel[], max = CONTRACT_MAX_PER_CALL): WireChannel[][] {
  const byTo = new Map<string, WireChannel[]>();
  for (const c of channels) byTo.set(c.to, [...(byTo.get(c.to) ?? []), c]);
  const groups = [...byTo.values()].sort((a, b) => b.length - a.length);
  const calls: WireChannel[][] = Array.from({ length: Math.max(1, Math.ceil(channels.length / max)) }, () => []);
  for (const g of groups) {
    const fits = calls.filter((c) => c.length + g.length <= max);
    const target = (fits.length ? fits : calls).reduce((a, b) => (b.length < a.length ? b : a));
    if (!fits.length && target.length) calls.push(g); else target.push(...g);
  }
  return calls.filter((c) => c.length);
}

// The contract agent for a whole UI: one generateContracts call per split, in parallel. Returns
// every contract that passed; a split that never passes leaves only its own channels without one.
export async function generateContractsSplit(channels: WireChannel[], components: { name: string; code: string; role?: string }[], taskID?: number, model: ModelConfig = CONTRACT_MODEL as ModelConfig, max = CONTRACT_MAX_PER_CALL):
  Promise<{ contracts: ChannelContract[]; failed: WireChannel[]; calls: { channels: number; attempts: Attempt[]; error?: string }[] }> {
  const splits = splitChannels(channels, max);
  const results = await Promise.all(splits.map((s) => generateContracts(s, components, taskID, model)));
  return {
    contracts: results.flatMap((r) => r.contracts ?? []),
    failed: splits.filter((_, i) => !results[i].contracts).flat(),
    calls: results.map((r, i) => ({ channels: splits[i].length, attempts: r.attempts, error: r.error })),
  };
}

// Up to CONTRACT_RETRIES attempts. Returns the contracts, or the last error (the caller then
// wires without contracts), plus every attempt's time and tokens.
export async function generateContracts(channels: WireChannel[], components: { name: string; code: string; role?: string }[], taskID?: number, model: ModelConfig = CONTRACT_MODEL as ModelConfig):
  Promise<{ contracts?: ChannelContract[]; error?: string; attempts: Attempt[] }> {
  const attempts: Attempt[] = [];
  let previousError: string | undefined;
  for (let n = 1; n <= CONTRACT_RETRIES; n++) {
    const t0 = Date.now();
    try {
      const retryNote = previousError ? `\n\nYour previous attempt was REJECTED: ${previousError}\nReturn the full corrected JSON.` : "";
      const request = { system: CONTRACT_SYSTEM_PROMPT, messages: [{ role: "user" as const, content: contractRequest(channels, components) + retryNote }] };
      let msg = await anthropic.messages.stream({ ...model, ...request }).finalMessage();
      if (msg.stop_reason === "refusal") {
        console.error(`[contracts] refusal; regenerating on ${REFUSAL_FALLBACK.model}`, msg.stop_details ?? "");
        msg = await anthropic.messages.stream({ ...REFUSAL_FALLBACK, ...request }).finalMessage();
      }
      const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
      let error: string | undefined, contracts: ChannelContract[] | undefined;
      if (msg.stop_reason === "refusal") error = "The model declined to write contracts.";
      else {
        try { ({ contracts, error } = validateContracts(JSON.parse(stripCodeFences(raw.trim())), channels)); }
        catch { error = `Your output could not be parsed. Return ONLY the JSON object {"contracts": [...]}.`; }
      }
      const a = { secs: (Date.now() - t0) / 1000, ...usageOf(msg), error, raw: error ? raw : undefined };
      attempts.push(a);
      runLog(taskID, "contracts", `${contracts ? contracts.length + " contract(s)" : "REJECTED — " + error?.slice(0, 120)}${previousError ? " (retry)" : ""}`, { channels, previousError, contracts, ...a, raw });
      if (contracts) return { contracts, attempts };
      previousError = error;
    } catch (e) {
      previousError = e instanceof Error ? e.message : String(e);
      attempts.push({ secs: (Date.now() - t0) / 1000, error: previousError });
      runLog(taskID, "contracts:errored", `attempt ${n}/${CONTRACT_RETRIES}: ${previousError}`, {});
    }
  }
  return { error: previousError, attempts };
}
