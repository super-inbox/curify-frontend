"use client";

import { Link } from "@/i18n/navigation";
import { toCdnUrl } from "@/app/[locale]/_components/CdnImage";

/**
 * Storytelling hero: a strong workflow-led message on the left, a gentle
 * auto-scrolling montage of REAL generated outputs on the right (proof-first,
 * reuses existing CDN assets — purely decorative, the indexable content rail
 * lives below). Respects prefers-reduced-motion.
 */
export default function HomeHero({ montageImages = [] }: { montageImages?: string[] }) {
  const imgs = montageImages.filter(Boolean).slice(0, 18);
  const cols = [0, 1, 2].map((m) => imgs.filter((_, i) => i % 3 === m));

  return (
    <section className="relative overflow-hidden">
      <div className="grid items-center gap-8 py-10 lg:grid-cols-2 lg:py-16">
        {/* Left — message */}
        <div className="max-w-xl">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-5xl">
            Don&apos;t just make an image.
            <br />
            <span className="text-purple-600">Finish the job.</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">
            Curify helps you search inspiration, generate visuals, localize for the
            world, and scale across every channel — design, education, marketing,
            and commerce.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#solutions"
              className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-700"
            >
              Explore solutions
            </a>
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-bold text-neutral-800 transition-colors hover:bg-neutral-50"
            >
              Try visual search
            </Link>
          </div>
        </div>

        {/* Right — live-output montage (decorative) */}
        {imgs.length > 0 && (
          <div className="hero-montage relative hidden h-[460px] lg:block" aria-hidden="true">
            <div className="grid grid-cols-3 gap-3">
              {cols.map((col, ci) => (
                <div key={ci} className={`marquee-col marquee-col-${ci}`}>
                  {[...col, ...col].map((src, i) => (
                    <div
                      key={i}
                      className="mb-3 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={toCdnUrl(src)}
                        alt=""
                        loading="lazy"
                        className="aspect-[3/4] w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .hero-montage {
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent,
            black 12%,
            black 88%,
            transparent
          );
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 12%,
            black 88%,
            transparent
          );
        }
        .marquee-col {
          animation: hero-scroll 34s linear infinite;
          will-change: transform;
        }
        .marquee-col-1 {
          animation-duration: 46s;
        }
        .marquee-col-2 {
          animation-duration: 40s;
          animation-direction: reverse;
        }
        @keyframes hero-scroll {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-col {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
