"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import PromptCard from "./PromptCard";
import { useClickTracking } from "@/services/useTracking";
import type { NanoPromptBase } from "@/types/nanoPrompts";

type Row = { tag: string; prompts: NanoPromptBase[] };

function RowHeader({ tag, locale }: { tag: string; locale: string }) {
  const handleClick = useClickTracking(
    `nano_popular_tag_row:${tag}`,
    "tag_capsule",
  );
  const href = `/${locale}/nano-banana-pro-prompts/tag/${encodeURIComponent(tag)}`;
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <Link
        href={href}
        onClick={handleClick}
        className="text-base font-semibold text-gray-900 capitalize hover:text-indigo-700"
      >
        {tag}
      </Link>
      <Link
        href={href}
        onClick={handleClick}
        className="text-sm text-indigo-600 hover:text-indigo-800"
      >
        View all →
      </Link>
    </div>
  );
}

export default function PopularTagRows({ rows }: { rows: Row[] }) {
  const locale = useLocale();
  const nonEmpty = rows.filter((r) => r.prompts.length > 0);
  if (nonEmpty.length === 0) return null;
  return (
    <section className="mb-10 space-y-8">
      {nonEmpty.map(({ tag, prompts }) => (
        <div key={tag}>
          <RowHeader tag={tag} locale={locale} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
