import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import CdnImage from "../../../_components/CdnImage";

function pickLocaleImage(locale: string, zhSrc: string, enSrc: string) {
  return locale === "zh" ? zhSrc : enSrc; // all non-zh locales use English version
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aeVsComfyUi" });

  return {
    title: t("title"),
    description: t("intro1"),
  };
}

export default async function AeVsComfyUiPost({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aeVsComfyUi" });

  // images live under /public/images/
  const imgGuideCover = pickLocaleImage(
    locale,
    "/images/blogs/ComfyUI-Complete-Guide-zh.jpg",
    "/images/blogs/ComfyUI-Complete-Guide-en.jpg"
  );

  const imgWorkflowFull = pickLocaleImage(
    locale,
    "/images/blogs/ComfyUI-Complete-Workflow-zh.jpg",
    "/images/blogs/ComfyUI-Complete-Workflow-en.jpg"
  );

  const imgCaseFelt = pickLocaleImage(
    locale,
    "/images/blogs/ComfyUI-Practical-Case-zh.jpg",
    "/images/blogs/ComfyUI-Practical-Case-en.jpg"
  );

  return (
    <article className="pt-10 pb-8">
      <h1 className="text-4xl font-bold mb-6">{t("heading")}</h1>

      {/* Hero */}
      <div className="mb-10 rounded-2xl overflow-hidden shadow bg-white">
        <CdnImage
          src={imgGuideCover}
          alt={t("images.guideCoverAlt")}
          width={1400}
          height={700}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      <p className="mb-4">{t("intro1")}</p>
      <p className="mb-10">{t("intro2")}</p>

      {/* Section 1 */}
      <h2 className="text-2xl font-bold mt-12 mb-4">{t("sections.s1.title")}</h2>
      <p className="mb-4">{t("sections.s1.p1")}</p>
      <p className="mb-8">{t("sections.s1.p2")}</p>

      {/* Image: workflow full */}
      <div className="my-10 rounded-2xl overflow-hidden shadow bg-white">
        <CdnImage
          src={imgWorkflowFull}
          alt={t("images.workflowFullAlt")}
          width={1400}
          height={800}
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Section 2 */}
      <h2 className="text-2xl font-bold mt-12 mb-4">{t("sections.s2.title")}</h2>

      <h3 className="text-xl font-semibold mt-6 mb-3">{t("sections.s2.sub1.title")}</h3>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>{t("sections.s2.sub1.b1Strong")}</strong>
          {t("sections.s2.sub1.b1")}
        </li>
        <li>
          <strong>{t("sections.s2.sub1.b2Strong")}</strong>
          {t("sections.s2.sub1.b2")}
        </li>
        <li>
          <strong>{t("sections.s2.sub1.b3Strong")}</strong>
          {t("sections.s2.sub1.b3")}
        </li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-3">{t("sections.s2.sub2.title")}</h3>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>{t("sections.s2.sub2.b1Strong")}</strong>
          {t("sections.s2.sub2.b1")}
        </li>
        <li>
          <strong>{t("sections.s2.sub2.b2Strong")}</strong>
          {t("sections.s2.sub2.b2")}
        </li>
        <li>
          <strong>{t("sections.s2.sub2.b3Strong")}</strong>
          {t("sections.s2.sub2.b3")}
        </li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-3">{t("sections.s2.sub3.title")}</h3>
      <ul className="list-disc pl-6 mb-10 space-y-2">
        <li>
          <strong>{t("sections.s2.sub3.b1Strong")}</strong>
          {t("sections.s2.sub3.b1")}
        </li>
        <li>
          <strong>{t("sections.s2.sub3.b2Strong")}</strong>
          {t("sections.s2.sub3.b2")}
        </li>
        <li>
          <strong>{t("sections.s2.sub3.b3Strong")}</strong>
          {t("sections.s2.sub3.b3")}
        </li>
      </ul>

      {/* Image: case */}
      <div className="my-10 rounded-2xl overflow-hidden shadow bg-white">
        <CdnImage
          src={imgCaseFelt}
          alt={t("images.caseFeltAlt")}
          width={1400}
          height={800}
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Section 3 */}
      <h2 className="text-2xl font-bold mt-12 mb-4">{t("sections.s3.title")}</h2>

      <h3 className="text-xl font-semibold mt-6 mb-3">{t("sections.s3.sub1.title")}</h3>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>{t("sections.s3.sub1.b1Strong")}</strong>
          {t("sections.s3.sub1.b1")}
        </li>
        <li>
          <strong>{t("sections.s3.sub1.b2Strong")}</strong>
          {t("sections.s3.sub1.b2")}
        </li>
        <li>
          <strong>{t("sections.s3.sub1.b3Strong")}</strong>
          {t("sections.s3.sub1.b3")}
        </li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-3">{t("sections.s3.sub2.title")}</h3>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>{t("sections.s3.sub2.b1Strong")}</strong>
          {t("sections.s3.sub2.b1")}
        </li>
        <li>
          <strong>{t("sections.s3.sub2.b2Strong")}</strong>
          {t("sections.s3.sub2.b2")}
        </li>
        <li>
          <strong>{t("sections.s3.sub2.b3Strong")}</strong>
          {t("sections.s3.sub2.b3")}
        </li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-3">{t("sections.s3.sub3.title")}</h3>
      <ul className="list-disc pl-6 mb-10 space-y-2">
        <li>
          <strong>{t("sections.s3.sub3.b1Strong")}</strong>
          {t("sections.s3.sub3.b1")}
        </li>
        <li>
          <strong>{t("sections.s3.sub3.b2Strong")}</strong>
          {t("sections.s3.sub3.b2")}
        </li>
      </ul>

      {/* Section 4 */}
      <h2 className="text-2xl font-bold mt-12 mb-4">{t("sections.s4.title")}</h2>

      <h3 className="text-xl font-semibold mt-6 mb-3">{t("sections.s4.sub1.title")}</h3>
      <p className="mb-6">{t("sections.s4.sub1.p1")}</p>

      <h3 className="text-xl font-semibold mt-6 mb-3">{t("sections.s4.sub2.title")}</h3>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>{t("sections.s4.sub2.b1")}</li>
        <li>{t("sections.s4.sub2.b2")}</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-3">{t("sections.s4.sub3.title")}</h3>
      <ul className="list-disc pl-6 mb-10 space-y-2">
        <li>
          <strong>{t("sections.s4.sub3.b1Strong")}</strong>
          {t("sections.s4.sub3.b1")}
        </li>
        <li>
          <strong>{t("sections.s4.sub3.b2Strong")}</strong>
          {t("sections.s4.sub3.b2")}
        </li>
        <li>
          <strong>{t("sections.s4.sub3.b3Strong")}</strong>
          {t("sections.s4.sub3.b3")}
        </li>
      </ul>

      {/* Section 5 */}
      <h2 className="text-2xl font-bold mt-12 mb-4">{t("sections.s5.title")}</h2>

      <div className="overflow-x-auto mb-6">
        <table className="table-auto border-collapse border text-sm w-full">
          <thead>
            <tr>
              <th className="border px-4 py-3 bg-gray-100 text-left">
                {t("sections.s5.table.dimension")}
              </th>
              <th className="border px-4 py-3 bg-gray-100 text-left">
                {t("sections.s5.table.ae")}
              </th>
              <th className="border px-4 py-3 bg-gray-100 text-left">
                {t("sections.s5.table.comfy")}
              </th>
            </tr>
          </thead>
          <tbody>
            {["row1", "row2", "row3", "row4", "row5"].map((r) => (
              <tr key={r}>
                <td className="border px-4 py-3">{t(`sections.s5.table.${r}.dim`)}</td>
                <td className="border px-4 py-3">{t(`sections.s5.table.${r}.ae`)}</td>
                <td className="border px-4 py-3">{t(`sections.s5.table.${r}.comfy`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-5 rounded-2xl bg-gray-50 border mb-10">
        <p className="mb-2 font-semibold">{t("sections.s5.conclusionTitle")}</p>
        <p className="mb-0">{t("sections.s5.conclusion")}</p>
      </div>

      {/* Keep your original 2-col quick table from aeVsComfyUi.table */}
      <div className="overflow-x-auto mb-10">
        <table className="table-auto border-collapse border text-sm w-full">
          <thead>
            <tr>
              <th className="border px-4 py-2 bg-gray-100 text-left">
                {t("table.colAE")}
              </th>
              <th className="border px-4 py-2 bg-gray-100 text-left">
                {t("table.colComfy")}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">{t("table.row1a")}</td>
              <td className="border px-4 py-2">{t("table.row1b")}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">{t("table.row2a")}</td>
              <td className="border px-4 py-2">{t("table.row2b")}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">{t("table.row3a")}</td>
              <td className="border px-4 py-2">{t("table.row3b")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mb-12">{t("outro")}</p>

      {/* Section 6 */}
      <h2 className="text-2xl font-bold mt-12 mb-4">{t("sections.s6.title")}</h2>
      <ul className="list-disc pl-6 mb-10 space-y-2">
        <li>{t("sections.s6.b1")}</li>
        <li>{t("sections.s6.b2")}</li>
        <li>{t("sections.s6.b3")}</li>
      </ul>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-black text-white font-semibold"
        >
          {t("cta.primary")}
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center justify-center rounded-xl px-5 py-3 border font-semibold"
        >
          {t("cta.secondary")}
        </Link>
      </div>

      {/* Related Articles */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              slug: 'agents-vs-workflows',
              title: 'Part 2: Agents vs Workflows – From Control to Intelligence',
              date: 'October 28, 2025',
              readTime: '6 min read',
              tag: 'Creator Tools',
              image: '/images/agents-vs-workflows.jpg',
            },
            {
              slug: 'video-enhancement',
              title: 'AI Video Enhancement: Storyboards, Meme Captions & SFX Automation',
              date: 'November 18, 2025',
              readTime: '7 min read',
              tag: 'Creator Tools',
              image: '/images/video-enhancement-pipeline.png',
            },
            {
              slug: 'storyboard-to-pipeline',
              title: 'Create Your Own AI-Powered Comic Animation: A Simple Step-by-Step Guide',
              date: 'October 28, 2025',
              readTime: '5 min read',
              tag: 'Creator Tools',
              image: '/images/ai-animation-pipeline.jpg',
            }
          ].map((post) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.slug}
              className="group border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="relative h-40 w-full">
                <CdnImage
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="text-xs uppercase text-red-600 font-semibold mb-1">
                  {post.tag}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition">
                  {post.title}
                </h3>
                <div className="text-xs text-gray-500 mt-1">
                  {post.date} • {post.readTime}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            See all blog posts
          </Link>
        </div>
      </section>
    </article>
  );
}