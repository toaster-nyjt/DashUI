# Focal primitives — picking the 1 to 3 elements a UI is recognized by (2026-09-27)

**Goal.** Mark the primitives that carry a UI's visual identity (the DJ Table's jog wheels, a game HUD's map and avatar) so they can get different instructions: a higher-quality primitive prompt, and first claim on space in their leaf.

**Status (2026-09-27): built.** The focal route (`/api/focal`, `FOCAL_SYSTEM_PROMPT`, `validateFocal`), the primitive switch (`PRIM_INTRO_FOCAL`) and the leaf switches (intro sentence, PRIMITIVE FLOORS clause, SIZE BUDGET line) are in the app; see `docs/UI_GENERATOR.md` §14. Steps 2 and 3 below measure them.

## Why not a deterministic signal
Scored against hand labels over every logged run (19 runs, 314 types; script in the session scratchpad, reproducible from the logs):

| Signal | Marked | Precision | Recall |
|---|---|---|---|
| Used once, by one component | 138 | 0.17 | 0.53 |
| First feature of its component | 96 | 0.34 | 0.77 |
| Floor area ≥ 20 rem² (only known after primitive generation) | 104 | 0.34 | 0.81 |
| Holds other types | 5 | 1.00 | 0.12 |

Usage count is the wrong axis (the jog wheel is used twice), and contracts don't separate a JogWheel from a Knob.

## Setup
`docs/fixtures/focal-check.cjs`: a candidate `FOCAL_SYSTEM_PROMPT` (in the harness, not in `SKILLS.ts`) gets the task, each component's role, and the library (type, description, USED BY). Output `{"focal": [...]}`, validated (1 to 3 distinct library type names) with the first error fed back, 3 attempts; a held type is repaired to its holder. All 19 logged hoists × 2 samples per config.

Labels (agreed with the user): DJ = JogWheel (Waveform* borderline, not counted as extra); Cyberpunk = the map surface + the avatar type (Portrait*/BodyDiagram/ModelViewer) when the library has one; Aerospace = AttitudeIndicator only; Radio = the tuner (RotaryDial/FrequencyScale/TuningNeedle), StationArt borderline.

## Results (variant A: "Pick 1 to 3.")
| Config | Valid | All labels hit | Mean picks | Mean / max secs |
|---|---|---|---|---|
| Haiku 4.5 | 24/38 (picks component names; 15 retries) | 19 | 2.96 | 1.6 / 2.9 |
| Sonnet 5, thinking off, `low` | 38/38 | 33 | 3.00 | 1.5 / 2.4 |
| Opus 5, thinking off, `low` | 38/38 | 32 | 3.00 | 1.5 / 2.5 |
| Opus 5, adaptive, `low` | 38/38 | 33 | 3.00 | 1.6 / 2.8 |

- **Latency is a non-issue:** ~1.5s on every valid config (the output is ~20 tokens).
- **Recall is good:** JogWheel 16/16, AttitudeIndicator 2/2, the tuner 2/2 on every Opus/Sonnet config. Cyberpunk 23–25/30 (misses are mostly the avatar).
- **Every call picks exactly 3, so the third is filler:** Fader in 16/16 DJ picks, StatBar in 16–18/19 Cyberpunk picks, VerticalTape + MovingMap on aerospace. Every call has at least one extra.

## Count-sentence variants (Sonnet 5 off, Opus 5 low; 2 samples)
| Variant | Mean picks | Calls with extras |
|---|---|---|
| A "Pick 1 to 3." | 3.00 / 3.00 | 38 / 38 |
| B "Pick 1 to 3 — only as many as clearly pass both tests." | 3.00 / 3.00 | 38 / 36 |
| C "Pick 1 to 3 — most UIs have only 1 or 2." | 2.97 / 2.87 | 37 / 37 |

Wording on the count doesn't move it: the model fills the cap. Outputs: `model-exp/focal/run1`, `variant-B`, `variant-C` (`results.json` holds the prompt and every pick).

## Variant D: "Pick 1 or 2." (validator 1–2; chosen direction, 2026-09-27)
| Config | Valid | All labels hit | Calls with extras | Mean picks | Mean / max secs |
|---|---|---|---|---|---|
| Sonnet 5, thinking off | 38/38 | 25 | 25 | 1.95 | 1.5 / 2.9 |
| Opus 5, adaptive `low` | 38/38 | 26 | 28 | 2.00 | 1.6 / 2.8 |

Opus 5 `low` per task:
- **DJ:** JogWheel 16/16. The second pick is a waveform 8/16 (borderline) or Fader 8/16.
- **Aerospace:** AttitudeIndicator + VerticalTape 2/2.
- **Radio:** FrequencyScale + RotaryDial 2/2, no extras.
- **Cyberpunk:** a map pick in 16/18 calls (BodyDiagram, via the held-type repair, in the other 2). StatBar is the other pick in 18/18, so the avatar group was never hit when a map was picked.

Sonnet 5 is less stable: it missed the JogWheel 3/16 on DJ, although it picked the avatar more often (4 calls).

## App code check (`--variant=app`, Opus 5 `low`, 1 sample)
Same picks as variant D through `FOCAL_SYSTEM_PROMPT` + `focalRequest` + `validateFocal`: 19/19 valid, 2.00 picks, mean 1.8s (max 3.6s). Output: `focal/app`.

