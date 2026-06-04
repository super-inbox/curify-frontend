// Illustrator demo seed — drives app/[locale]/(public)/illustrator-demo/.
// MVP scope (locked 2026-06-04): sample-only reference (hand-draw.jpg) →
// 4 hero-only style variants pre-cached as PNGs → "scale" step calls
// Gemini live per style pick (3 variations on the same sketch). Patterns,
// prompt wording, and constraints are lifted verbatim from
// scripts/gen_client_illustrator_styles.cjs so the live output matches
// the pre-cached previews.

export type IllustratorStyle = {
  id: string;
  label: string;
  aesthetic: string;
  prompt: string;
  preview_image_url: string;
};

export type IllustratorDemoSeed = {
  reference_image_url: string;
  styles: IllustratorStyle[];
};

// ── Shared blocks ────────────────────────────────────────────────────────────

const SUBJECT_BLOCK = `
Subject — reference image top-row third sketch from the left: the long-eared mascot fused into a square four-legged bronze ritual ding (四足方鼎). Two tall tufted ears rise above the rim of the vessel, the front face of the ding bears the taotie mask (饕餮纹), the mascot's body sits inside the vessel, and the long curving tail drapes from the back over the side. Preserve this exact pose / topology / which-creature-is-fused-with-which-vessel relationship from the sketch. The mascot's body shows clean discrete fur shapes (no scribble noise); the eyes are round and innocent.

Authentic bronze ornament patterns required on every bronze surface: precise Shang/Zhou taotie mask (饕餮纹), thunder pattern (雷纹), kui-dragon pattern (夔龙纹). Each pattern must be a recognizable historical motif drawn cleanly — NO random AI scribble lines, NO nonsense fake-glyph filler.
`.trim();

const NO_SCAFFOLDING = `
ABSOLUTELY NO text in the image — no titles, no labels, no annotations, no callouts, no Chinese characters, no English captions, no MBTI badges, no module panels, no timeline strips, no information boxes. Just the hero subject on its background. The hero subject fills approximately 70% of the canvas. The background is decorative but unannotated. Square 1:1 aspect ratio, 4K resolution, direct image generation.
`.trim();

// ── 4 style variants ─────────────────────────────────────────────────────────

export const ILLUSTRATOR_STYLES: IllustratorStyle[] = [
  {
    id: "heritage-mineral",
    label: "Heritage Mineral",
    aesthetic: "ancient-book mineral-pigment Chinese cultural-heritage illustration",
    prompt: `
Style: Ancient-book mineral-pigment illustration in the tradition of Chinese 古籍图谱 / 故宫文物图录. The look is exquisite, retro, and reverent — like a hand-painted plate from a Qing-dynasty bronze-catalog folio.

Palette: traditional architectural-painting / ancient-book mineral pigments — malachite green (石绿), azurite blue (石青), cinnabar red (朱砂), mineral ochre, ink black, all on warm aged silk-paper background (绢本 cream).

Background: warm aged silk-paper field with a decorative classical Chinese border frame (回纹 + 雷纹 corner motifs), drawn cleanly. Faint scattered cloud-and-thunder pattern (云雷纹) wash in the background, at low opacity, drawn as discrete spirals not noise.

${SUBJECT_BLOCK}

${NO_SCAFFOLDING}
`.trim(),
    preview_image_url: "/illustrator-demo/preview-heritage-mineral.png",
  },
  {
    id: "ink-watercolor",
    label: "Ink & Watercolor",
    aesthetic: "exquisite Chinese ink-and-watercolor on aged silk paper with lattice border",
    prompt: `
Style: Elegant traditional Chinese ink-and-watercolor (水墨彩绘) illustration. The look matches a premium ink-painting plate — delicate soft ink wash, mineral pigment touches, fine brushwork.

Palette: ink black, soft mineral green, soft mineral red, light gold, on off-white aged silk-paper background (素绢 cream).

Background: off-white silk paper with a traditional Chinese lattice border (回字纹 / 万字纹) drawn cleanly around the edges. A soft watercolor wash of bronze-green and gold suggests atmosphere without competing with the subject. Faint distant 云雷纹 spirals at low opacity.

${SUBJECT_BLOCK}

${NO_SCAFFOLDING}
`.trim(),
    preview_image_url: "/illustrator-demo/preview-ink-watercolor.png",
  },
  {
    id: "qcute-watercolor",
    label: "Q-Cute Watercolor",
    aesthetic: "软萌Q版水彩 cute blind-box illustration with 国风 decoration",
    prompt: `
Style: 软萌Q版 (soft cute chibi proportions) watercolor illustration — the kind of art used on collectible blind-box (盲盒) packaging, fridge magnets, and 文创 product gift boxes. Large head, large innocent eyes, small body, charming and approachable. Soft watercolor texture but with clean confident outlines.

Palette: aged bronze green, warm bronze gold, pale rose, ivory, ink black outline, on soft pastel cream background.

Background: pastel cream field with 国风 decorative elements scattered around the subject — small 祥云 (auspicious cloud) shapes, small floral 缠枝 vines, faint 雷纹 spiral motifs, a soft circular halo behind the subject. A delicate traditional border frames the edges. Everything decorative is drawn cleanly as discrete shapes, not painterly noise.

The bronze ding still bears a recognizable taotie 饕餮纹 on its front face and 雷纹 on its body — even in Q-cute style, the patterns must remain authentic historical motifs, not random scribbles.

${SUBJECT_BLOCK}

${NO_SCAFFOLDING}
`.trim(),
    preview_image_url: "/illustrator-demo/preview-qcute-watercolor.png",
  },
  {
    id: "watercolor-sketch",
    label: "Watercolor Sketch",
    aesthetic: "clean watercolor + sketch hybrid in warm muted earth tones with decorative border",
    prompt: `
Style: Clean detailed watercolor-and-sketch hybrid illustration — confident pen-line outlines plus soft watercolor washes inside. The look matches a high-end educational publishing illustration or a cultural-heritage gift-book plate.

Palette: warm muted earth tones — terracotta, jade green, ochre yellow, indigo accent, ink black sketch outline, on aged cream paper background.

Background: aged cream paper with a decorative classical Chinese border (回纹 + 雷纹 corner motifs) framing the entire canvas. Faint watercolor wash of warm sepia / terracotta as atmosphere. Subtle 云雷纹 spirals at low opacity scattered across the field.

${SUBJECT_BLOCK}

${NO_SCAFFOLDING}
`.trim(),
    preview_image_url: "/illustrator-demo/preview-watercolor-sketch.png",
  },
];

export const ILLUSTRATOR_DEMO_SEED: IllustratorDemoSeed = {
  reference_image_url: "/illustrator-demo/hand-draw.jpg",
  styles: ILLUSTRATOR_STYLES,
};

export function getStyleById(id: string): IllustratorStyle | undefined {
  return ILLUSTRATOR_STYLES.find((s) => s.id === id);
}
