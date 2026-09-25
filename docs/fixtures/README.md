# docs/fixtures — test inputs, saved model outputs, and harnesses

Evidence and tools behind the primitive pipeline (`docs/UI_GENERATOR.md` §14, decisions in `docs/PRIMITIVE_HOIST_PLAN (1).md` §0.1). Excluded from the TypeScript build (`tsconfig.json`), because some saved outputs are deliberately broken.

## Inputs

| File | What it is |
|---|---|
| `dj-table.components.json` | The canonical DJ Table plan (resolved components) |
| `dj-table.hoist.run1…run5-low.json` | Hoist outputs while the prompt was designed; **run5-low is canonical** |
| `dj-table.style.appearance-only.txt` | The appearance-only style sheet used by most tests |

The logged end-to-end runs in `/logs/task-<taskID>.jsonl` (gitignored) are the other input source. The newer harnesses read their real inputs from there.

## Harnesses (run the real app code)

All load app TypeScript through `lib/load.cjs` and read `CLAUDE_API_KEY` from `.env.local`. Each one spends API calls.

| Script | Tests |
|---|---|
| `hoist-check.cjs` | One hoist (`HOIST_SYSTEM_PROMPT` + `validateHoist`); `--in`, `--model`, `--effort` |
| `prim-compare.cjs` | Every hoisted type through the primitive prompt + `checkPrimitive`, with retries; `--only=Type,…` |
| `plan-check.cjs` | One plan (`PLAN_SYSTEM_PROMPT`) + connectivity, mirroring and naming checks |
| `leaf-compare.cjs` | A logged run's leaves through `buildLeafSystem` (`--budget=0/1`), post-processed like the route |
| `leaf-render.mjs` | Renders a leaf set at its real box sizes with the run's primitives; measures overflow |
| `build-gallery2.mjs` | Contract-driven gallery of a primitive set (every variant × 4 slot shapes); `--fit` picks the FitText source |
| `fit-regress.mjs` | FitText test cases + edge cases, measuring every span (old vs new FitText) |

**Earlier, reference-file based** (written before the app merge; they import `docs/SKILLS.primitives.reference.ts`): `hoist-run.mjs`, `prim-run.mjs`, `leaf-run.mjs`, `style-run.mjs`, `build-e2e.mjs`, `fittest.mjs`, `prompt-audit.mjs`, plus `slot-scan.cjs` (static min-zero / face-child scan) and `sanitize-leaf.cjs` (the original post-processor, ported to `app/utils/leafSanitizer.ts`).

## Saved outputs

| Folder | What it is |
|---|---|
| `primitives-run1…run6` | Primitive-generation cycles (run6: with floors; `_floors.json`) |
| `leaves-run1…run10*` | Leaf cycles during prompt design (`prim/` vs `base/` = with primitives vs hand-built; `-sanitized` = post-processed) |
| `model-exp/exp-*` | Leaf model sweep on 3 DJ leaves, 2 samples each (`A`/`B`): `c1` Opus 4.8 adaptive `xhigh`; `c2` Opus 5 adaptive `xhigh`; `o5h`/`o5m`/`o5l` Opus 5 adaptive `high`/`medium`/`low`; `o5off` Opus 5 thinking off `high`; `o48h` Opus 4.8 adaptive `high`; `s5m` Sonnet 5 `medium`; `h45` Haiku 4.5; `f51l` Fable 5.1 `low` |
| `model-exp/prims-pc-*` | Primitive model comparison (Opus 4.8 thinking off vs Opus 5 `low`, and a second Opus 5 run) |
| `model-exp/followup-fader`, `followup-jogwheel`, `followup-hoist` | Targeted re-tests of the prompt fixes |
| `model-exp/fittext-regression` | Old vs new FitText measurements |
| `model-exp/hoist-compare` | 12 hoists: Opus 4.8 vs Opus 5 on 3 plans |
| `model-exp/plan-compare` | 30 plans: 5 tasks × 3 configs × 2 |
| `model-exp/leaf-budget` | SIZE BUDGET prompt test on a logged run's 6 leaves (code, renders, overflow) |

## Reports

- `model-exp/PRIMITIVE_MODEL_COMPARISON.md` — primitive model choice, plus the FitText, Fader, SVG-id and placeholder fixes.
- `model-exp/HOIST_MODEL_COMPARISON.md` — hoist model choice.
- `model-exp/PLAN_MODEL_COMPARISON.md` — why the plan stays on Opus 4.8.
- `model-exp/LEAF_BUDGET_COMPARISON.md` — the SIZE BUDGET leaf prompt, and why thinking-off isn't a shortcut.
