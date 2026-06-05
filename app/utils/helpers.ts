import { CompSpec, DefaultCompSpec } from "./spec";

// Strip markdown code fences from generated code
export function stripCodeFences(code: string): string {
  // Remove opening fence: ``` optionally followed by a language tag (tsx, json, ...)
  let stripped = code.replace(/^```[a-z]*\s*\n?/i, "");
  // Remove closing fence: ```
  stripped = stripped.replace(/\n?```\s*$/i, "");
  return stripped;
}

// Assembles the LLM instruction string from the current spec state of generated box and current default specs
export function buildInstructions(compSpec: CompSpec, defaultSpec: DefaultCompSpec[]): string {
  const def = defaultSpec.find((d) => d.name === compSpec.name); // Full spec found of compSpec's name in default spec
  if (!def) return '67'; // Unreachable, for ts type safety

  // Map the indexes of active customizations to the actual names of the customizations
  const active = compSpec.specArrIdx
    .map((i) => def.spec.specArr[i])
    .filter(Boolean);

  // Every customization the user did NOT choose, to be explicitly excluded.
  const excluded = def.spec.specArr.filter((_, i) => !compSpec.specArrIdx.includes(i));

  let out = `Create a ${def.name}. ${def.genInstructions}`; // General scaffolding
  // Tack on customization details
  if (active.length) out += ` Include these features: ${active.join('; ')}.`;
  if (excluded.length) out += ` Do NOT include the following features under any circumstances — they have been deliberately excluded and must not appear in any form: ${excluded.join('; ')}.`;

  return out;
}