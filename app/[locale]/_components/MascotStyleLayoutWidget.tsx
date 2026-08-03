"use client";

/**
 * Column-2 Style + Layout picker for the brand-ip-mascot-design-board template.
 * Both dropdowns default to the FIRST preset, which carries an empty prompt
 * fragment — i.e. "the current template style" — so an untouched widget
 * reproduces today's output exactly. Non-default choices append their fragment
 * to the generation prompt (folded into the brand param by the parent).
 */

export type Preset = { key: string; label: string; fragment: string };

export const MASCOT_STYLE_PRESETS: readonly Preset[] = [
  { key: "flat", label: "Flat mascot (template style)", fragment: "" },
  { key: "chibi", label: "Chibi / kawaii", fragment: "Render the mascot in a cute chibi / kawaii style with a big head and a small body." },
  { key: "3d", label: "3D render", fragment: "Render the mascot as a glossy, Pixar-style 3D character." },
  { key: "lineart", label: "Line art", fragment: "Render the mascot as clean, minimal monochrome line art." },
  { key: "clay", label: "Clay / collectible", fragment: "Render the mascot as a soft 3D clay-toy collectible figure." },
  { key: "retro", label: "Retro / vintage", fragment: "Render the mascot in a retro 1980s–90s vintage mascot style." },
];

export const MASCOT_LAYOUT_PRESETS: readonly Preset[] = [
  { key: "board", label: "Full design board (template layout)", fragment: "" },
  { key: "turnaround", label: "Turnaround + expressions", fragment: "Arrange the board as a character turnaround (front, side and back views) plus a 9-expression grid." },
  { key: "applications", label: "Brand application sheet", fragment: "Arrange the board as brand-application mockups — the mascot applied to merchandise, packaging and signage." },
  { key: "stickers", label: "Sticker sheet", fragment: "Arrange the mascot as a die-cut sticker sheet." },
  { key: "hero", label: "Single hero poster", fragment: "Present a single large hero poster of the mascot." },
];

/** Combined prompt suffix for the chosen style + layout (empty when both default). */
export function mascotPromptSuffix(styleKey: string, layoutKey: string): string {
  const s = MASCOT_STYLE_PRESETS.find((p) => p.key === styleKey)?.fragment ?? "";
  const l = MASCOT_LAYOUT_PRESETS.find((p) => p.key === layoutKey)?.fragment ?? "";
  return [s, l].filter(Boolean).join(" ").trim();
}

function Dropdown({
  label,
  value,
  onChange,
  presets,
}: {
  label: string;
  value: string;
  onChange: (key: string) => void;
  presets: readonly Preset[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-neutral-800">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer rounded-xl border border-neutral-200/80 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
      >
        {presets.map((p) => (
          <option key={p.key} value={p.key}>
            {p.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function MascotStyleLayoutWidget({
  styleKey,
  layoutKey,
  onStyle,
  onLayout,
}: {
  styleKey: string;
  layoutKey: string;
  onStyle: (key: string) => void;
  onLayout: (key: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3">
      <Dropdown label="Style" value={styleKey} onChange={onStyle} presets={MASCOT_STYLE_PRESETS} />
      <Dropdown label="Layout" value={layoutKey} onChange={onLayout} presets={MASCOT_LAYOUT_PRESETS} />
    </div>
  );
}
