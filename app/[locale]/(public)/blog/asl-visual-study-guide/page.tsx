import type { Metadata } from "next";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";

const slug = "asl-visual-study-guide";
const title = "ASL Visual Study Guide: What Pictures Can—and Cannot—Teach";
const description = "Four ASL study infographics explain video practice, nonmanual cues, recording checks and translation review—with sources and clear limits on AI-generated diagrams.";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title, description,
    alternates: { canonical: getCanonicalUrl("en", `/blog/${slug}`), languages: getLanguagesMap(`/blog/${slug}`, ["en"]) },
    robots: { index: locale === "en", follow: true },
    openGraph: { title, description, type: "article", url: getCanonicalUrl("en", `/blog/${slug}`), images: ["https://cdn.curify-ai.com/images/nano_insp/template-asl-sign-language-tutorial-infographic-asl-study-workflow.jpg"] },
  };
}
function Poster({ id, alt, caption }: { id: string; alt: string; caption: string }) {
  return <figure className="my-8"><CdnImage src={`/images/nano_insp/template-asl-sign-language-tutorial-infographic-${id}.jpg`} alt={alt} width={1024} height={1536} className="mx-auto h-auto w-full max-w-lg rounded-xl" /><figcaption className="mt-3 text-sm text-neutral-600">{caption}</figcaption></figure>;
}
export default function AslVisualStudyGuide() {
  return <article lang="en" className="mx-auto max-w-3xl py-10 text-neutral-800 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:my-4 [&_p]:leading-8 [&_a]:text-indigo-700 [&_a]:underline [&_li]:my-2">
    <p className="text-sm">Curify editorial team · October 27, 2026 · 6 min read</p>
    <h1 className="text-3xl font-bold leading-tight md:text-5xl">{title}</h1>
    <p>An ASL infographic is useful as a reminder beside a video lesson. It can organize what to notice, record and review. It cannot demonstrate an entire signed message: movement unfolds over time, and a frozen pose leaves out transitions and context.</p>
    <p>This guide pairs four original concept posters with a practical study and review process. The illustrations were AI-generated and checked for the written concepts below. They do not demonstrate individual signs and have not been independently reviewed by an ASL linguist. Our existing sign-example artwork should likewise be treated as design inspiration, not verified signing instruction.</p>
    <h2>1. Use pictures to support video practice</h2>
    <p>Start with a lesson from a qualified ASL teacher or a Deaf-led resource such as <a href="https://www.lifeprint.com/">Lifeprint / ASL University</a>. Watch the complete example before pausing it. Use a note card to record what you noticed, then return to the moving sequence and seek feedback on your own signing.</p>
    <p>Our suggested routine is watch, notice, practice and check. A poster keeps that routine visible; it does not establish whether a handshape or movement is correct. Do not infer a complete sign from a generated hand illustration or assume that an English word label proves the picture is accurate.</p>
    <Poster id="asl-study-workflow" alt="ASL study routine: watch a trusted video, notice cues, practice in context, and check with a fluent signer." caption="A proposed study routine, illustrated as a memory aid rather than a sign lesson." />
    <h2>2. Look beyond the hands</h2>
    <p><a href="https://www.nidcd.nih.gov/health/american-sign-language">NIDCD describes ASL</a> as a natural language with grammar distinct from English. Facial and body movements are part of how signed meaning is communicated. An English word list and a handshape chart are therefore not a complete account of ASL.</p>
    <p>Professor Ronnie Wilbur’s <a href="https://cla.purdue.edu/directory/profiles/ronnie-wilbur.html">Purdue research profile</a> describes how nonmanual features interact with grammar and timing. That is why this poster prompts attention to the face, head, body and temporal context instead of assigning one facial expression a universal meaning. The cited researchers have not endorsed or reviewed this guide.</p>
    <Poster id="asl-nonmanual-cues" alt="ASL concept overview: face, head and body, timing, and context contribute to the whole message." caption="Concept overview only. Facial expressions are not a standalone translation key." />
    <h2>3. Record footage that can be inspected</h2>
    <p>For a practice recording or a permitted upload, check a short sample before recording the full session. Can you see the signer’s face and upper body? Do the hands remain in frame throughout the movement? Is motion blurred or obscured by shadows? A clear recording makes visual inspection easier, but does not establish model accuracy.</p>
    <p>Use footage you have permission to share. A publicly viewable lesson is not automatically licensed for uploading to another service, model training or redistribution. If a reviewer needs a clip, agree on access and permitted use before sharing it.</p>
    <Poster id="asl-recording-checklist" alt="ASL recording checklist: frame face and hands, use even light, review blur, and check permission." caption="A practical input checklist, not a guarantee of translation performance." />
    <h2>4. Review meaning, not just fluent English</h2>
    <p>In our <a href="/blog/building-asl-video-translator">ASL engineering experiments</a>, one apparently successful demo was reading captions burned into the video. We corrected that interpretation. The experience is a concrete reason to ask what evidence supports an output, rather than judge it by polished English alone.</p>
    <p>For an AI draft, replay the source and mark specific passages that need checking. Look for missing meaning, unsupported additions and uncertainty. A fluent ASL reviewer is needed to assess correctness; someone who can only read the English cannot independently verify the translation. Keep uncertainty visible instead of silently rewriting it into a confident sentence.</p>
    <Poster id="asl-translation-review" alt="Translation review process: compare source and draft, check meaning, flag uncertainty, and seek fluent ASL review." caption="An editorial review checklist informed by our engineering lessons; not a validated assessment instrument." />
    <h2>Choose the right next step</h2>
    <ul className="list-disc pl-6">
      <li><a href="/nano-template/asl-sign-language-tutorial-infographic">Browse the ASL infographic template</a> to create a concept poster or study reminder. Verify generated text and illustrations before using them for instruction.</li>
      <li><a href="/tools/asl-video-translator">Open the ASL video-to-English tool</a> if you have a permitted video and need a draft for review. Check its current price and limitations before starting.</li>
      <li><a href="/blog/asl-video-translator">Read the video translation workflow</a> for the practical tool steps, or the <a href="/blog/building-asl-video-translator">engineering article</a> for documented experiments and limitations.</li>
    </ul>
    <p>Learning ASL and generating an English draft are different tasks. Use teacher-led learning and direct feedback for the former. Treat automated output as something to inspect for the latter, not a substitute for qualified interpreting.</p>
    <h2>Sources and editorial scope</h2>
    <p>The language overview draws on NIDCD and the linked university research profile; Lifeprint is an independent learning resource. The four posters and study routine are Curify’s editorial synthesis, not a licensed curriculum or expert-certified sign reference. The engineering example comes from our separately documented experiments. No private signer footage is reproduced.</p>
  </article>;
}
