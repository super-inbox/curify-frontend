import type { Metadata } from "next";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";
import checklist from "@/public/resources/photo-retouching-quality-checklist-v1.json";

const path = "/resources/ai-photo-retouching-quality-checklist";
const title = "AI Photo Retouching Quality Checklist";
const description = "A free, reusable 18-point photo retouching QA checklist: faces, hair, garments, jewelry, backgrounds, batch consistency, rework and delivery sign-off.";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title, description, alternates: { canonical: getCanonicalUrl("en", path), languages: getLanguagesMap(path, ["en"]) }, robots: { index: locale === "en", follow: true }, openGraph: { title, description, url: getCanonicalUrl("en", path), type: "article" } };
}

export default function RetouchingChecklist() {
  return <article lang="en" className="mx-auto max-w-4xl px-5 py-12 text-neutral-800 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:my-4 [&_p]:leading-7 [&_a]:text-purple-800 [&_a]:underline">
    <p className="text-sm">Curify open resources · Version 1.0 · October 21, 2026</p>
    <h1 className="text-4xl font-bold leading-tight">{title}</h1>
    <p>Use this checklist to agree an editing brief, review a sample and decide whether a photo batch is ready to deliver. It covers wedding and portrait photography, fashion and ecommerce products. It works for manual, AI-assisted and mixed workflows.</p>
    <div className="my-6 rounded-2xl border border-purple-200 bg-purple-50 p-6">
      <h2 className="!mt-0">Download and use it with your next batch</h2>
      <p>No signup required. The editable text includes a batch plan, defect log and sign-off fields. The JSON version lets workflow builders reuse the same checks.</p>
      <div className="flex flex-wrap gap-5 font-semibold"><a href="/resources/photo-retouching-quality-checklist-v1.txt" download>Download editable checklist (.txt)</a><a href="/resources/photo-retouching-quality-checklist-v1.json" download>Download structured checks (.json)</a></div>
    </div>
    <h2>Agree the acceptance rules before editing</h2>
    <p>Record the source files, reference look, permitted changes, must-preserve details, formats, dimensions and reviewer. Mark each check <strong>Pass</strong>, <strong>Rework</strong>, <strong>Hold</strong>, or <strong>Not applicable</strong> with a reason. Hold means do not deliver the affected file until the issue is resolved. These are proposed operating rules, not a certification or a measured quality guarantee.</p>
    <p>Keep the original and output side by side at the same scale. Use 100% zoom for defects and the intended display size for overall appearance. An average quality score must not hide an identity change, altered product construction or an invented object.</p>
    <h2>The 18 review checks</h2>
    <ol className="grid gap-4 md:grid-cols-2">
      {checklist.checks.map((c, i) => <li key={c.id} id={c.id} className="rounded-xl border border-neutral-200 p-5 break-inside-avoid"><h3 className="font-semibold">{i + 1}. {c.category}</h3><p className="text-sm">{c.review}</p><p className="text-sm font-medium">{c.decision}</p></li>)}
    </ol>
    <h2>Worked review examples</h2>
    <p>These supplied and generated demonstration images illustrate what to inspect. They are not accepted customer deliveries or a scored benchmark. A bright result still needs comparison against the original product.</p>
    <figure className="my-7">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/service-examples/sandals-before-after.jpg" width={1536} height={1024} loading="lazy" className="h-auto w-full rounded-xl" alt="Supplied sandal comparison with grey and bright white settings" />
      <figcaption className="mt-3 text-sm leading-6">Footwear: compare the ankle straps, buckle, heel profile, sole and toe opening. Review the contact shadow separately from the brighter background. Use a trusted colour reference before approving leather colour.</figcaption>
    </figure>
    <figure className="my-7">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/service-examples/jewelry-before-after.jpg" width={1534} height={1025} loading="lazy" className="h-auto w-full rounded-xl" alt="Supplied ring comparison showing stronger highlights and a lighter background" />
      <figcaption className="mt-3 text-sm leading-6">Jewelry: inspect stone count, prongs, engraving and band thickness before judging sparkle. Enhanced highlights do not establish gemstone quality. If a stone or structural detail changes, hold the image regardless of its visual polish.</figcaption>
    </figure>
    <p>For skin, hair and wedding clothing, the <a href="/blog/choose-photo-for-ai-wedding-portraits">wedding portrait review guide</a> uses clearly labelled concept artwork to explain face, veil, garment and background checks.</p>
    <h2>Batch review and common failure decisions</h2>
    <ul className="list-disc space-y-3 pl-5">
      <li><strong>Review every image for critical changes:</strong> identity, product construction, branding and unapproved scene changes.</li>
      <li><strong>Agree a separate finish-review sample:</strong> cover each lighting condition, material, pose and processing variant. Record the sample size and selection method; there is no universal percentage that makes a batch safe.</li>
      <li><strong>Repeated colour drift or halos:</strong> expand review to the affected group, correct the shared process and recheck. Do not accept the batch because the hero image looks good.</li>
      <li><strong>Waxy skin or missing lace:</strong> mark the exact area and requested correction. Keep the original, output version and evidence crop together.</li>
      <li><strong>Invented objects or garment details:</strong> hold the file and verify whether the brief explicitly permitted the change. A prettier result is not approval.</li>
    </ul>
    <h2>Record revisions and sign-off</h2>
    <p>For each defect, record file ID, severity, requested correction, owner, output version and recheck result. Keep accepted and held files separate. Record who approved the final files and any explicitly accepted exceptions before delivery.</p>
    <h2>Reuse and attribution</h2>
    <p>{checklist.reuse}</p>
    <p>Suggested citation: Curify, <em>AI Photo Retouching Quality Checklist</em>, version 1.0, October 21, 2026. Link to this page so readers can find the version and downloads.</p>
    <h2>Need help reviewing or editing a batch?</h2>
    <p>Use the checklist to prepare your brief for our <a href="/tools/product-photo-retouching-service#request-samples">product photo retouching service</a> or <a href="/use-cases/for-photographers">wedding and portrait editing service</a>. Include image count, deadline, reference finish and must-preserve details. Scope and price follow sample review.</p>
  </article>;
}
