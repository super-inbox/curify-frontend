'use client';

/**
 * Ultimate Directory of Nano Banana Prompts
 *
 * Curated lookbook of real templates from nano_templates.json, grouped into
 * 6 high-level categories. Each card shows the template's og_image preview
 * and links to its /nano-template/<slug> page.
 */

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useMemo } from 'react';
import CdnImage from '@/app/[locale]/_components/CdnImage';
import RelatedBlogs from "../../../_components/RelatedBlogs";
import StructuredData from "@/app/[locale]/(public)/blog/[slug]/components/StructuredData";
import nanoTemplatesData from '../../../../../public/data/nano_templates.json';
import { toSlug } from '@/lib/nano_utils';
import BlogCTACard from "@/app/[locale]/_components/BlogCTACard";
import BlogCategoryLabel from "@/app/[locale]/_components/BlogCategoryLabel";
import AutoTableOfContents from "@/app/[locale]/_components/AutoTableOfContents";

type Template = {
  id: string;
  topics?: string[];
  og_image?: string;
  rank_score?: number;
  locales?: Record<string, { title?: string; description?: string; category?: string }>;
};

type Category = {
  id: string;
  title: string;
  description: string;
  howToUse: string;
  accent: string; // tailwind color name (blue / pink / amber / green / purple / emerald)
  match: (tpl: Template) => boolean;
};

const CATEGORIES: Category[] = [
  {
    id: 'character',
    title: 'Character & Persona',
    description: 'Character and personality cards — viral on social, easy to remix.',
    howToUse:
      'Most templates take a single character name (Marvel, Breaking Bad, Friends, Ghibli, etc.) and output a styled MBTI or persona card. Drop in a name your audience already knows for the strongest engagement.',
    accent: 'blue',
    match: (t) =>
      ['character', 'mbti', 'psychology'].some((k) => t.topics?.includes(k)) ||
      t.id.includes('character') || t.id.includes('mbti'),
  },
  {
    id: 'poster',
    title: 'Posters & Visual Impact',
    description: 'High-impact posters for movies, events, fandoms, and marketing.',
    howToUse:
      'Best for shareable visuals. Most posters take a theme or subject as their single parameter (e.g. "anime protagonists", "NBA legends", "Belém Tower"). The template handles composition, typography, and lighting.',
    accent: 'pink',
    match: (t) => t.topics?.includes('posters') ?? false,
  },
  {
    id: 'travel',
    title: 'Travel Maps & Itineraries',
    description: 'Travel itineraries, hand-drawn maps, and destination guides.',
    howToUse:
      'Pick a destination, optionally a trip duration. Strongest results come from well-known cities and countries — vague inputs ("Asia") produce vague outputs.',
    accent: 'emerald',
    match: (t) =>
      t.topics?.includes('travel') || t.topics?.includes('city') || t.topics?.includes('itinerary')
        ? true
        : false,
  },
  {
    id: 'fashion',
    title: 'Fashion & Style',
    description: 'Outfit grids, hairstyle pairings, costumes, and editorial fashion.',
    howToUse:
      'Specific outfit descriptors win. "Y2K minimalist streetwear with chrome accents" outperforms "casual look". Most templates accept either a person archetype or a style label.',
    accent: 'purple',
    match: (t) =>
      t.topics?.includes('fashion') || t.topics?.includes('beauty')
        ? true
        : t.id.includes('hairstyle') || t.id.includes('outfit') || t.id.includes('costume'),
  },
  {
    id: 'infographic',
    title: 'Infographics & Education',
    description: 'Data viz, science explainers, vocabulary posters, learning content.',
    howToUse:
      'Give a concrete topic (e.g. "Coral Reef Ecosystems", "Black Holes Explained") rather than a category. The template provides the visual structure; your job is the subject specificity.',
    accent: 'amber',
    match: (t) =>
      t.topics?.includes('science') || t.topics?.includes('learning') || t.topics?.includes('history') ||
      t.topics?.includes('vocabulary') || t.id.includes('infographic'),
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle, Food & Design',
    description: 'Food cards, interior design moodboards, pet content, lifestyle grids.',
    howToUse:
      'Concrete recipe names, room types, or activity scenes work best. "Tagliatelle al tartufo" beats "pasta"; "scandinavian living room" beats "interior".',
    accent: 'green',
    match: (t) =>
      ['food', 'lifestyle', 'interior', 'animal', 'design'].some((k) => t.topics?.includes(k)),
  },
];

// Per-accent classes (Tailwind needs literal strings to JIT).
const ACCENT: Record<string, { ring: string; chip: string; bar: string; chipBg: string }> = {
  blue:    { ring: 'ring-blue-100',    chip: 'text-blue-700',    bar: 'from-blue-500 to-indigo-500',    chipBg: 'bg-blue-50' },
  pink:    { ring: 'ring-pink-100',    chip: 'text-pink-700',    bar: 'from-pink-500 to-rose-500',      chipBg: 'bg-pink-50' },
  emerald: { ring: 'ring-emerald-100', chip: 'text-emerald-700', bar: 'from-emerald-500 to-teal-500',   chipBg: 'bg-emerald-50' },
  purple:  { ring: 'ring-purple-100',  chip: 'text-purple-700',  bar: 'from-purple-500 to-fuchsia-500', chipBg: 'bg-purple-50' },
  amber:   { ring: 'ring-amber-100',   chip: 'text-amber-700',   bar: 'from-amber-500 to-orange-500',   chipBg: 'bg-amber-50' },
  green:   { ring: 'ring-green-100',   chip: 'text-green-700',   bar: 'from-green-500 to-emerald-500',  chipBg: 'bg-green-50' },
};

