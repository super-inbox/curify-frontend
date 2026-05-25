"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useClickTracking } from "@/services/useTracking";
import categorizedTags from "@/lib/categorized_tags.json";

interface TagCategory {
  category: string;
  count: number;
}

interface Props {
  categories: TagCategory[];
  currentTag?: string;
}

// Display order tuned to put the highest-user-interest visual axes first
// (vibe / atmosphere / lighting / composition) before the structural ones
// (subject / content type / niche). "uncategorized" renders last as "Other"
// when present.
const CATEGORY_ORDER: string[] = [
  "mood_emotion",
  "atmosphere_tone",
  "lighting_color",
  "composition_format",
  "design",
  "lifestyle",
  "subject_people",
  "scene_setting",
  "content_type",
  "genre_niche",
  "intimacy_warmth",
];

const CATEGORY_LABEL: Record<string, string> = {
  mood_emotion: "Mood & Emotion",
  atmosphere_tone: "Atmosphere",
  lighting_color: "Lighting & Color",
  composition_format: "Composition",
  design: "Design Style",
  lifestyle: "Lifestyle & Fashion",
  subject_people: "Subjects & People",
  scene_setting: "Scene & Setting",
  content_type: "Content Type",
  genre_niche: "Genre & Niche",
  intimacy_warmth: "Intimacy & Warmth",
  other: "Other",
};

const TAG_TO_CATEGORY = new Map<string, string>();
for (const [cat, tags] of Object.entries(categorizedTags as Record<string, string[]>)) {
  if (cat === "uncategorized") continue;
  for (const t of tags) TAG_TO_CATEGORY.set(t.toLowerCase(), cat);
}

function CategoryLink({
  category,
  count,
  currentTag,
}: {
  category: string;
  count: number;
  currentTag?: string;
}) {
  const handleClick = useClickTracking(
    `nano_prompt_tags:${category}`,
    "tag_capsule"
  );

  return (
    <Link
      href={`/nano-banana-pro-prompts/tag/${encodeURIComponent(category)}`}
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
        category === currentTag
          ? "border-indigo-400 bg-indigo-50 text-indigo-700"
          : "border-gray-200 bg-white text-gray-800 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
      }`}
    >
      <span>{category}</span>
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
        {count}
      </span>
    </Link>
  );
}

function CategoryRow({
  label,
  tags,
  currentTag,
  defaultCollapsed,
}: {
  label: string;
  tags: TagCategory[];
  currentTag?: string;
  defaultCollapsed?: boolean;
}) {
  const [expanded, setExpanded] = useState(!defaultCollapsed);
  if (tags.length === 0) return null;
  const VISIBLE_CAP = 12;
  const overflow = tags.length > VISIBLE_CAP;
  const visible = expanded || !overflow ? tags : tags.slice(0, VISIBLE_CAP);
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
        <span className="ml-2 text-gray-400 normal-case">({tags.length})</span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {visible.map(({ category, count }) => (
          <CategoryLink
            key={category}
            category={category}
            count={count}
            currentTag={currentTag}
          />
        ))}
        {overflow && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="rounded-full px-3 py-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            {expanded ? "▲ less" : `▼ +${tags.length - VISIBLE_CAP} more`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CategoriesSection({
  categories,
  currentTag,
}: Props) {
  // Group the flat tag list by category from lib/categorized_tags.json.
  // Each category row renders its tags sorted by gallery count desc, so
  // the highest-coverage chip leads. Tags with no category mapping fall
  // into an "Other" row at the bottom (currently ~35 of 146 — backfill
  // opportunity tracked separately).
  const { byCategory, other } = useMemo(() => {
    const byCat: Record<string, TagCategory[]> = {};
    const oth: TagCategory[] = [];
    for (const tc of categories) {
      const cat = TAG_TO_CATEGORY.get(tc.category.toLowerCase());
      if (cat) {
        (byCat[cat] ||= []).push(tc);
      } else {
        oth.push(tc);
      }
    }
    for (const arr of Object.values(byCat)) arr.sort((a, b) => b.count - a.count);
    oth.sort((a, b) => b.count - a.count);
    return { byCategory: byCat, other: oth };
  }, [categories]);

  if (categories.length === 0) return null;

  return (
    <section className="mb-8 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">
          Browse by category
        </h2>
      </div>

      <div className="space-y-5">
        {CATEGORY_ORDER.map((cat) => {
          const tags = byCategory[cat];
          if (!tags || tags.length === 0) return null;
          return (
            <CategoryRow
              key={cat}
              label={CATEGORY_LABEL[cat] ?? cat}
              tags={tags}
              currentTag={currentTag}
            />
          );
        })}
        {other.length > 0 && (
          <CategoryRow
            label={CATEGORY_LABEL.other}
            tags={other}
            currentTag={currentTag}
            defaultCollapsed
          />
        )}
      </div>
    </section>
  );
}
