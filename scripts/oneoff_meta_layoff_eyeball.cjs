/**
 * One-off eyeball comparison: 4 generations of the Meta layoff editorial
 * visual through different template approaches. Output to
 * raw/content-gap-06-11/eyeball/.
 *
 * 1. NEW PROMPT: corporate-news-editorial-hero (the proposed template)
 * 2. template-hot-event-analysis (event_title + logic_chain + impact_axes)
 * 3. template-sports-iconic-event-analysis-poster (force-fitted; expected
 *    to look intentionally wrong — demonstrates the template-shape gap)
 * 4. template-weird-science-facts-infographic (also force-fitted; tonally
 *    way off — demonstrates the visual-style gap)
 *
 * Direct geminiImage() calls; no nano_inspiration.json mutation, no
 * watermarking, no auto-tag — purely test outputs.
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenAI, Modality } = require("@google/genai");

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in environment / .env.local");
  process.exit(1);
}
const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const MODEL = "gemini-3-pro-image-preview";

const OUTDIR = path.join(process.cwd(), "raw/content-gap-06-11/eyeball");
fs.mkdirSync(OUTDIR, { recursive: true });

const PROMPTS = [
  {
    name: "01_new_corporate_news_editorial_hero",
    label: "NEW PROMPT — corporate-news-editorial-hero",
    prompt: `Editorial article-header illustration depicting a corporate workforce event. Aspect ratio 3:2 landscape, centered hero composition.

Scene: A modern glass-and-stone tech company headquarters building with prominent "meta" wordmark signage above the front entrance and the infinity-loop Meta logo on a round badge to the right. Crowd of stylized realistic-illustrated office workers walking out of the front entrance carrying cardboard "PERSONAL ITEMS" boxes. Sunny clear daytime, distant trees in background.

Style: Monochrome editorial illustration — full desaturation to charcoal/grey tones across the entire scene EXCEPT one accent color #1877F2 (Meta brand blue) applied ONLY to the "meta" wordmark signage and the round logo badge on the building. Realistic-illustrated style, not photoreal not cartoony. Detailed figures with varied expressions and business attire (suits, blouses, casual smart). Architectural foreground filling the center, crowd filling the lower third. Subtle paper / newsprint texture overlay for editorial feel. Strong centered framing optimized for use as an article header. No text overlay, no captions, no watermarks.`,
  },
  {
    name: "02_hot_event_analysis_template",
    label: "EXISTING — template-hot-event-analysis",
    prompt: `Generate a visual infographic on hot events: portrait 3:4; text in English with clear and separate layers; white background. Title: Multi-dimensional visual analysis with AI — 【Meta Lays Off 8,000 Workers, Funds $115M Trades Training Program】 (in-depth exploration). Content structure: 1) Phenomenon-Essence Layered Diagram: from top to bottom "Surface Phenomenon Layer → Direct Cause Layer → Deep Essence Layer," with arrows indicating causal relationships; 2) Underlying Logic Breakdown Diagram: process chain "Layoffs → Severance → America's Workforce Academy launch → Welder/electrician/HVAC training → Job placement guarantee," labeling subjects, actions, and results; 3) Long-term Impact Radiation Diagram: radiating from the event towards Tech-labor displacement, Trades industry, AI workforce shift, Public perception of Big Tech, labeling impact content and duration (short/medium/long), using colors to distinguish impact levels (red high/yellow medium/blue low).`,
  },
  {
    name: "03_sports_event_analysis_template",
    label: "EXISTING (force-fitted) — template-sports-iconic-event-analysis-poster",
    prompt: `(Iconic Sports Event Analysis Poster Creator) Horizontal cinematic sports infographic poster themed 'Meta's 2026 $115M Workforce Pivot — 8000 Layoffs to Trades Training Bridge'. Layout: Large bold headline title with dual-language text at the top; centerpiece features a dramatic composite of archival match photos, key moment stills, or tactical diagrams; additional sections include quote blocks, timeline/evolution graphics, side-by-side comparisons, and match stats panels. Style: Gritty vintage textured aesthetic with aged paper overlays, gold metallic accents, and stadium spotlight lighting; bold layered sports typography, cinematic color grading, and photorealistic compositing; supports multiple layouts: legacy retrospective, rule evolution timeline, dual-goal comparison, multi-angle controversy analysis, and single-moment hero shot. 8K high resolution, print-ready quality. Subject: Deep-dive analysis poster for the Meta's 2026 $115M Workforce Pivot — 8000 Layoffs to Trades Training Bridge iconic sports moment.`,
  },
  {
    name: "04_weird_science_facts_template",
    label: "EXISTING (force-fitted) — template-weird-science-facts-infographic",
    prompt: `(Weird Science Facts Infographic Designer) Create a cute, colorful educational infographic titled "WEIRD SCIENCE FACTS: Meta's $115M Layoff Pivot!". Layout: 1. Top title in playful, rounded rainbow-colored letters, with a matching pastel banner underneath. 2. 3 equal vertical panels, each containing one fun science fact. 3. Each panel includes: a numbered pastel circle icon (1/2/3), a bold fun title for the fact, a kawaii-style cartoon illustration visualizing the fact (anthropomorphic characters with big sparkly eyes, soft gradients), and a short kid-friendly description in a rounded pastel text box at the bottom. Style: Soft pastel color palette with bright accents, whimsical background decorated with tiny stars/hearts/sparkles/confetti, clean vector art with thick outlines, easy-to-read playful text, cheerful magical mood for kids learning, no watermarks/logos, 4K ultra HD, direct image generation. Subject: 'Meta's $115M Layoff Pivot Weird Science Facts Infographic.`,
  },
];

async function geminiImage(prompt) {
  const response = await gemini.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
  });
  const parts = response?.candidates?.[0]?.content?.parts || response?.parts || [];
  for (const part of parts) {
    if (part?.inlineData?.data) return Buffer.from(part.inlineData.data, "base64");
  }
  const text = parts.map((p) => p.text || "").join("\n");
  throw new Error(`Gemini returned no image. Text: ${text.slice(0, 200) || "[none]"}`);
}

async function main() {
  console.log(`=== oneoff_meta_layoff_eyeball (model=${MODEL}) ===`);
  console.log(`  output: ${OUTDIR}\n`);
  for (const { name, label, prompt } of PROMPTS) {
    process.stdout.write(`  [${name}] ${label} ... `);
    try {
      const buf = await geminiImage(prompt);
      const outPath = path.join(OUTDIR, `${name}.jpg`);
      fs.writeFileSync(outPath, buf);
      console.log(`✓ ${buf.length.toLocaleString()} bytes → ${path.relative(process.cwd(), outPath)}`);
    } catch (err) {
      console.log(`✗ ${err.message}`);
    }
  }
}

main();
