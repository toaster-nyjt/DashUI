# Prompt QA ledger

Findings from coherence reviews of the rendered prompts, with the decision on each. **A QA reviewer reads this first and does not re-report an entry marked fixed, kept or dismissed** unless the prompt text it quotes has changed since. In that case, say what changed.

**How to run a review:**
1. Render the prompts: `node docs/fixtures/prompt-qa-render.cjs --out=<dir>`. It writes the full system prompt and user message for 5 leaf cases, 4 primitive cases and the focal agent, from pinned runs.
2. Give a reviewer (a fresh subagent) that directory, the prompt rules in `AGENTS.md`, and this ledger.
3. Add the new findings and their decisions here.

## Review 1 — 2026-09-27

**Scope:** the focal-primitive switches (focal agent, primitive FOCAL POINT sentence, leaf focal lines), and leaves seeing only their own types. **Inputs:** DJ task-1790499847643, Cyberpunk task-1790493337400.

| # | Finding | Decision |
|---|---|---|
| 1 | The focal leaf's "as big as possible" conflicted with RESPOND TO BOTH AXES ("primitive boxes keep their rem sizes"). 1 of 4 focal decks gave the JogWheel a fixed `h-[20rem] w-[20rem]` box. | **Fixed.** Focal leaves get the `genAxesFocal` variant: the focal box is "a flex-1 or grid share, never a fixed rem size". Not yet measured. |
| 2 | "Render the other parts smaller" vs FILL THE CONTAINER ("let typography… scale UP"). | **Kept.** Low impact; the focal sentence only applies in focal leaves. |
| 3 | The focal type is applied to every use; the mixer came out asymmetric; different focal sets per leaf. | **Dismissed.** The asymmetry came from a test input (a feature set to `null` by hand). Per-leaf focal sets are correct: each leaf gets only the focal types it uses. Focal being type-wide is by design. |
| 4 | `<Knob />` examples in the primitive rules appear in leaves whose library has no Knob. | **Dismissed.** 0 of 68 logged leaves without a Knob used `<Knob>`. |
| 5 | HELD LAYERS ("need no slot of their own") vs PRIMITIVE SLOTS ("every primitive needs a definite box"), and held floors listed in SIZE BUDGET. | **Kept on purpose.** Being held belongs to a holder's contract, not the type: a type held in one component can be used on its own in another, so it keeps its floor and slot rule. 0/9 map leaves since the held-type change wrapped or budgeted markers. See UI_GENERATOR §14. |
| 6 | "Decoration" in YOU STILL AUTHOR vs BUILD EXACTLY ("NOTHING that is not") and "don't generate an attribute…". | **Dismissed.** Decoration plainly means ornament, not a feature; a definition would only restate the word. |
| 7 | Held primitive (MapMarker): a point element "at a fixed rem size, its FLOOR" vs SIZE-FLUID "fills whatever slot" / "scale to the LARGEST size". | **Kept.** Predates this review; switched in by the HELD variant, and markers render correctly (map probes). |
| 8 | The focal FLOORS clause says "compacted", but COMPACT acts on arrangement, not primitives. | **Kept.** User's wording; read together with the order, it means the focal primitive is protected. |
| 9 | "It fills a large space on screen" may inflate a focal primitive's FLOOR; every primitive already gets "detail fit for a large, standalone item". | **Kept.** Watch focal floors in runs. The focal JogWheel floor was 7×7rem; earlier runs gave 5–6rem. |
| 10 | The focal agent might return a feature name, since USED BY prints feature names. | **Dismissed.** `validateFocal` rejects non-type names with feedback; 0 invalid in 57 calls (variant D + app prompt, `focal-check.cjs`). |
| 11 | VISUAL GUIDELINES' spinning platter vs USE AS-IS "no wrappers". | **Kept.** Predates this review; comes from the style sheet. |

**Update 2026-09-27:** the focal agent now picks exactly 1 type. The plural focal wording in leaves (review 1, rows 1 and 8) can no longer trigger.
