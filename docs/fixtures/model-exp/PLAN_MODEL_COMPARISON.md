# Plan: Opus 4.8 `medium` vs Opus 5 `low` / `medium` (all adaptive thinking)

**Decision:** keep the plan on Opus 4.8, adaptive, `medium` (the current config).

Run 2026-09-25, to see whether the plan (then 64–75s in end-to-end runs) could be shortened the way the hoist was.

## Setup

- **Tasks (5):**
  - "DJ Table"
  - "I want to listen to music"
  - "Build me a checkout page for an online store"
  - "Smart home control panel"
  - "Flight avionics dashboard"
- **Area:** each task at 2497×1276px, the full window of the logged end-to-end runs.
- **Samples:** 2 per config per task, 30 plans in total.
- **Code:** the real `PLAN_SYSTEM_PROMPT` and the plan route's user message, through `docs/fixtures/plan-check.cjs`. Outputs are in `plan-compare/`.
- **Automatic checks:**
  - `validateConnectivity`, the app's retry gate;
  - mirrored edges (A targets B ⇔ B lists A as an effector);
  - name format and uniqueness;
  - every feature enabled by default;
  - feature names of 1–4 words.

## Results (means over 10 plans each)

| | Opus 4.8 `medium` (current) | Opus 5 `low` | Opus 5 `medium` |
|---|---|---|---|
| **Time** | **43s** (31–77) | 50s (36–68) | 65s (42–81) |
| Output tokens | 3.6k | 4.3k | 5.8k |
| Output speed | 84 tok/s | 87 tok/s | 88 tok/s |
| Components | 5.2 | 6.1 | 6.7 |
| **Features** | **39** (7.6 per component) | 63 (10.2 per component) | 74 (10.9 per component) |
| Connections | 5.9 | 11.9 | 11.5 |
| Failed connectivity (would retry) | **0/10** | 1/10 | 0/10 |
| Unmirrored edges | **0/10** | 4/10 | 0/10 |

Feature names over 4 words turned up in all three configs (for example "Load To Deck A Button"), and don't matter.

## Reading

- **Opus 5 isn't faster here.** All three configs write about 85 tokens/s, so plan time follows plan size, and Opus 5 writes bigger plans.
- **Its plans are more complete, not padded.** Opus 5 used 60–90% more features and twice the connections. For example:
  - its DJ decks add beat-jump, key display and loop sizes;
  - its checkout adds a progress stepper, cart review, saved cards and gift cards.
  - Only a little of the extra is decoration ("Platter Artwork", "Security Badges").
- **Bigger plans slow the stages after the plan.** More features make leaves and the primitive library bigger, and the leaf stage, already the slowest, is set by the largest leaf. Switching would move time from the plan into the leaves.
- **Opus 5 `low` also broke the plan rules:** 4/10 plans with unmirrored edges, and 1/10 with a connection to a component that doesn't exist (a retry in the app). Opus 5 `medium` was clean, but the slowest.

## Summary

Opus 4.8 `medium` gave the fastest plans, the most consistent connectivity, and the leanest downstream load. Opus 5's richer plans would be a product decision (fuller UIs at the cost of latency), not a speed-up.
