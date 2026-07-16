import Image from "next/image";
import type { ReactNode } from "react";
import BlogInlineClickTracker from "./BlogInlineClickTracker";
import BlogCodeBlockCopyTracker from "./BlogCodeBlockCopyTracker";

interface AgenticGenerativeCapabilityContentProps {
  slug: string;
  t: (key: string, defaultValue?: string) => string;
  locale: string;
}

interface EditorialFigureProps {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  dense?: boolean;
  priority?: boolean;
}

const observationTones = {
  gpt: "border-slate-800 bg-slate-50",
  canva: "border-violet-500 bg-violet-50/50",
  curify: "border-blue-600 bg-blue-50/50",
} as const;

function EditorialFigure({
  src,
  alt,
  caption,
  width,
  height,
  dense = false,
  priority = false,
}: EditorialFigureProps) {
  return (
    <figure className="not-prose overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className={
          dense
            ? "overflow-x-auto overscroll-x-contain bg-[#f4f6f9]"
            : "bg-white"
        }
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          unoptimized
          sizes={
            dense
              ? "(max-width: 1023px) 960px, (max-width: 1535px) 75vw, 1152px"
              : "(max-width: 768px) 100vw, (max-width: 1535px) 75vw, 1152px"
          }
          className={
            dense
              ? "h-auto w-full min-w-[960px] max-w-none lg:min-w-0"
              : "h-auto w-full"
          }
        />
      </div>
      <figcaption className="border-t border-slate-200 bg-white px-5 py-3 text-sm italic leading-6 text-slate-600 sm:px-6">
        {caption}
      </figcaption>
    </figure>
  );
}

