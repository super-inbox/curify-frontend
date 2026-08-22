import Link from "next/link";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { getCanonicalPath } from "@/lib/canonical";

/**
 * Universe picker for /blog/mbti-character-generator.
 *
 * WHY (measured 2026-08-21): the post ranks pos 5.7 for "mbti generator"
 * (286 impr / 6 clicks) and pos 5.9 for "random mbti generator" (271 impr /
 * ZERO clicks). The searcher wants to generate, not to read — and the article's
 * own promise is "10 universes, one MBTI system", so the fastest hand-off is to
 * let them pick the universe and land straight on that generator.
 *
 * Replaces a single generic hero CTA: one image cannot represent ten universes,
 * and the choice is itself the hook.
 */
const UNIVERSES: { slug: string; name: string; blurb: string; img: string }[] = [
  { slug: "mbti-generic", name: "Any subject", blurb: "Athletes, friends, anyone",
    img: "/images/nano_insp_preview/template-mbti-generic-Basketball-en-Kobe-Bryant-Stephen-Curry-Kevin-Durant-Tim-Duncan-prev.jpg" },
  { slug: "mbti-nba", name: "NBA", blurb: "Basketball trading cards",
    img: "/images/nano_insp_preview/template-mbti-nba-en-kevendurant-prev.jpg" },
  { slug: "mbti-animal", name: "Animals", blurb: "16 types as animals",
    img: "/images/nano_insp_preview/template-mbti-animal-zh-cafe-prev.jpg" },
  { slug: "mbti-marvel", name: "Marvel", blurb: "Superhero infographics",
    img: "/images/nano_insp_preview/template-mbti-marvel-en-marvel-hulk-prev.jpg" },
  { slug: "mbti-naruto", name: "Naruto", blurb: "Anime character cards",
    img: "/images/nano_insp_preview/template-mbti-naruto-gaara-prev.jpg" },
  { slug: "mbti-ghibli", name: "Ghibli", blurb: "Studio-Ghibli styling",
    img: "/images/nano_insp_preview/template-mbti-ghibli-ashitaka-prev.jpg" },
];

export default function MbtiUniversePicker({ locale }: { locale: string }) {
  return (
    <section className="not-prose my-8">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-lg font-bold text-gray-900">Pick a universe and generate</h2>
        <span className="text-sm text-gray-500">No sign-up to look around</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {UNIVERSES.map((u) => (
          <Link
            key={u.slug}
            href={getCanonicalPath(locale, `/nano-template/${u.slug}`)}
            className="group block overflow-hidden rounded-xl border border-gray-200 bg-white no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
              <CdnImage
                src={u.img}
                alt={`MBTI characters in the ${u.name} universe`}
                className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
              />
            </div>
            <div className="px-3 py-2.5">
              <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700">
                {u.name} <span className="text-purple-600">→</span>
              </div>
              <div className="truncate text-xs text-gray-500">{u.blurb}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
