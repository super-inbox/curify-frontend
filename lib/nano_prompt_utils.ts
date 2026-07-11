export type TemplateParameter = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "daterange" | "language_pair";
  placeholder?: string | string[];
  options?: string[];
};

export type ExistingExample = {
  id: string;
  params: Record<string, string>;
};

export type NanoTemplateForDetail = {
  template_id: string;
  base_prompt: string;
  parameters: TemplateParameter[];
  topics?: string[];
  batch?: boolean;
  allow_generation?: boolean;
  // image-to-image templates: the user must upload a reference image before
  // generating. When true, ReproduceTemplateSection shows the image upload UI
  // and gates Generate on a reference image being present.
  requires_image_upload?: boolean;
  // Template archetype — "creation" (default; user fills params + generates
  // their own variant) vs "consumption" (we publish a fresh output the user
  // just looks at; daily recap, news event, scheduled standings, etc.).
  // ReproduceTemplateSection collapses the parameter form into a customize-
  // and-regenerate disclosure for consumption templates and leads with a
  // banner pointing at the latest published output above. See memory
  // feedback_creation_vs_consumption_templates.md for the full distinction.
  archetype?: "creation" | "consumption";
  // Template-level intro/demo video (relative CDN path). When present, the
  // column-3 workbench shows a zero-cost "Watch video" tile that reveals it.
  intro_video_url?: string;
  existingExamples?: ExistingExample[];
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