#!/usr/bin/env node
// 3D content gap matrix — Subject × Info-type × Layout.
//
// Operationalizes the three-tier ontology documented in
// docs/search-and-content.md (Thread b → Three-tier ontology section).
// The flat topics[] schema is preserved; tier classification happens
// here at runtime by reading taxonomy.json maps:
//
//   Tier I  Subject     → template_subjects (already auto-derived)
//   Tier II Info-Type   → template_information_types (auto-derived
//                         from topics[] ∩ information_types vocabulary)
//   Tier III Layout     → NOT a tag today. Derived heuristically below
//                         from template id substrings + content_shapes
//                         (Round 2A back-compat alias). Documented as
//                         "Open item 2" in the 2026-06-01 audit.
//
// Output:
//   - per-tier coverage summary
//   - top-50 gap cells (Subject × Info-Type with high subject density
//     but no template at all)
//   - layout-axis report (sparse — flags which layouts have <5 templates
//     and could be targets for new content)
//   - written to /tmp/3d_gap_matrix_<date>.md as a human-readable report

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const TPL_PATH = path.join(REPO, "public/data/nano_templates.json");
const TAX_PATH = path.join(REPO, "lib/taxonomy.json");

// ── Layout vocabulary + heuristic classifier ───────────────────────────────
// Layout isn't yet a queryable tag, so derive it from template id substrings.
// First match wins (order matters). Fallback: 'single-image'.
const LAYOUT_RULES = [
  { layout: "flashcard",     test: (id) => /flashcard|flashcards|vocab-poster|vocab-flashcard|learning-card/.test(id) },
  { layout: "matching-chart", test: (id) => /matching-chart|9-traits/.test(id) },
  { layout: "grid",          test: (id) => /grid|fandom-character-grid|book-recommendation|top10|photo-grid/.test(id) },
  { layout: "timeline",      test: (id) => /timeline|life-journey|evolution-timeline|flowing-journey|wolf-path/.test(id) },
  { layout: "map",           test: (id) => /-map$|-map-|landmark-map|travel-map|word-origins-map|theme-map/.test(id) },
  { layout: "before-after",  test: (id) => /before-after|then-vs-now|generation-comparison|stereotype-vs-reality/.test(id) },
  { layout: "vs-battle",     test: (id) => /battle|-vs-|-comparison|contrast/.test(id) },
  { layout: "collage",       test: (id) => /collage|scrapbook|deconstruction-board|stamp-collection|red-envelope-set/.test(id) },
  { layout: "mood-board",    test: (id) => /mood-board/.test(id) },
  { layout: "carousel",      test: (id) => /series-infographic|series-travel/.test(id) },
  { layout: "infographic",   test: (id) => /infographic/.test(id) },
  { layout: "guide-card",    test: (id) => /guide|tutorial|step-by-step|routine|recipe|plan|how-to/.test(id) },
  { layout: "character-card", test: (id) => /character-card|character-profile|mbti-|character-analysis|profile/.test(id) },
  { layout: "poster",        test: (id) => /poster|illustration|sketch|painting/.test(id) },
];
const LAYOUTS = [
  "flashcard","matching-chart","grid","timeline","map","before-after",
  "vs-battle","collage","mood-board","carousel","infographic","guide-card",
  "character-card","poster","single-image",
];

function classifyLayout(templateId) {
  for (const rule of LAYOUT_RULES) {
    if (rule.test(templateId)) return rule.layout;
  }
  return "single-image";
}

// Subjects worth gap-analyzing (top tier-2 surfaces). Skip the very
// long tail (1-2 template subjects) since gap cells there are expected.
const MATRIX_SUBJECTS = [
  "character", "mbti", "language", "vocabulary", "learning", "lifestyle",
  "travel", "culture", "food", "fashion", "history", "science",
  "sports", "world-cup", "anime", "celebrity", "product", "design",
];

// Info-types — all 13 canonical from Round 2A. Use the topic_word that
// each maps to in nano_templates.json topics[] (per the migration
// mapping).
const INFO_TYPES = [
  { id: "insight",          topic_word: "insight" },
  { id: "profile",          topic_word: "portrait" },
  { id: "collection",       topic_word: "groups" },
  { id: "comparison",       topic_word: "comparison" },
  { id: "timeline",         topic_word: "history" },
  { id: "process",          topic_word: "guides" },
  { id: "information-card", topic_word: "information-card" },
  { id: "vocabulary",       topic_word: "vocabulary" },
  { id: "dialogue",         topic_word: "dialogue" },
  { id: "quote",            topic_word: "quote" },
  { id: "map",              topic_word: "map" },
  { id: "quiz",             topic_word: "quiz" },
  { id: "story",            topic_word: "story" },
];

