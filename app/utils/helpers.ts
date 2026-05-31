// Strip markdown code fences from generated code
export function stripCodeFences(code: string): string {
  // Remove opening fence: ``` optionally followed by a language tag (tsx, json, ...)
  let stripped = code.replace(/^```[a-z]*\s*\n?/i, "");
  // Remove closing fence: ```
  stripped = stripped.replace(/\n?```\s*$/i, "");
  return stripped;
}
