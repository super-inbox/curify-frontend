export type TemplateParameter = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "daterange";
  placeholder?: string | string[];
  options?: string[];
};

export type NanoTemplateForDetail = {
  template_id: string;
  base_prompt: string;
  parameters: TemplateParameter[];
  topics?: string[];
  batch?: boolean;
  allow_generation?: boolean;
};

/**
 * Replace {param} placeholders in base prompt
 */
export function fillPrompt(basePrompt: string, params: Record<string, any>) {
  let prompt = basePrompt || "";

  for (const [key, value] of Object.entries(params || {})) {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    prompt = prompt.replace(regex, String(value ?? ""));
  }

  return prompt;
}

/**
 * Normalize placeholder values
 * Supports:
 *  - string
 *  - string[]
 */
export function normalizePrefills(placeholder?: string | string[]) {
  if (!placeholder) {
    return {
      displayPlaceholder: "",
      candidates: [] as string[],
    };
  }

  if (Array.isArray(placeholder)) {
    const candidates = placeholder.filter(
      (x) => typeof x === "string" && x.trim() !== ""
    );

    return {
      displayPlaceholder: candidates[0] ?? "",
      candidates,
    };
  }

  return {
    displayPlaceholder: placeholder,
    candidates: [] as string[],
  };
}