function loadJSON(p) { return JSON.parse(fs.readFileSync(p, "utf-8")); }

function main() {
  const templates = loadJSON(TPL_PATH);
  const taxonomy = loadJSON(TAX_PATH);
  const templateSubjects = taxonomy.template_subjects || {};

  // Per-template classification: { id, subjects[], info_types[], layout }
  const classified = templates.map((t) => {
    const topics = Array.isArray(t.topics) ? t.topics : [];
    const subjects = templateSubjects[t.id] || [];
    const info_types = INFO_TYPES
      .filter((it) => topics.includes(it.topic_word))
      .map((it) => it.id);
    const layout = classifyLayout(t.id);
    return { id: t.id, subjects, info_types, layout };
  });

  // ─── Per-tier summary ────────────────────────────────────────────────
  const subjectCounts = {};
  const infoCounts = {};
  const layoutCounts = {};
  for (const c of classified) {
    for (const s of c.subjects) subjectCounts[s] = (subjectCounts[s] || 0) + 1;
    for (const it of c.info_types) infoCounts[it] = (infoCounts[it] || 0) + 1;
    layoutCounts[c.layout] = (layoutCounts[c.layout] || 0) + 1;
  }

  // ─── 3D matrix: subject × info_type × layout ────────────────────────
  // Cell value = list of template ids that have ALL three.
  const matrix = {}; // matrix[subject][info_type][layout] = [...templateIds]
  for (const s of MATRIX_SUBJECTS) {
    matrix[s] = {};
    for (const it of INFO_TYPES) {
      matrix[s][it.id] = {};
      for (const l of LAYOUTS) matrix[s][it.id][l] = [];
    }
  }
  for (const c of classified) {
    for (const s of c.subjects) {
      if (!matrix[s]) continue;
      for (const it of c.info_types) {
        if (!matrix[s][it]) continue;
        matrix[s][it][c.layout].push(c.id);
      }
    }
  }

  // ─── Identify gap cells worth highlighting ──────────────────────────
  // A gap-worthy cell: subject has ≥10 templates total AND (subject ×
  // info_type) is non-empty AND (subject × info_type × layout) is empty
  // for a "common" layout. These are filllable cells.
  const COMMON_LAYOUTS = new Set(["timeline","map","grid","character-card","infographic","collage","before-after","vs-battle","poster","flashcard"]);
  const gaps = [];
  for (const s of MATRIX_SUBJECTS) {
    if ((subjectCounts[s] || 0) < 10) continue;
    for (const it of INFO_TYPES) {
      const subInfoTotal = Object.values(matrix[s][it.id]).reduce((a, arr) => a + arr.length, 0);
      if (subInfoTotal === 0) continue;
      for (const l of LAYOUTS) {
        if (!COMMON_LAYOUTS.has(l)) continue;
        if (matrix[s][it.id][l].length === 0) {
          gaps.push({ subject: s, info_type: it.id, layout: l, subject_total: subjectCounts[s], subject_info_total: subInfoTotal });
        }
      }
    }
  }
  gaps.sort((a, b) => b.subject_total - a.subject_total || b.subject_info_total - a.subject_info_total);

  // ─── Saturated cells (richest combos) ────────────────────────────────
  const saturated = [];
  for (const s of MATRIX_SUBJECTS) {
    for (const it of INFO_TYPES) {
      for (const l of LAYOUTS) {
        const n = matrix[s][it.id][l].length;
        if (n >= 3) saturated.push({ subject: s, info_type: it.id, layout: l, count: n, templates: matrix[s][it.id][l] });
      }
    }
  }
  saturated.sort((a, b) => b.count - a.count);

  // ─── Print report ────────────────────────────────────────────────────
  const lines = [];
  lines.push("# 3D Content Gap Matrix — " + new Date().toISOString().slice(0, 10));
  lines.push("");
  lines.push("Operationalizes the three-tier ontology (Subject × Info-type × Layout) documented in `docs/search-and-content.md` Thread b. Flat `topics[]` schema preserved — tier classification happens at runtime by reading taxonomy.json.");
  lines.push("");
  lines.push("**Layout caveat**: not yet a queryable tag (2026-06-01 audit Open item 2). Derived here from template id substrings via the `LAYOUT_RULES` heuristic in `scripts/build_3d_gap_matrix.cjs`. Counts include some noise — refine the rules or promote Layout to an explicit tag for higher fidelity.");
  lines.push("");
  lines.push("## Per-tier summary");
  lines.push("");
  lines.push("**Subjects** (top 15 by template count):");
  const sortedSubjects = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
  for (const [s, n] of sortedSubjects) lines.push(`- ${s} — ${n} templates`);
  lines.push("");
  lines.push("**Info-types** (Round 2A canonical 13):");
  const sortedInfo = Object.entries(infoCounts).sort((a, b) => b[1] - a[1]);
  for (const [it, n] of sortedInfo) lines.push(`- ${it} — ${n} templates`);
  lines.push("");
  lines.push("**Layouts** (heuristic-derived from template id):");
  const sortedLayouts = Object.entries(layoutCounts).sort((a, b) => b[1] - a[1]);
  for (const [l, n] of sortedLayouts) lines.push(`- ${l} — ${n} templates`);
  lines.push("");
  lines.push("## Top 30 fillable gap cells");
  lines.push("");
  lines.push("Cells where the subject has ≥10 templates and (subject × info-type) has at least 1 template, BUT (subject × info-type × layout) is empty for a common layout. These are content-batch targets — the subject has demand, the info-type is appropriate, only the layout is missing.");
  lines.push("");
  lines.push("| # | Subject | Info-type | Missing Layout | Subject total | Subject × Info-type total |");
  lines.push("| --- | --- | --- | --- | --: | --: |");
  for (const [i, g] of gaps.slice(0, 30).entries()) {
    lines.push(`| ${i + 1} | ${g.subject} | ${g.info_type} | **${g.layout}** | ${g.subject_total} | ${g.subject_info_total} |`);
  }
  lines.push("");
  lines.push("## Top 20 saturated 3D cells (richest combos)");
  lines.push("");
  lines.push("| # | Subject | Info-type | Layout | Template count |");
  lines.push("| --- | --- | --- | --- | --: |");
  for (const [i, c] of saturated.slice(0, 20).entries()) {
    lines.push(`| ${i + 1} | ${c.subject} | ${c.info_type} | ${c.layout} | ${c.count} |`);
  }
  lines.push("");
  lines.push("## Concrete batch-generation candidates (from top gap cells)");
  lines.push("");
  lines.push("For each top gap cell, the content brief is mechanical: pick a templated example from the saturated (subject × info-type) row and re-render in the missing layout. Examples:");
  lines.push("");
  for (const g of gaps.slice(0, 5)) {
    const adjacentNonEmpty = Object.entries(matrix[g.subject][g.info_type])
      .filter(([l, arr]) => arr.length > 0)
      .map(([l, arr]) => `${l}×${arr.length}`)
      .join(", ");
    lines.push(`- **${g.subject} × ${g.info_type} × ${g.layout}** (empty): adjacent layouts have ${adjacentNonEmpty}. Spec: pick one existing example, regenerate in **${g.layout}** layout.`);
  }
  lines.push("");
  const outPath = "/tmp/3d_gap_matrix_" + new Date().toISOString().slice(0, 10) + ".md";
  fs.writeFileSync(outPath, lines.join("\n"));
  console.log(`Wrote ${outPath} (${lines.length} lines, ${gaps.length} gap cells, ${saturated.length} saturated cells)`);
  console.log("");
  console.log("Per-tier totals:");
  console.log("  Subjects (tracked):", MATRIX_SUBJECTS.length);
  console.log("  Info-types:        ", INFO_TYPES.length);
  console.log("  Layouts:           ", LAYOUTS.length);
  console.log("  Total 3D cells:    ", MATRIX_SUBJECTS.length * INFO_TYPES.length * LAYOUTS.length);
  console.log("  Top gap cells (subject ≥10, common layout, empty):", gaps.length);
  console.log("  Saturated cells (≥3 templates per combo):", saturated.length);
}

main();
