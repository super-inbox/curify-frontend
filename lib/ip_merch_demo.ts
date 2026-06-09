// IP-merch demo seed — drives app/[locale]/(public)/ip-merch-demo/.
//
// Factory-operator-facing demo: the 4-template Curify stack from
// /blog/ip-merch-design-ai-workflow (shipped 2026-06-08). One IP
// brief → 4 sequential stages of merch-design output, narrating
// "brand → series → SKU" ontology in 4 concrete outputs.
//
// MVP scope (locked 2026-06-10): tour walkthrough using the 4 hero
// examples from the blog — graduation alpaca / empress cow cat /
// busan boogi duck / bronze rabbit qingqing — each at its matching
// template stage. NO live Gemini generation in MVP; everything is
// pre-rendered and shipped in /public/images/nano_insp/. Same noindex
// pitch-mode surface as /illustrator-demo and /progseo-demo.
//
// V2 would add: "run your own IP brief" text input → live Gemini call
// on stage 1 → user picks the locked character sheet → stages 2-4
// fan out cached or live. Not in MVP — reactions first.

export type IpMerchStage = {
  /** 1..4 — order in the workflow narrative */
  order: number;
  /** Internal id for tracking + future API wiring */
  id: string;
  /** Step label shown above the image */
  step_label: string;
  /** Curify template id this stage maps to (blog source of truth) */
  template_id: string;
  /** IP example used for this stage in the MVP walkthrough */
  ip_info: string;
  /** Human caption describing what this template produces */
  template_caption: string;
  /** What the factory operator gets at this stage — value claim */
  operator_outcome: string;
  /** Full-size rendered example image (in /public/images/nano_insp/) */
  image_url: string;
  /** Preview / thumbnail image */
  preview_image_url: string;
};

export type IpMerchDemoSeed = {
  /** Hero pitch shown at the top of the page */
  hero: {
    title: string;
    subtitle: string;
    workflow_summary: string;
  };
  /** 4 sequential stages — order is load-bearing */
  stages: IpMerchStage[];
  /** Bottom-of-page CTA to outbound conversation */
  cta: {
    primary_label: string;
    primary_href: string;
    secondary_label: string;
    secondary_href: string;
    closing_line: string;
  };
};

export const IP_MERCH_DEMO_SEED: IpMerchDemoSeed = {
  hero: {
    title: "IP-merch design workflow — one brief, four stages, full SKU family",
    subtitle:
      "Walk one IP through the four Curify templates that turn a character brief into a retail-shelf-ready merch family. Brand → series → SKU, locked at every stage.",
    workflow_summary:
      "These four stages are the same engine we run with paid factory customers. Each stage takes the previous stage's locked output as its constraint, so the illustrator's hand stays consistent from the character sheet through to the gift-box mockup. Below is one walkthrough per stage, using the IP example from our 2026-06-08 case study.",
  },
  stages: [
    {
      order: 1,
      id: "character-sprite-emoji-sheet",
      step_label: "Stage 1 — Lock the character canon",
      template_id: "template-ip-character-sprite-emoji-sheet",
      ip_info: "graduation alpaca",
      template_caption:
        "IP Character Sprite + Emoji Sheet — 12-pose action library across a single grid.",
      operator_outcome:
        "Character canon locked. Every later stage references this sheet as the structural source, so face, proportions, and silhouette stay consistent across the entire SKU family.",
      image_url:
        "/images/nano_insp/template-ip-character-sprite-emoji-sheet-graduation-alpaca.jpg",
      preview_image_url:
        "/images/nano_insp_preview/template-ip-character-sprite-emoji-sheet-graduation-alpaca-prev.jpg",
    },
    {
      order: 2,
      id: "emoji-sticker-sheet-poster",
      step_label: "Stage 2 — Distribution-ready pack",
      template_id: "template-ip-emoji-sticker-sheet-poster",
      ip_info: "empress cow cat",
      template_caption:
        "IP Emoji Sticker Sheet Poster — 16-piece WeChat-standard distribution pack.",
      operator_outcome:
        "Sticker pack ready for the channels that drive top-of-funnel discovery. The 16-piece WeChat layout matches the platform's distribution rules so the pack ships day-one, not after a re-cut.",
      image_url:
        "/images/nano_insp/template-ip-emoji-sticker-sheet-poster-empress-cow-cat.jpg",
      preview_image_url:
        "/images/nano_insp_preview/template-ip-emoji-sticker-sheet-poster-empress-cow-cat-prev.jpg",
    },
    {
      order: 3,
      id: "gift-box-stationery-set-mockup",
      step_label: "Stage 3 — Retail-shelf mockup",
      template_id: "template-ip-gift-box-stationery-set-mockup",
      ip_info: "busan boogi duck",
      template_caption:
        "IP Gift Box Stationery Set Mockup — retail-shelf gift box + matching stationery family.",
      operator_outcome:
        "Channel-ready mockup. Use it on the licensee pitch deck the same day the IP brief lands — buyer sees the gift-box first, not a character study with no commercial framing.",
      image_url:
        "/images/nano_insp/template-ip-gift-box-stationery-set-mockup-busan-boogi-duck.jpg",
      preview_image_url:
        "/images/nano_insp_preview/template-ip-gift-box-stationery-set-mockup-busan-boogi-duck-prev.jpg",
    },
    {
      order: 4,
      id: "creative-cultural-goods-mockup-set",
      step_label: "Stage 4 — Full SKU family",
      template_id: "template-ip-creative-cultural-goods-mockup-set",
      ip_info: "bronze rabbit qingqing",
      template_caption:
        "IP Creative Cultural Goods Mockup Set — 5+ merch surface designs rendered together.",
      operator_outcome:
        "Full SKU family in one render — mug, tote, sticker sheet, pin set, packaging. This is the moment the licensing deck stops being a character study and starts being a product roadmap.",
      image_url:
        "/images/nano_insp/template-ip-creative-cultural-goods-mockup-set-bronze-rabbit-qingqing.jpg",
      preview_image_url:
        "/images/nano_insp_preview/template-ip-creative-cultural-goods-mockup-set-bronze-rabbit-qingqing-prev.jpg",
    },
  ],
  cta: {
    primary_label: "15-min walkthrough on your IP",
    primary_href: "https://calendly.com/qqwjq9916/15-minute-meeting",
    secondary_label: "Read the case study",
    secondary_href: "/blog/ip-merch-design-ai-workflow",
    closing_line:
      "Each stage takes a real IP brief and outputs at SKU velocity. Run this on your character — we'll send back a two-piece sample on any stage you pick.",
  },
};

/** Helper: get a stage by id (mirrors lib/illustrator_demo.ts getStyleById). */
export function getStageById(id: string): IpMerchStage | undefined {
  return IP_MERCH_DEMO_SEED.stages.find((s) => s.id === id);
}
