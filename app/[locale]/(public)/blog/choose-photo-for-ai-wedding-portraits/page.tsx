import type { Metadata } from "next";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";
import { IMAGE_GENERATION_CREDITS } from "@/lib/pricing";

const slug = "choose-photo-for-ai-wedding-portraits";
const title = "How to Choose a Couple Photo for AI Wedding Portraits";
const description = "Choose a clear couple photo, write a focused wedding portrait brief, and check faces, hands and clothing before keeping a generated image.";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title, description,
    alternates: {
      canonical: getCanonicalUrl("en", `/blog/${slug}`),
      languages: getLanguagesMap(`/blog/${slug}`, ["en"]),
    },
    robots: { index: locale === "en", follow: true },
    openGraph: { title, description, type: "article", url: getCanonicalUrl("en", `/blog/${slug}`) },
  };
}

export default function WeddingPhotoInputGuide() {
  return (
    <article lang="en" className="mx-auto max-w-3xl px-4 py-10 text-neutral-800 [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:my-4 [&_p]:leading-8 [&_a]:text-indigo-700 [&_a]:underline [&_li]:my-2">
      <p className="text-sm">Curify · October 20, 2026 · Photo preparation guide</p>
      <h1 className="text-3xl font-bold leading-tight md:text-5xl">{title}</h1>
      <p>A convincing wedding-inspired portrait starts with a photo in which you can recognize both people clearly. Before choosing a garden, studio or traditional wedding look, check what the source actually shows: faces, skin tone, hair and the details you want the result to retain.</p>
      <p>This guide explains how to prepare a reference for the <a href="/tools/ai-wedding-photo-generator#reproduce">AI wedding photo generator</a>. The existing concept artwork below illustrates things to inspect; it is not a benchmark of that tool or a client delivery.</p>

      <h2>Choose one clear photo of both adults</h2>
      <ul className="list-disc pl-6">
        <li><strong>Both faces visible:</strong> choose a frame without sunglasses, deep facial shadows or hair covering important features. If one person is far behind the other, use a different photo.</li>
        <li><strong>Enough detail to compare:</strong> zoom in on each face. If you cannot distinguish the eyes and mouth, the source gives you little basis for checking the output. Use the original file rather than a screenshot where possible.</li>
        <li><strong>A readable pose:</strong> avoid hands hidden behind faces or tightly overlapping arms for your first attempt. A simple pose makes changes easier to notice.</li>
        <li><strong>A suitable crop:</strong> a close portrait gives you facial detail; a wider frame shows posture and clothes. A generated full-length result from a headshot necessarily invents details outside the original crop.</li>
      </ul>
      <p>The current tool takes one JPEG, PNG or WebP reference. Start with one photograph of you together, not a contact sheet, a before/after poster or two unrelated portraits pasted side by side. Use photos you have permission to upload.</p>

      <h2>Choose the scene, then write a short brief</h2>
      <p>The tool offers studio, garden and traditional Chinese wedding portrait styles. Choose one, then describe the setting and the details that matter. These are requests to a generative model, not guarantees that every feature will remain unchanged.</p>
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
        <p className="font-semibold">Example brief for a garden portrait</p>
        <p>Soft afternoon light in a quiet garden. Understated wedding attire and a relaxed pose. Keep both adults recognizable, including their hair colour and facial features. Avoid text, logos and extra people.</p>
      </div>
      <p>For a pre-wedding concept, describe the atmosphere you want to explore. For a particular garment, identify the details you care about, then check them in the result: an instruction to preserve lace or embroidery does not establish that it happened.</p>

      <h2>Use these wedding concepts as a review checklist</h2>
      <figure className="my-8">
        {/* Reuse the authorized complete card, including its provenance footer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/generation-examples/wedding-retouching-concepts.jpg" width={1122} height={1402} loading="lazy" className="h-auto w-full rounded-xl" alt="Three synthetic wedding retouching concepts showing cliff lighting, a bridal close-up and a beach scene; not outputs from the wedding generator" />
        <figcaption className="mt-3 text-sm leading-6 text-neutral-600">Existing Curify social-series artwork, reused with permission. Both sides are AI-generated retouching concepts created outside this generator. The full card and its disclosure footer are retained. These are not customers’ wedding photographs.</figcaption>
      </figure>
      <p><strong>Cliff-top couple:</strong> the concept changes the light and sky. When reviewing a new generation, compare both faces separately and inspect the veil, dress silhouette and overlapping hands. An attractive sunset does not establish that the couple’s identities were preserved.</p>
      <p><strong>Bridal close-up:</strong> look at eyes, hairline and skin texture rather than brightness alone. This single-person illustration is useful for discussing detail checks; it is not the recommended two-person upload for the couple generator.</p>
      <p><strong>Beach portrait:</strong> examine the dress edges, feet and background. A generated scene can change objects or add details. If your goal is to preserve an actual wedding moment, consider editing the original photograph instead.</p>

      <h2>Review the result before generating a whole collection</h2>
      <ol className="list-decimal pl-6">
        <li>Compare each face with the source. Check age, facial proportions, skin tone and distinctive features.</li>
        <li>Inspect hands, arms, teeth, jewellery and any contact between the two people.</li>
        <li>Check garment seams, lace, embroidery and the boundaries of a veil against the background.</li>
        <li>Decide whether the scene fits your intended use. Label it appropriately when sharing; it is not documentary evidence of a ceremony.</li>
      </ol>
      <p>If a face is wrong, try a clearer reference before requesting more elaborate styling. If only the setting misses your brief, simplify the setting instructions. Review each new result: repeated generation is not a promise of identical people or consistent garments.</p>
      <p>Generation currently uses {IMAGE_GENERATION_CREDITS} credits per completed image. Watermark removal is a separate optional purchase shown with the result. Read the displayed price before generating or purchasing a clean download.</p>

      <h2>Generation or wedding photo editing?</h2>
      <p>Use generation when you want a newly imagined portrait or pre-wedding concept. Use <a href="/tools/wedding-photo-editing">wedding and portrait editing</a> when the task concerns an existing photograph. Photographers seeking a consistent finish across captured galleries can <a href="/use-cases/for-photographers">discuss batch wedding photo editing</a>; that service starts with a brief and sample review.</p>
      <p>For editing budgets, read the <a href="/blog/wedding-photo-retouching-cost">wedding photo retouching cost guide</a>. For a creative portrait, <a href="/tools/ai-wedding-photo-generator#reproduce">choose your photo and open the wedding generator</a>.</p>
    </article>
  );
}