function Observation({
  label,
  tone,
  className = "",
  children,
}: {
  label: string;
  tone: keyof typeof observationTones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border-t-4 p-5 sm:p-6 ${observationTones[tone]} ${className}`}
    >
      <p className="mb-2 font-bold text-slate-950">{label}</p>
      <div className="space-y-3 leading-7 text-slate-700">{children}</div>
    </div>
  );
}

function LabeledBullet({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <li>
      <strong className="text-slate-950">{label}</strong>{" "}
      <span>{children}</span>
    </li>
  );
}

export default function AgenticGenerativeCapabilityContent({
  slug,
  t,
}: AgenticGenerativeCapabilityContentProps) {
  return (
    <BlogInlineClickTracker blogSlug={slug}>
      <BlogCodeBlockCopyTracker blogSlug={slug}>
        <div className="space-y-16 pb-4">
          <div className="space-y-8">
            <blockquote className="mx-auto max-w-4xl rounded-r-2xl border-l-4 border-blue-600 bg-slate-50 px-6 py-5 text-lg leading-8 text-slate-700 sm:px-8 sm:py-6">
              {t("intro")}
            </blockquote>

            <EditorialFigure
              src={t("heroImage")}
              alt={t("heroImageAlt")}
              caption={t("heroCaption")}
              width={1600}
              height={820}
              priority
            />
          </div>

          <section className="space-y-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-4 text-3xl font-bold leading-tight text-slate-950">
                {t("differencesTitle")}
              </h2>
              <p className="leading-8 text-slate-700">
                {t("differencesIntro")}
              </p>
            </div>

            <EditorialFigure
              src={t("ontologyImage")}
              alt={t("ontologyImageAlt")}
              caption={t("ontologyCaption")}
              width={1600}
              height={780}
            />

            <div className="mx-auto max-w-4xl space-y-10">
              <p className="leading-8 text-slate-700">
                {t("differencesBridge")}
              </p>

              <div>
                <h3 className="mb-6 text-2xl font-bold leading-tight text-slate-950">
                  {t("guidanceTitle")}
                </h3>
                <div className="grid gap-5 lg:grid-cols-3">
                  <Observation label={t("guidanceGptLabel")} tone="gpt">
                    <p>{t("guidanceGptContent")}</p>
                  </Observation>
                  <Observation label={t("guidanceCanvaLabel")} tone="canva">
                    <p>{t("guidanceCanvaContent")}</p>
                  </Observation>
                  <Observation label={t("guidanceCurifyLabel")} tone="curify">
                    <p>{t("guidanceCurifyContent")}</p>
                  </Observation>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-2xl font-bold leading-tight text-slate-950">
                  {t("stressTestTitle")}
                </h3>
                <p className="leading-8 text-slate-700">
                  {t("stressTestIntro")}
                </p>
              </div>
            </div>

            <div className="space-y-14">
              <article className="space-y-7 border-t border-slate-200 pt-10">
                <h4 className="mx-auto max-w-4xl text-xl font-bold text-slate-950 sm:text-2xl">
                  {t("economicsTitle")}
                </h4>
                <EditorialFigure
                  src={t("economicsImage")}
                  alt={t("economicsImageAlt")}
                  caption={t("economicsCaption")}
                  width={2000}
                  height={1120}
                  dense
                />
                <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-2">
                  <Observation label={t("economicsGptLabel")} tone="gpt">
                    <p>{t("economicsGptContent")}</p>
                  </Observation>
                  <Observation label={t("economicsCanvaLabel")} tone="canva">
                    <p>{t("economicsCanvaContent")}</p>
                  </Observation>
                  <Observation
                    label={t("economicsCurifyLabel")}
                    tone="curify"
                    className="lg:col-span-2"
                  >
                    <p>{t("economicsCurifyIntro")}</p>
                    <ul className="list-disc space-y-2 pl-5">
                      <LabeledBullet label={t("economicsBullet1Label")}>
                        {t("economicsBullet1Content")}
                      </LabeledBullet>
                      <LabeledBullet label={t("economicsBullet2Label")}>
                        {t("economicsBullet2Content")}
                      </LabeledBullet>
                      <LabeledBullet label={t("economicsBullet3Label")}>
                        {t("economicsBullet3Content")}
                      </LabeledBullet>
                    </ul>
                    <p>{t("economicsCurifyConclusion")}</p>
                  </Observation>
                </div>
              </article>

              <article className="space-y-7 border-t border-slate-200 pt-10">
                <h4 className="mx-auto max-w-4xl text-xl font-bold text-slate-950 sm:text-2xl">
                  {t("chiikawaTitle")}
                </h4>
                <EditorialFigure
                  src={t("chiikawaImage")}
                  alt={t("chiikawaImageAlt")}
                  caption={t("chiikawaCaption")}
                  width={2000}
                  height={1120}
                  dense
                />
                <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-2">
                  <Observation label={t("chiikawaGptCanvaLabel")} tone="gpt">
                    <p>{t("chiikawaGptCanvaContent")}</p>
                  </Observation>
                  <Observation label={t("chiikawaCurifyLabel")} tone="curify">
                    <p>{t("chiikawaCurifyContent")}</p>
                  </Observation>
                </div>
              </article>

              <article className="space-y-7 border-t border-slate-200 pt-10">
                <h4 className="mx-auto max-w-4xl text-xl font-bold text-slate-950 sm:text-2xl">
                  {t("readingTitle")}
                </h4>
                <EditorialFigure
                  src={t("readingImage")}
                  alt={t("readingImageAlt")}
                  caption={t("readingCaption")}
                  width={2000}
                  height={1120}
                  dense
                />
                <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-3">
                  <Observation label={t("readingGptLabel")} tone="gpt">
                    <p>{t("readingGptContent")}</p>
                  </Observation>
                  <Observation label={t("readingCanvaLabel")} tone="canva">
                    <p>{t("readingCanvaContent")}</p>
                  </Observation>
                  <Observation label={t("readingCurifyLabel")} tone="curify">
                    <p>{t("readingCurifyContent")}</p>
                  </Observation>
                </div>
              </article>
            </div>
          </section>

          <section className="space-y-9 border-t border-slate-200 pt-12">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-4 text-3xl font-bold leading-tight text-slate-950">
                {t("valueTitle")}
              </h2>
              <p className="leading-8 text-slate-700">{t("valueIntro")}</p>
            </div>

            <div className="mx-auto max-w-4xl space-y-6">
              <h3 className="text-2xl font-bold leading-tight text-slate-950">
                {t("businessCaseTitle")}
              </h3>
              <p className="leading-8 text-slate-700">
                {t("businessCaseLead")}{" "}
                {t("businessCaseContent")}
              </p>
            </div>

            <EditorialFigure
              src={t("businessCaseImage")}
              alt={t("businessCaseImageAlt")}
              caption={t("businessCaseCaption")}
              width={2000}
              height={1272}
            />

            <div className="mx-auto max-w-4xl">
              <ul className="grid list-none gap-4 p-0 md:grid-cols-3">
                <li className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 leading-7 text-slate-700">
                  <strong className="text-slate-950">
                    {t("direction1Label")}
                  </strong>
                  {!t("direction1Label").endsWith("：") && " "}
                  {t("direction1Content")}
                </li>
                <li className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 leading-7 text-slate-700">
                  <strong className="text-slate-950">
                    {t("direction2Label")}
                  </strong>
                  {!t("direction2Label").endsWith("：") && " "}
                  {t("direction2Content")}
                </li>
                <li className="rounded-xl border border-orange-200 bg-orange-50/60 p-5 leading-7 text-slate-700">
                  <strong className="text-slate-950">
                    {t("direction3Label")}
                  </strong>
                  {!t("direction3Label").endsWith("：") && " "}
                  {t("direction3Content")}
                </li>
              </ul>
            </div>

            <div className="mx-auto max-w-4xl">
              <p className="mb-5 font-bold leading-8 text-slate-950">
                {t("businessValuesLead")}
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-5 sm:px-6">
                <ul className="list-disc space-y-4 pl-5 leading-7 text-slate-700">
                  <li>
                    <strong className="text-slate-950">
                      {t("businessValue1Label")}
                    </strong>{" "}
                    {t("businessValue1Content")}
                  </li>
                  <li>
                    <strong className="text-slate-950">
                      {t("businessValue2Label")}
                    </strong>{" "}
                    {t("businessValue2Content")}
                  </li>
                  <li>
                    <strong className="text-slate-950">
                      {t("businessValue3Label")}
                    </strong>{" "}
                    {t("businessValue3Content")}
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-8 sm:px-9 sm:py-10">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-5 text-3xl font-bold leading-tight text-slate-950">
                {t("conclusionTitle")}
              </h2>
              <div className="space-y-4 leading-8 text-slate-700">
                <p>{t("conclusionParagraph1")}</p>
                <p>{t("conclusionParagraph2")}</p>
                <p>{t("conclusionParagraph3")}</p>
              </div>
            </div>
          </section>
        </div>
      </BlogCodeBlockCopyTracker>
    </BlogInlineClickTracker>
  );
}