With no focal types, every leaf prompt the current code builds is byte-identical to the logged one (46/46 from the last 6 logs; the 7 others were written by older code in the same log). With a focal type, all 53 change.

## Step 2: primitives, focal switch off vs on
`prim-compare.cjs --focal=…` on Opus 5 `low`, 2 samples per arm, DJ (task-1790494291391) and Cyberpunk (task-1790493337400). Galleries: `focal/prims/*.html` + `.png`.

| Type | Secs off → on | Output tokens off → on |
|---|---|---|
| JogWheel | 27–31 → 33–34 | 3.0–3.3k → 3.5–3.7k |
| WaveformLane | 42–44 → 46–52 | 4.3–4.5k → 4.8–5.4k |
| Fader | 37–45 → 79–105 (one retry, syntax) | 3.6–4.2k → 7.3–9.6k |
| MapCanvas | 42–45 → 56–69 | 4.2–4.7k → 5.9–6.8k |
| StatBar | 21 → 33 | 2.1–2.2k → 3.3–3.4k |

- All pass the checks (one syntax retry on a focal Fader).
- **Latency:** the primitive stage waits for its slowest type. So a focal type that was already among the slowest adds directly to the stage: +10–25s for MapCanvas, and +35–60s when the Fader is picked.
- **Visuals:** the focal JogWheel adds finer markings and a dotted ring; it isn't clearly better than the off version, which already has a glow and needle. The focal Fader adds a full-height tick scale that crowds its slot. The gallery's StatBar samples render at value 0, so they show no fill.

## Step 3: leaves, focal lines off vs on
`leaf-compare.cjs` (budget layout, Opus 5 `low`) on every leaf that uses a focal pick. The primitives are the logged ones, so only the leaf prompt differs. Rendered at the real box sizes; each focal instance measured (`focal/leaves/*/*/s*.probe.json`, `.png`).

| Leaf (focal pick) | Off (2 samples) | On (2 samples) |
|---|---|---|
| Deck A / B (JogWheel) | diameter 14.3–17rem, 9–13% of the box | 20–24.1rem, 18–27% of the box |
| Deck A / B (Fader) | 11–25rem long | 13–29rem long |
| Mixer (Fader) | channel faders 8rem; crossfader 47–50rem | s1: channel faders 29rem. s2: channel faders 6rem, crossfader 11rem |
| Map (MapCanvas) | 66–86% of the box | 68–81% (already dominant) |
| Vitals HUD (StatBar) | 20–37rem × 1.3–1.4rem | 93rem (full width) × 1.4–2.6rem |
| Ripperdoc (StatBar) | 1.3–1.6rem tall | 4.5–4.6rem tall |

- **Overflow:** 1/12 leaves off (5rem horizontal) vs 2/12 on (5rem vertical inside the scroll body, 6rem horizontal).
- **Time:** leaf times are unchanged: 31–61s on, against 35–76s off.
- **Mixed picks:** the JogWheel grows as intended. A second pick that isn't a centrepiece (Fader, StatBar) also grows wherever it appears, and in one mixer sample the faders came out *smaller*.

## Cost summary (means of 2 samples, off → on)
| Primitive | Code (final .tsx chars) | Time (incl. retries) | Output tokens |
|---|---|---|---|
| Fader | 6,609 → 9,454 (+43%) | 41s → 92s (+126%; +93% without the retry) | +116% |
| JogWheel | 6,582 → 7,634 (+16%) | 29s → 33s (+15%) | +15% |
| WaveformLane | 8,967 → 10,044 (+12%) | 43s → 49s (+13%) | +15% |
| StatBar | 4,272 → 6,589 (+54%) | 21s → 33s (+56%) | +56% |
| MapCanvas | 8,412 → 12,149 (+44%) | 44s → 62s (+43%) | +43% |

Primitive stage (slowest type): DJ 44s → 92s (+106%), Cyberpunk 44s → 62s (+43%).

| Leaf | Code tokens | Time |
|---|---|---|
| Deck A | 4,507 → 4,109 (−9%) | 61s → 58s (−5%) |
| Central Mixer | 4,266 → 3,637 (−15%) | 55s → 59s (+7%) |
| Deck B | 4,041 → 4,138 (+2%) | 55s → 53s (−5%) |
| Night City Map | 4,379 → 4,569 (+4%) | 46s → 45s (−3%) |
| Vitals HUD | 3,393 → 2,959 (−13%) | 41s → 34s (−17%) |
| Ripperdoc Loadout | 5,687 → 4,027 (−29%) | 72s → 43s (−40%) |

## Leaf library scope (2026-09-27)
This is a related change, made while exploring per-leaf start. A leaf used to get the whole library, contracts and floors, with an invitation to reuse other types "for an incidental element".

A scan of the logged leaf code matched every `<Type` against the leaf's own types, meaning its features' types plus the types its surfaces hold. It found 615/615 own types, so the matcher works. 9 of 136 leaves (6.6%) used another type:
- Indicator ×5, StatusIndicator ×2, LevelMeter ×1, StatBar ×1;
- all small status lamps or meters used as decoration.

Leaves now get only their own types. Rebuilding a logged Deck A prompt changes it in exactly three places:
- the AUTHOR rule wording;
- 7 contracts removed from the library block;
- the "Other library primitives" line removed.
