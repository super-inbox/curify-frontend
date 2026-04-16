#!/usr/bin/env node
/**
 * Simplify template-evolution, template-series-infographic, template-hotspot-card.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const TEMPLATES_PATH = path.resolve(__dirname, "../public/data/nano_templates.json");
const INSPIRATION_PATH = path.resolve(__dirname, "../public/data/nano_inspiration.json");

// ── New prompts ───────────────────────────────────────────────────────────────

const NEW_EVOLUTION_PROMPT = `Create an ultra-high-detail isometric pixel-art timeline illustration (3:4, 4K), combining dense detail with symbolism and metaphor. The user has specified [{theme}].

First, reason about {theme} and determine: the theme title in both English and Chinese, the earliest and latest historical periods to cover, a fitting start stage label and end stage label, and 3–5 key evolutionary stages with their symbolic elements and color palette.

Then build an isometric "EVOLUTION MUSEUM OF {theme}" where each gallery zone represents a stage — so spatial progression equals temporal evolution. Use standard isometric perspective (2:1), rich layered depth, and smooth transitions. Assign 3–5 strongly theme-linked symbolic elements per stage. Use stage-differentiated color palettes to suggest time flow. Add bilingual pixel-font titles integrated into the scene: Chinese "[theme in Chinese]演进史" and English "EVOLUTION OF {theme}", plus subtitles showing the start-to-end span in both languages, and key timeline markers. Keep it professional yet visually engaging with interpretive space; suitable for academic analysis and comparative visualization.`;

const NEW_EVOLUTION_ZH_PROMPT = `创作一张超高细节等距像素艺术时间线插画（3:4，4K），融合细节密度、象征性与隐喻。用户指定的主题为【{theme}】。

首先，围绕{theme}进行推理，确定：主题的中英文标题、涵盖的最早与最近历史时期、起始阶段标签与结束阶段标签，以及3-5个关键演进阶段及其各自的象征性元素与色彩方案。

然后构建一个以"{theme}"为主题的等距"演进博物馆"，每个展馆区域代表一个演进阶段，空间推进即代表时间演变。采用标准等距视角（2:1），丰富的层次深度与流畅过渡。每个阶段分配3-5个与主题强烈关联的象征元素，并用差异化色彩暗示时间流动。在场景中融入双语像素字体标题：中文"[主题中文]演进史"与英文"EVOLUTION OF {theme}"，加上起止阶段的双语副标题及关键时间节点标记。整体风格专业且具视觉张力，适合学术分析与对比可视化，直接出图。`;

const NEW_INFOGRAPHIC_EN_PROMPT = `(Modular Infographic Designer) You are a top-tier modular infographic designer specializing in creating cohesive multi-card visual series. The user has specified [{series_topic}] in [{art_style}].

First, reason about {series_topic} and determine: a logical set of section titles that together form a coherent narrative series — such as Cover, Overview, Key Concepts, Comparison, Case Study, Future Outlook, etc. — adapted to the nature of the topic (business, science, culture, education, etc.).

Then generate a complete set of vertical 3:4 high-quality infographic cards. Each card focuses on one core section while maintaining consistent visual language. Single card structure: 1. Top title bar: prominent section title with soft themed background and rounded corners. 2. Central visual: core illustration/diagram representing the concept (comparison, timeline, flowchart, character, or scene) in {art_style}. 3. Content modules: layout with sections containing "icon + label + short description". 4. Bottom summary: highlighted box with key takeaway. Style: clean rounded UI, soft colors, clear typography, no extra decoration, Curify watermark top-left, vertical 3:4, 4K ultra HD. Series topic: [{series_topic}].`;

const NEW_INFOGRAPHIC_ZH_PROMPT = `（通用系列信息图设计师）你是一位顶级模块化信息图设计师，擅长创作系列主题组图。用户指定的主题为【{series_topic}】，风格为【{art_style}】。

首先，围绕{series_topic}进行推理，确定一套逻辑清晰、叙事连贯的章节标题序列——例如封面、总览、核心概念、对比分析、案例研究、未来展望等，根据主题性质（商业、科普、文化、教育等）灵活调整。

然后生成一套完整的竖版3:4高品质系列卡片，所有卡片保持一致的视觉语言与排版逻辑。单张卡片通用结构：1. 顶部标题栏：醒目章节标题，搭配主题匹配的柔和背景色，圆角边框设计。2. 中心视觉区：核心插画/示意图，直观呈现章节核心概念（对比图、时间线、流程图、拟人化形象、场景插画），风格为{art_style}。3. 内容模块区：每个模块包含「图标+标签+简短说明」。4. 底部总结栏：高亮文本框，放置该章节核心结论。整体风格：干净圆角UI，柔和配色，清晰字体，左上角带Curify水印，竖版3:4格式，4K超高清，直接出图。系列主题为【{series_topic}】。`;

const NEW_HOTSPOT_EN_PROMPT = `(Hand-painted Illustrator) You are a professional knowledge card designer, specializing in hand-painted watercolor style designs for popular science. The user has specified [{hotspot_name}].

First, reason about {hotspot_name} and determine: 3 concise keywords that capture the key dimensions of this topic, and a fitting color theme (e.g., deep blue for tech, warm orange for energy, soft green for environment, etc.).

Then create a hand-painted watercolor style knowledge card: the top title bar should read 'Knowledge Card | {hotspot_name}', with a subtitle showing the 3 keywords, using a vintage ribbon banner design; the background should feature a soft watercolor gradient effect with the determined color theme; all icons and lines should be in a hand-drawn style, with clear black outlines and soft, low-saturation colors inside; the information should be divided into a 'Core Overview' section, with 3-4 logical sub-modules, each containing an icon, title, and key points, displaying causal relationships with arrows or connecting lines; at the bottom, include a 'One-Sentence Summary' quote box that succinctly encapsulates the essence and core impact of the hotspot. The overall layout should be neat, well-structured, and artistically healing, suitable for popular science communication. Directly output the image, themed around [{hotspot_name}].`;

const NEW_HOTSPOT_ZH_PROMPT = `（手绘插画师）你是一位专业知识卡片设计师，擅长手绘水彩风格的科普设计。用户指定的热点主题为【{hotspot_name}】。

首先，围绕{hotspot_name}进行推理，确定：3个能概括该主题核心维度的简洁关键词，以及与主题契合的色彩方案（如科技类用深蓝、能源类用暖橙、环保类用柔绿等）。

然后创作一张手绘水彩风格知识卡片：顶部标题栏显示「知识卡片 | {hotspot_name}」，副标题展示3个关键词，采用复古丝带横幅设计；背景为柔和水彩渐变效果，使用确定的色彩方案；所有图标和线条均为手绘风格，清晰黑色轮廓配柔和低饱和度填色；信息划分为「核心概述」模块，包含3-4个逻辑子模块，每个模块含图标、标题和要点，用箭头或连线展示因果关系；底部设置「一句话总结」引用框，精炼概括热点本质与核心影响。整体布局工整、结构清晰、治愈感强，适合科普传播。直接出图，主题为【{hotspot_name}】。`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function toTitleCase(slug) {
  // Preserve all-caps tokens like "AI", "US", etc. if they're already uppercase in slug
  return slug.split("-").map((w) => {
    if (w === w.toUpperCase() && w.length > 1) return w; // keep ALL-CAPS
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(" ");
}

// ── Inspiration param extractors ──────────────────────────────────────────────

// template-evolution: strip prefix, title case
function evolutionTheme(id) {
  const slug = id.slice("template-evolution-".length);
  return toTitleCase(slug);
}

// template-series-infographic: detect series_topic (strip numbered suffix and "-en" suffix)
const SERIES_TOPICS = {
  "microsoft-ai-dilemma": { series_topic: "Microsoft AI Dilemma", art_style: "Flat Illustration Style" },
  "middle-east-conflict": { series_topic: "Middle East Conflict", art_style: "Flat Illustration Style" },
  "nvidia-strategy": { series_topic: "Nvidia Strategy", art_style: "Flat Illustration Style" },
  "problem-solvers": { series_topic: "Problem Solvers", art_style: "Cute Cartoon Style" },
  "linkedin": { series_topic: "LinkedIn", art_style: "Flat Illustration Style" },
  "sora": { series_topic: "Sora", art_style: "Flat Illustration Style" },
  "avoid-debt-and-leverage": { series_topic: "Avoid Debt and Leverage", art_style: "Flat Illustration Style" },
  "buffett-saving-method": { series_topic: "Buffett Saving Method", art_style: "Flat Illustration Style" },
  "cash-buffer-and-compound-magic": { series_topic: "Cash Buffer and Compound Magic", art_style: "Flat Illustration Style" },
  "live-below-your-means": { series_topic: "Live Below Your Means", art_style: "Flat Illustration Style" },
  "pay-yourself-first": { series_topic: "Pay Yourself First", art_style: "Flat Illustration Style" },
};

function infographicParams(id) {
  const slug = id.slice("template-series-infographic-".length)
    .replace(/-en$/, "")          // strip trailing "-en"
    .replace(/-\d+(-[\w-]+)?$/, "") // strip trailing "-01", "-01-cover" style suffixes
    .replace(/-\d+$/, "");         // strip any remaining trailing number
  const info = SERIES_TOPICS[slug];
  if (info) return info;
  // fallback
  return { series_topic: toTitleCase(slug), art_style: "Flat Illustration Style" };
}

// template-hotspot-card: strip prefix + trailing numbers, title case
const HOTSPOT_NAMES = {
  "template-hotspot-card-Indian-Manned-Space-3": "Indian Manned Space",
  "template-hotspot-card-Indian-anned-Space-1": "Indian Manned Space",
  "template-hotspot-card-asset-hedge": "Asset Hedge",
  "template-hotspot-card-middle-east-situation": "Middle East Situation",
  "template-hotspot-card-solid-state-battery": "Solid State Battery",
  "template-hotspot-card-ai-regulation": "AI Regulation",
  "template-hotspot-card-iran1": "Iran",
  "template-hotspot-card-iran2": "Iran",
  "template-hotspot-card-iran3": "Iran",
  "template-hotspot-card-tech-layoff-2026": "Tech Layoff 2026",
  "template-hotspot-card-battle-of-the-claws": "Battle of the Claws",
};

// ── Load data ─────────────────────────────────────────────────────────────────
const templates = JSON.parse(fs.readFileSync(TEMPLATES_PATH, "utf-8"));
const inspiration = JSON.parse(fs.readFileSync(INSPIRATION_PATH, "utf-8"));

let templatesUpdated = 0;
let inspirationUpdated = 0;

// ── Update nano_templates.json ────────────────────────────────────────────────
for (const tpl of templates) {
  if (tpl.id === "template-evolution") {
    const param = {
      name: "theme",
      label: "Theme",
      type: "text",
      placeholder: ["British Industrial Revolution", "Western Art Development", "Currency Forms", "Transportation", "AI Development"],
    };
    tpl.locales.en.base_prompt = NEW_EVOLUTION_PROMPT;
    tpl.locales.en.parameters = [param];
    if (tpl.locales.zh) {
      tpl.locales.zh.base_prompt = NEW_EVOLUTION_ZH_PROMPT;
      tpl.locales.zh.parameters = [param];
    }
    templatesUpdated++;
    console.log("Updated template-evolution");
  }

  if (tpl.id === "template-series-infographic") {
    const params = [
      {
        name: "series_topic",
        label: "Series Topic",
        type: "text",
        placeholder: ["Microsoft AI Dilemma", "Nvidia Strategy", "Middle East Conflict", "Personal Finance", "Climate Change"],
      },
      {
        name: "art_style",
        label: "Art Style",
        type: "text",
        placeholder: ["Cute Cartoon Style", "Flat Illustration Style", "Vintage Chinese Style", "Tech Line Art Style", "Watercolor Style"],
      },
    ];
    tpl.locales.en.base_prompt = NEW_INFOGRAPHIC_EN_PROMPT;
    tpl.locales.en.parameters = params;
    if (tpl.locales.zh) {
      tpl.locales.zh.base_prompt = NEW_INFOGRAPHIC_ZH_PROMPT;
      tpl.locales.zh.parameters = params;
    }
    templatesUpdated++;
    console.log("Updated template-series-infographic");
  }

  if (tpl.id === "template-hotspot-card") {
    const param = {
      name: "hotspot_name",
      label: "Topic / Hotspot",
      type: "text",
      placeholder: ["Solid State Battery", "AI Regulation", "Middle East Situation", "Tech Layoff 2026", "Asset Hedge"],
    };
    tpl.locales.en.base_prompt = NEW_HOTSPOT_EN_PROMPT;
    tpl.locales.en.parameters = [param];
    if (tpl.locales.zh) {
      tpl.locales.zh.base_prompt = NEW_HOTSPOT_ZH_PROMPT;
      tpl.locales.zh.parameters = [param];
    }
    templatesUpdated++;
    console.log("Updated template-hotspot-card");
  }
}

// ── Update nano_inspiration.json params ───────────────────────────────────────
for (const ex of inspiration) {
  if (ex.template_id === "template-evolution") {
    ex.params = { theme: evolutionTheme(ex.id) };
    inspirationUpdated++;
  }

  if (ex.template_id === "template-series-infographic") {
    ex.params = infographicParams(ex.id);
    inspirationUpdated++;
  }

  if (ex.template_id === "template-hotspot-card") {
    const name = HOTSPOT_NAMES[ex.id];
    if (name) {
      ex.params = { hotspot_name: name };
      inspirationUpdated++;
    } else {
      console.warn("Unknown hotspot ID:", ex.id);
    }
  }
}

// ── Write output ──────────────────────────────────────────────────────────────
fs.writeFileSync(TEMPLATES_PATH, JSON.stringify(templates, null, 2) + "\n", "utf-8");
fs.writeFileSync(INSPIRATION_PATH, JSON.stringify(inspiration, null, 2) + "\n", "utf-8");

console.log(`\nDone. Templates updated: ${templatesUpdated}, inspiration params updated: ${inspirationUpdated}`);
