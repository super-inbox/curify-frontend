// app/[locale]/nano-template/[slug]/example/[exampleId]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import ExampleImagesGrid from "../../ExampleImagesGrid";
import NanoTemplateDetailClient from "../../NanoTemplateDetailClient";
import {
  toSlug,
  buildNanoRegistry,
  buildNanoFeedCards,
  getImageViewsForTemplate,
  getNanoExampleById,
  type RawNanoImageRecord,
  type RawTemplate,
} from "@/lib/nano_utils";
import { resolveContentLocale } from "@/lib/locale_utils";
import { toAbsUrlMaybe } from "@/lib/nano_seo_utils";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";
import { Locale } from "@/lib/locale_utils";
// ─── Types ────────────────────────────────────────────────────────────────────

type PageParams = {
  locale: string;
  slug: string;
  exampleId: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugToTemplateId(slug: string) {
  return slug.startsWith("template-") ? slug : `template-${slug}`;
}

function makeSafeNanoTranslator(tNano: Awaited<ReturnType<typeof getTranslations>>) {
  return (key: string): string => {
    try {
      return tNano(key as never) ?? "";
    } catch {
      return "";
    }
  };
}

// ─── Static generation ────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const mod = (await import("@/public/data/nano_inspiration.json")) as unknown as {
    default: RawNanoImageRecord[];
  };

  const locales = ["en", "zh"];

  return locales.flatMap((locale) =>
    mod.default.map((img) => ({
      locale,
      slug: toSlug(img.template_id),
      exampleId: encodeURIComponent(img.id),
    }))
  );
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug, exampleId: rawExampleId } = await params;

  const contentLocale = resolveContentLocale(rawLocale);
  const templateId = slugToTemplateId(slug);
  const imageId = decodeURIComponent(rawExampleId);

  const example = getNanoExampleById(templateId, imageId, contentLocale);
  if (!example) return {};

  const loc = example.locales?.[contentLocale] ?? example.locales?.en ?? example.locales?.zh ?? {};
  const title = loc.title ?? example.id;
  const category = loc.category ?? "";
  const ogImage = toAbsUrlMaybe(example.asset.preview_image_url);

  return {
    title: `${title} — Nano Banana Prompt Generator`,
    description: `Generate images like "${title}" with Nano Banana. See the full prompt, breakdown, and use cases for this ${category} template.`,
    openGraph: {
      title: `${title} | Nano Banana`,
      description: `Nano Banana ${category.toLowerCase()} prompt — see the exact prompt and how to recreate this image.`,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    alternates: {
      canonical: `/${rawLocale}/nano-template/${slug}/example/${rawExampleId}`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NanoExampleDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale: rawLocale, slug, exampleId: rawExampleId } = await params;

  const contentLocale = resolveContentLocale(rawLocale);
  const templateId = slugToTemplateId(slug);
  const imageId = decodeURIComponent(rawExampleId);

  const example = getNanoExampleById(templateId, imageId, contentLocale);
  if (!example) notFound();

  const loc = example.locales?.[contentLocale] ?? example.locales?.en ?? example.locales?.zh ?? {};
  const title = loc.title ?? example.id;
  const category = loc.category ?? "";
  const prompt = example.filled_prompt || example.base_prompt || "";
  const tags = [category, "nano banana", "prompt generator", "ai image"].filter(Boolean);

  const paramEntries = Object.fromEntries(
    Object.entries(example.params ?? {}).map(([k, v]) => [k, String(v ?? "")])
  );

  const reg = buildNanoRegistry(
    nanoTemplates as unknown as RawTemplate[],
    nanoImages as unknown as RawNanoImageRecord[]
  );

  const tNano = await getTranslations({ locale: rawLocale, namespace: "nano" });
  const translateNano = makeSafeNanoTranslator(tNano);

  const imageViews = getImageViewsForTemplate(reg, templateId, contentLocale);
  const gridItems = imageViews
    .filter((img) => img.id !== imageId)
    .map((img) => ({
      id: img.id,
      title: img.title || "",
      preview: img.preview_image_url || img.image_url,
      templateId: img.template_id,
    }));

  const otherNanoCards = buildNanoFeedCards(reg, contentLocale, {
    perTemplateMaxImages: 2,
    strictLocale: false,
    translate: translateNano,
  }).filter((c) => c.template_id !== templateId);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href={`/${rawLocale}`} className="hover:text-neutral-800">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/${rawLocale}/nano-template/${slug}`}
          className="hover:text-neutral-800"
        >
          {category || slug}
        </Link>
        <span>/</span>
        <span className="font-medium text-neutral-800 line-clamp-1">{title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <CdnImage
            src={example.asset.image_url}
            alt={title}
            className="w-full object-cover"
            priority
          />
        </div>

        <div className="flex flex-col gap-5">
          {category && (
            <span className="inline-block w-fit rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              {category}
            </span>
          )}

          <h1 className="text-2xl font-bold leading-snug text-neutral-900">{title}</h1>

          <section aria-labelledby="prompt-heading">
            <h2
              id="prompt-heading"
              className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500"
            >
              Prompt
            </h2>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-neutral-800">
                {prompt || "—"}
              </pre>
            </div>
          </section>

          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-600"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-2">
            <Link
              href={`/${rawLocale}/nano-template/${slug}?${new URLSearchParams(paramEntries).toString()}`}
              className="inline-block rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-purple-700"
            >
              Try this template →
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-neutral-900">Prompt breakdown</h2>
        <PromptBreakdown prompt={prompt} params={example.params ?? {}} />
      </section>

      <section className="mt-8">
        {gridItems.length > 0 && (
          <>
            <h2 className="mb-4 text-lg font-bold text-neutral-900">More from this template</h2>
            <ExampleImagesGrid items={gridItems} locale={rawLocale} maxRows={3} />
          </>
        )}

        <NanoTemplateDetailClient
          locale={rawLocale}
          template={{ template_id: templateId, base_prompt: "", parameters: [] }}
          otherNanoCards={otherNanoCards}
          showReproduce={false}
          showOtherTemplates={true}
        />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `How to create "${title}" with Nano Banana`,
            description: `Use this prompt to generate ${title} images with Nano Banana.`,
            image: example.asset.image_url,
            step: [
              { "@type": "HowToStep", text: "Open Nano Banana and select the template." },
              { "@type": "HowToStep", text: `Enter the prompt: ${prompt}` },
              { "@type": "HowToStep", text: "Generate and download your image." },
            ],
          }),
        }}
      />
    </main>
  );
}

// ─── Prompt Breakdown ─────────────────────────────────────────────────────────

function PromptBreakdown({
  prompt,
  params,
}: {
  prompt: string;
  params: Record<string, any>;
}) {
  if (!prompt) {
    return <p className="text-sm text-neutral-500">No prompt data available.</p>;
  }

  const parts = prompt.split(/(\{[^}]+\})/g);

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        Variables in{" "}
        <span className="rounded border border-amber-200 bg-amber-50 px-1 py-0.5 font-mono text-xs text-amber-800">
          {"{curly braces}"}
        </span>{" "}
        are replaced with your inputs:
      </p>

      <p className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 font-mono text-sm leading-7">
        {parts.map((part, i) => {
          const match = part.match(/^\{(.+)\}$/);
          if (match) {
            const key = match[1];
            const value = params[key];
            return (
              <span
                key={i}
                className="mx-0.5 inline-block rounded border border-purple-200 bg-purple-100 px-1.5 py-0.5 text-xs font-bold text-purple-800"
                title={value != null ? `Value: ${value}` : `Parameter: ${key}`}
              >
                {value != null ? String(value) : `{${key}}`}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>

      {Object.keys(params).length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="py-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                Variable
              </th>
              <th className="py-2 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                Value used
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(params).map(([k, v]) => (
              <tr key={k} className="border-b border-neutral-100">
                <td className="py-2 pr-4 font-mono text-xs text-neutral-600">{`{${k}}`}</td>
                <td className="py-2 text-neutral-800">
                  {v != null && String(v).trim() !== "" ? (
                    String(v)
                  ) : (
                    <span className="italic text-neutral-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}