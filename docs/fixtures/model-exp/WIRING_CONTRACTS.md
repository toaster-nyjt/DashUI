# Wiring contracts: the contract agent at Wire time

**Question:** can the contract agent (one typed contract per channel, made when Wire is pressed from both endpoints' current code) finish within 20s? Plan §0.1 set that as the condition for making contracts at Wire time.

**Setup:** `contract-run.cjs` through the real app code (`generateContracts`: `CONTRACT_SYSTEM_PROMPT`, `contractRequest`, `validateContracts`, 3 retries). Inputs: the latest run of 8 logged UIs, with their plan's channels (`buildChannels`) and each leaf's final code. 2 configs × 2 samples = 32 calls, 4 at a time. Outputs: `contracts/<task>.<cfg>.<n>.json`, `contracts/results.json`.

| UI (task) | Channels | Code read (tokens) |
|---|---|---|
| DJ Table 1790503859796 | 14 | ~23k |
| DJ Table 1790499847643 (pinned QA input) | 10 | ~26k |
| Cyberpunk 1790488443585 (most code) | 8 | ~34k |
| Cyberpunk 1790493337400 (pinned QA input) | 7 | ~24k |
| Synthesizer 1790505558905 (most channels) | 19 | ~29k |
| Radio 1790360963510 | 6 | ~12k |
| aerospace 1790357285132 | 8 | ~15k |
| Red Newspaper 1790508636151 | 6 | ~13k |

## Results

| | Opus 5 adaptive `low` | Opus 4.8 thinking off `max` |
|---|---|---|
| Valid in the end | 16/16 | 16/16 |
| Valid on the first try | 13/16 (3 unparseable JSON) | **16/16** |
| Time per call, median / max | 17.5s / 35.0s | **13.9s / 29.2s** |
| Over 20s | 7/16 | 5/16 |
| First attempt ≈ | 3.6s + 1.52s × channels | 3.2s + 1.34s × channels |
| Output per channel | ~200 tokens | ~165 tokens |
| Input (median) | ~29k tokens | ~29k tokens |
| state / event | 116 / 40 | 113 / 43 |

- **Time follows the channel count, not the code read.** The Cyberpunk UI with the most code (~34k tokens) took 13–16s; the 14-channel DJ took 23–26s and the 19-channel Synthesizer 28–35s. Both configs write ~100 tokens/s, so the output (the contracts) sets the time.
- **The 20s ceiling is about 12 channels on Opus 4.8** (about 11 on Opus 5). 7 of the 26 logged UIs have more (14–19; DJ and Synthesizer).
- **One outlier:** Red Newspaper (6 channels) took 21.1s once on Opus 4.8 against 12.7s for the other sample.
- **Unparseable answers (Opus 5 only, 3/16):** the raw text wasn't saved at the time. A re-run of the case that failed 2/2 (Radio, 2 samples, `contracts/radio-o5low-raw`) passed 2/2. `generateContracts` now keeps the raw text of a failed attempt.

## Contract content (read on the pinned DJ run, Opus 4.8)
- Continuous values are `state`: playhead/tempo to the waveform, levels to the mixer, the FX settings (with an `engaged` flag).
- One-off actions are `event`: waveform seeks, and Load to Deck (the track's metadata; no audio buffer or waveform arrays, which the description mentioned but no code holds).
- Units and ranges are in comments as asked (`level: number /* 0-1 */`, `wet: number /* 0-100 */`), and field names follow the code (`position`, `bpm`, `division`).

## Split per receiver (option 1, chosen 2026-09-27)

`generateContractsSplit` (`splitChannels`, `CONTRACT_MAX_PER_CALL = 8`): channels are grouped by receiver (a receiver's channels always share one call), packed into as few calls of ≤8 channels as possible (largest group into the lightest call), and all calls of a UI run at once. On all 26 logged plans: no channel lost, no receiver split, 19 → [7,6,6], 14 → [7,7], 15 → [8,7]. Run: `contract-run.cjs --split=8 --parallel=1`, Opus 4.8 thinking off, the 5 logged UIs with >8 channels × 2 samples; outputs in `contracts/split8/`.

| UI | Channels | Unsplit (above) | Split | Input tokens, unsplit → split |
|---|---|---|---|---|
| DJ Table 1790503859796 | 14 | 23.1, 23.3s | **16.5, 15.9s** | 27k → 52k |
| DJ Table 1790499847643 | 10 | 14.6, 15.3s | **10.8, 11.5s** | 30k → 50k |
| Synthesizer 1790505558905 | 19 | 29.2, 28.1s | **16.1, 18.0s** | 35k → 71k |
| Synthesizer 1790507124328 | 15 | — | **15.7, 15.2s** | → 55k |
| Y2K Synthesizer 1790508341396 | 15 | — | **19.0, 17.7s** | → 57k |

- **10/10 valid on the first try; 0/10 over 20s** (median 16.1s, max 19.0s).
- **The margin is thin:** 8-channel calls took 15–19s, and 6-channel calls varied 10.5–18.0s, so variance between calls, not the cap, sets the worst case. A lower cap would not reliably help.
- **Input roughly doubles**, since a component on channels in two calls is read by both. Output is unchanged.

## The whole Wire action (contracts, then one call per component), 2026-09-27

`wire-run.cjs` runs `runWire` (the `/api/wire` route's code) on a logged UI; `wire-probe.mjs` renders the result in headless Chrome with a recording in-page bus that relays like the app. Opus 4.8 thinking off for both steps. Outputs: `wiring/dj-7643/`, `wiring/cp-7400/` (wired code, `wire-run.json`, `wire-probe.json`, screenshots of the original and wired UI). 18 model calls in all (the user's limit for this step was 20).

| UI | Channels | Components | Total | Contracts | Slowest component | First try |
|---|---|---|---|---|---|---|
| DJ Table 1790499847643 | 10 | 7 | **56.4s** | 10.8s (2 calls) | 45.6s | 7/7 |
| Cyberpunk 1790493337400 | 7 | 6 | **74.5s** | 20.6s (1 call) | 53.9s | 6/6 |

- **Time:** the component echo sets it (4–6k output tokens each at ~100 tok/s), and the contract step adds 11–21s. Cyberpunk's contract call took 20.6s against 10.2–10.5s for the same UI earlier, so call-to-call variance is large.
- **Probe, DJ:** no render errors; 10/10 channels subscribed; 6/6 state senders emitted a correctly shaped payload on mount. Fed the contract example, 7/10 receivers visibly reacted. The other 3 are live streams the probe can't isolate (the deck→mixer levels drive meters that animate every 90ms; the mixer→master levels are re-sent every 90ms, overwriting the test payload). All 3 apply the payload to rendered state (read in the code), and a direct check showed the mixer's meters jump when a deck payload arrives (attribute text ~51.4k → ~52.4k chars, no overlap with the before-samples).
- **Probe, Cyberpunk:** no render errors; 7/7 subscribed; 5/7 visibly reacted, 1 animated. Two findings:
  - The Quest Journal sent its `state` channel to the map only from click handlers, so the map never learns the tracked quest on mount. `checkLeafWiring` now rejects a state channel sent only outside an effect (the prompt already said so). With the updated prompt, a re-wire of that component still did it on attempt 1; the check caught it and attempt 2 passed (2 calls).
  - Map → Journal is wired correctly but can't work: the map's quests are `q-heist`, `q-ghost`, `q-gig`, `q-monk` and the journal's `q1`…`q8`. Each leaf invents its own sample data. Open (see UI_GENERATOR §12).
- **Simulations:** components that received a value they used to simulate dropped the simulation (the waveform's playhead timer, the master's level timer), 2/2.
- **Check bug found and fixed:** with several `emit` overloads, TypeScript reports a payload mismatch on the whole call, not the argument, so the payload check missed it. It now counts errors anywhere in the emit call.