function TemplateCard({ tpl, locale }: { tpl: Template; locale: string }) {
  const i18n = tpl.locales?.[locale] ?? tpl.locales?.en ?? tpl.locales?.zh;
  const title = i18n?.title || tpl.id.replace(/^template-/, '').replace(/-/g, ' ');
  const description = i18n?.description || i18n?.category || '';
  const href = `/${locale}/nano-template/${toSlug(tpl.id)}`;
  const previewSrc = tpl.og_image;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {previewSrc ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
          <CdnImage
            src={previewSrc}
            alt={title}
            width={400}
            height={300}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="aspect-[4/3] w-full bg-gradient-to-br from-purple-100 to-pink-100" />
      )}
      <div className="flex-1 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-neutral-900 group-hover:text-purple-700 transition-colors">
          {title}
        </h3>
        {description && (
          <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{description}</p>
        )}
      </div>
    </Link>
  );
}

function buildCategories(locale: string) {
  const templates = (nanoTemplatesData as Template[]).filter((t) => t && t.id);
  // Templates can match multiple categories; we don't worry about duplication
  // — readers benefit from seeing a fashion template under both Fashion and
  // Posters if it qualifies for both.
  return CATEGORIES.map((cat) => {
    const matched = templates
      .filter(cat.match)
      .filter((t) => !!t.og_image) // need a preview image
      .sort((a, b) => (b.rank_score ?? 0) - (a.rank_score ?? 0))
      .slice(0, 6);
    return { ...cat, examples: matched };
  });
}

export default function UltimateDirectoryOfNanoBananaPromptsPage() {
  const t = useTranslations('blog.UltimateDirectoryOfNanoBananaPrompts');
  const locale = useLocale();

  const categories = useMemo(() => buildCategories(locale), [locale]);

  return (
    <div className="pt-10 pb-8">
      <article className="prose prose-base md:prose-lg max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero — float-left small image so the h1 + subtitle wrap around */}
        <div className="not-prose mb-12 clear-both">
          <div className="float-left mr-6 mb-4 w-40 sm:w-56 md:w-64">
            <CdnImage
              src="/images/45658b99d089618b244c024b1ea93cc9_thumb_1762921242171.jpg"
              alt={t('hero.title')}
              width={256}
              height={256}
              className="rounded-lg shadow-md w-full h-auto object-cover"
            />
          </div>
          <AutoTableOfContents />
          <BlogCategoryLabel slug="ultimate-directory-of-nano-banana-prompts" />
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            {t('hero.title')}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            {t('hero.subtitle')}
          </p>
          <p className="mt-4 text-sm text-neutral-700">
            {t('introduction.paragraph3')}
          </p>
          <div className="clear-both" />
        </div>

        {/* TOC — jump links to each category */}
        <nav className="not-prose mb-12 rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-3">
            {t('tableOfContents.title')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className={`inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:border-purple-300 hover:text-purple-700 transition-colors`}
              >
                {c.title} · <span className="ml-1 text-xs text-neutral-500">{c.examples.length}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* 6 stacked category sections */}
        {categories.map((c) => {
          const accent = ACCENT[c.accent] ?? ACCENT.blue;
          return (
            <section key={c.id} id={c.id} className="mb-16 not-prose scroll-mt-24">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
                  {c.title}
                </h2>
                <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${accent.bar} mb-4`} />
                <p className="text-neutral-700">{c.description}</p>
                <div className={`mt-3 rounded-lg ${accent.chipBg} border border-neutral-200/60 px-4 py-3`}>
                  <span className={`text-xs font-semibold uppercase tracking-wide ${accent.chip}`}>
                    How to use
                  </span>
                  <p className="mt-1 text-sm text-neutral-700">{c.howToUse}</p>
                </div>
              </div>
              {c.examples.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {c.examples.map((tpl) => (
                    <TemplateCard key={tpl.id} tpl={tpl} locale={locale} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 italic">
                  No templates curated for this section yet.
                </p>
              )}
            </section>
          );
        })}

        {/* RelatedBlogs covers internal blog cross-links — no separate
            "Related Tools & Resources" section (those entries were just other

            <BlogCTACard
              category="nano-template"
              slug="ultimate-directory-of-nano-banana-prompts"
              locale={locale}
            />

            blog posts, duplicating RelatedBlogs). */}
        <RelatedBlogs currentSlug="ultimate-directory-of-nano-banana-prompts" locale={locale} />

        <StructuredData
          title={t('hero.title')}
          description={t('hero.subtitle')}
          publishDate="2026-04-20"
          image="/images/45658b99d089618b244c024b1ea93cc9_thumb_1762921242171.jpg"
          url="/blog/ultimate-directory-of-nano-banana-prompts"
          readTime="10 min read"
        />
      </article>
    </div>
  );
}
