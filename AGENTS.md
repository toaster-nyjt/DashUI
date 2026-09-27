<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project conventions (read before changing prompts, checks or pipeline code)

Full context: `docs/UI_GENERATOR.md` (§1 gotchas, §2 validation table, §14 primitive pipeline). Decision log with evidence: `docs/PRIMITIVE_HOIST_PLAN (1).md` §0.1.

## Writing prompt rules (`app/api/SKILLS.ts`)
- **Add as little as possible.** Every extra rule competes for attention in a long prompt. Extend an existing rule by a clause rather than adding a new rule.
- **Keep fixes general.** Never tie a rule to the primitive or component that failed, and don't use the failing case as the rule's example.
- **Never write a rule as an exception to another.** When a rule differs by case, swap in a variant chosen by a code switch (`*_BASE` / `*_PRIM`, `primitivePromptSwitches`), so each prompt reads as one consistent rule set.
- **Fix the old rule** when a new one contradicts it; never leave two rules that disagree.
- **Make a broken rule concrete before making it longer:** name the unit, show the exact JSX form.
- **State every deterministic check as a rule** in the prompt whose output it checks.
- Show the user the exact wording before changing a prompt, unless they've said to proceed.

## Deterministic when possible
- **Anything code can compute stays in code, not the model:** feature resolution (`resolveComponent`), channel ids (`buildChannels`), primitive usage and companions, held placement (`heldPlacement`), which prompt variant each agent gets. Decide from structured contracts, never from free text a model wrote.
- **Every model output passes a deterministic validator** that feeds the first error back and retries (see the §2 table in `docs/UI_GENERATOR.md`).
- **Prefer a deterministic repair over a retry when the fix is certain** (`repairSyntax`), and keep a repair only if the result verifiably passes.
- **A check that can't evaluate something skips rather than rejects**, so a checker limitation never costs a retry.
- **Fallbacks degrade instead of aborting the UI** (e.g. a dropped primitive type means its features are hand-built).

## Testing and deciding changes
- **Compare offline first, through the real app code** (the `docs/fixtures` harnesses, on pinned inputs), with more than one sample and with renders when the output is visual (`map-probe.mjs`, `leaf-map-probe.mjs`, `leaf-render.mjs`). Check every claim against the data before reporting it.
- **Present the numbers and a recommendation; the user decides** whether to switch.
- **Prompt QA after a prompt change:** render the prompts with `docs/fixtures/prompt-qa-render.cjs` and give a fresh subagent the renders, these rules and `docs/PROMPT_QA.md`. It must not re-report an entry already decided there unless the quoted text changed. Record every new finding and its decision in that ledger.
- **Document every change:**
  - the decision in plan §0.1;
  - the evidence in a `docs/fixtures/model-exp/*.md` report;
  - new harnesses and folders in `docs/fixtures/README.md`;
  - `docs/UI_GENERATOR.md` kept accurate, including the §2 validation table and the §13 run-log fields.
- **The user runs end-to-end tests and sends a task ID:** read `logs/task-<id>.jsonl`. One log can hold several runs of a task, so pick or pin one run before using it as input.

## Environment
- **pnpm, not npm.** Never run installs or touch `node_modules` without asking.
- **Scratch files go in the session scratchpad**, never under `app/`.
- **Fast Refresh re-runs paid generation.** Editing a client-imported file (`SKILLS.ts`, `helpers.ts`, `spec.ts`, components) while the dev server and a DashUI tab are open triggers it. Warn the user first.
- **Keep code comments terse**; rationale goes in `docs/UI_GENERATOR.md`.
