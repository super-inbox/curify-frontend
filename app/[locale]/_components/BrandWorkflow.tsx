import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getCanonicalPath } from "@/lib/canonical";
import { makeSafeTranslator } from "@/lib/locale_utils";

/**
 * The "mature" 5-step brand-design workflow (per raw/brand-design-flow-08-04):
 * color system → logo → typeface → packaging → brand kit. Rendered at the top of
 * /topics/branding as a guided deliverable ladder. Each step links to the shipped
 * template that produces it; the typeface step's dedicated template
 * (template-brand-font-specimen-set) isn't built yet, so it shows as "coming
 * soon". Copy is localized via the `brandWorkflow` message namespace (EN
 * fallbacks inline so the section renders even before a locale is translated).
 */
type Step = {
  key: string;
  n: number;
  emoji: string;
  href: string | null;
  fallbackName: string;
  fallbackDesc: string;
  fallbackCta: string;
};

const STEPS: Step[] = [
  {
    key: "palette",
    n: 1,
    emoji: "🎨",
    href: "/nano-template/theme-color-palette-card",
    fallbackName: "Color system",
    fallbackDesc: "Extract a cohesive palette with hex codes from your theme or a reference image.",
    fallbackCta: "Generate palette",
  },
  {
    key: "logo",
    n: 2,
    emoji: "✒️",
    href: "/nano-template/brand-logo-variant-set",
    fallbackName: "Logo",
    fallbackDesc: "Six distinct logo concepts that share one palette — pick your direction.",
    fallbackCta: "Generate logos",
  },
  {
    key: "typeface",
    n: 3,
    emoji: "🔤",
    href: "/nano-template/brand-font-specimen-set",
    fallbackName: "Typeface",
    fallbackDesc: "Six on-brand font specimens from your brand name and style.",
    fallbackCta: "Generate specimens",
  },
  {
    key: "packaging",
    n: 4,
    emoji: "📦",
    href: "/nano-template/food-product-packaging-design",
    fallbackName: "Packaging",
    fallbackDesc: "Product packaging and mockups carrying your logo and colors.",
    fallbackCta: "Design packaging",
  },
  {
    key: "kit",
    n: 5,
    emoji: "🎁",
    href: "/nano-template/brand-vi-full-visual-pack-mockup",
    fallbackName: "Brand kit",
    fallbackDesc: "Apply your identity across a full visual-identity mockup pack.",
    fallbackCta: "Build VI pack",
  },
];

export default async function BrandWorkflow({ locale }: { locale: string }) {
  const tRoot = await getTranslations({ locale });
  const t = makeSafeTranslator(tRoot);

  return (
    <section className="mt-5">
      <div className="rounded-3xl border border-neutral-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
        <h2 className="text-lg font-bold text-neutral-900">
          {t("brandWorkflow.heading") || "Brand design workflow"}
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          {t("brandWorkflow.subtitle") ||
            "Build a complete brand identity in five steps — from a color system to a reusable brand kit."}
        </p>

        <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s) => {
            const name = t(`brandWorkflow.steps.${s.key}.name`) || s.fallbackName;
            const desc = t(`brandWorkflow.steps.${s.key}.desc`) || s.fallbackDesc;
            const cta = t(`brandWorkflow.steps.${s.key}.cta`) || s.fallbackCta;
            const inner = (
              <>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                    {s.n}
                  </span>
                  <span className="text-lg" aria-hidden>
                    {s.emoji}
                  </span>
                  <span className="text-sm font-semibold text-neutral-900">{name}</span>
                </div>
                <p className="mt-2 flex-1 text-xs leading-5 text-neutral-600">{desc}</p>
                <span
                  className={`mt-3 inline-block text-xs font-semibold ${
                    s.href ? "text-purple-700" : "text-neutral-400"
                  }`}
                >
                  {s.href ? `${cta} →` : cta}
                </span>
              </>
            );
            const cardCls =
              "flex h-full flex-col rounded-2xl border p-3.5 transition " +
              (s.href
                ? "border-neutral-200 bg-white hover:border-purple-300 hover:shadow-sm"
                : "border-dashed border-neutral-200 bg-neutral-50/60");
            return (
              <li key={s.key} className="h-full">
                {s.href ? (
                  <Link href={getCanonicalPath(locale, s.href)} className={cardCls}>
                    {inner}
                  </Link>
                ) : (
                  <div className={cardCls}>{inner}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
