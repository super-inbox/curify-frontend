import { WeddingGenerationEvidence } from "@/app/[locale]/_components/WeddingEvidence";
import { RecentBlogHero, RecentBlogFooter } from "@/app/[locale]/_components/RecentBlogEngagement";
import BlogInlineClickTracker from "@/app/[locale]/(public)/blog/[slug]/components/BlogInlineClickTracker";
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
    <><BlogInlineClickTracker blogSlug="choose-photo-for-ai-wedding-portraits"><article lang="en" className="mx-auto max-w-3xl px-4 py-10 text-neutral-800 [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:my-4 [&_p]:leading-8 [&_a]:text-indigo-700 [&_a]:underline [&_li]:my-2">
      <p className="text-sm">Curify · Updated November 23, 2026 · Photo preparation guide</p>
      <h1 className="text-3xl font-bold leading-tight md:text-5xl">{title}</h1>
      <RecentBlogHero slug="choose-photo-for-ai-wedding-portraits" locale={"en"} />
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

      <WeddingGenerationEvidence locale="en" source="blog/choose-photo-for-ai-wedding-portraits" />
      <h2>How we developed the ten-image custom collection</h2>
      <ol className="list-decimal pl-6">
        <li><strong>Separate identity from styling.</strong> The project used a reference the client had approved for facial identity. That approval did not mean every generated portrait was approved. We kept the intended full cheeks and facial proportions explicit rather than asking for generic beautification.</li>
        <li><strong>Specify one scene at a time.</strong> The Tang-inspired brief combined green and gold clothing with a painted folding screen; the Song-inspired direction used pale blue clothing and a quieter interior. Modern portraits explored window light and a flower garden. These were separate images, not one request to make a complete collection.</li>
        <li><strong>Compare people before choosing the prettiest scene.</strong> Check both faces against the reference, then hands, clothing, jewellery and proportions. The first Tang-inspired image required an extra-hand repair and a clothing revision.</li>
        <li><strong>Revise locally and review again.</strong> Keep a record of what should change and what should stay. A repair can introduce another defect. The retained production record marked the ten images as visually reviewed but awaiting client likeness approval; that distinction matters.</li>
      </ol>
      <p>The custom examples were made with an image-generation workflow and manual review, not by running the self-service wedding tool. The tool offers a simpler starting point for a single portrait; a coordinated collection needs its own scope and review process.</p>
      <h2>Use these wedding concepts as a review checklist</h2>
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
    </article></BlogInlineClickTracker><div className="mx-auto max-w-5xl px-4"><RecentBlogFooter slug="choose-photo-for-ai-wedding-portraits" locale={"en"} /></div></>
  );
}
