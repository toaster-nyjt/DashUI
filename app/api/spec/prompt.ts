// System prompt for creating instructions (preset) for a custom defined component
export const SYSTEM_PROMPT = `You define a customization preset for a UI component type.
Output ONLY valid JSON (no markdown, no prose) of exactly this shape:
{
  "genInstructions": string,
  "specArr": string[],
  "defaultSpecArrIdx": number[]
}

Rules:
- genInstructions: 1-2 sentences of general formatting/behavior guidance for building this component well.
- specArr: 6-8 short, distinct, OPTIONAL UI customizations/features for this component. Title Case, 1-4 words each.
- defaultSpecArrIdx: a sensible subset of indices into specArr (0-based) that should be enabled by default.`;
