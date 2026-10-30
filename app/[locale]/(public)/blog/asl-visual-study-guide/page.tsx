import type { Metadata } from "next";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";

const slug = "asl-visual-study-guide";
const title = "ASL Visual Guide: Hands, Movement and Facial Expressions";
const description = "Seven illustrated ASL comparisons explore size, handshape, sign location, palm orientation, repeated movement and facial grammar, with links to video lessons.";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title, description,
    alternates: { canonical: getCanonicalUrl("en", `/blog/${slug}`), languages: getLanguagesMap(`/blog/${slug}`, ["en"]) },
    robots: { index: locale === "en", follow: true },
    openGraph: { title, description, type: "article", url: getCanonicalUrl("en", `/blog/${slug}`), images: ["https://cdn.curify-ai.com/images/nano_insp/template-asl-sign-language-tutorial-infographic-five-parameters-visual.jpg"] },
  };
}
function Poster({ id, alt, caption }: { id: string; alt: string; caption: string }) {
  return <figure className="my-8"><CdnImage src={`/images/nano_insp/template-asl-sign-language-tutorial-infographic-${id}.jpg`} alt={alt} width={1024} height={1536} className="mx-auto h-auto w-full max-w-2xl rounded-xl" /><figcaption className="mt-3 text-sm text-neutral-600">{caption}</figcaption></figure>;
}
export default function AslVisualStudyGuide() {
  return <article lang="en" className="mx-auto max-w-3xl py-10 text-neutral-800 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:my-4 [&_p]:leading-8 [&_a]:text-indigo-700 [&_a]:underline [&_li]:my-2">
    <p className="text-sm">Curify editorial team · October 27, 2026 · 7 min read</p>
    <h1 className="text-3xl font-bold leading-tight md:text-5xl">{title}</h1>
    <p>In ASL, where a hand is placed can distinguish two signs. Repeating a movement can change a word, and the eyebrows can help mark a question. These seven visual comparisons draw attention to differences that are easy to miss when looking only at an English translation.</p>
    <p>The pictures are original AI-generated illustrations, not recordings of a teacher or independently certified sign demonstrations. Use them beside the linked video lessons to compare the full motion. They illustrate selected common forms; signing varies with context and community.</p>
    <h2>1. Five things to watch together</h2>
    <p><a href="https://www.nidcd.nih.gov/health/american-sign-language">NIDCD describes ASL</a> as a natural language with grammar distinct from English. A useful observation framework is handshape, location, movement, palm orientation and nonmanual cues. The last category includes the face, head and body. These features combine; a handshape on its own is not a dictionary definition.</p>
    <Poster id="five-parameters-visual" alt="Five ASL features shown with human demonstrations: handshape, location, movement, palm orientation and facial cues." caption="An overview of what to notice. The small demonstrations isolate features rather than form one complete sentence." />
    <h2>2. BIG and VERY BIG: watch the extent of the motion</h2>
    <p>A size description can use the space between the hands to make extent visible. The illustration uses a flat-hand variant, with palms facing each other and an outward movement. Its second row exaggerates the distance and adds a mouth cue. This is one way to express size, not a rule for every adjective or every use of “very.”</p>
    <p><a href="https://www.lifeprint.com/asl101/pages-signs/b/big.htm">Lifeprint’s BIG lesson</a> shows multiple forms and explains the role of movement size and the mouth morpheme CHA. Watch the lesson for the dynamic version; an open mouth in a still image cannot capture its articulation.</p>
    <Poster id="size-and-intensity" alt="A signer demonstrates a size description with outward-facing movement arrows, comparing moderate and wider hand separation." caption="The flat hands face each other. Compare the movement range and facial contribution, not just the final pose." />
    <h2>3. MOTHER and FATHER: location is information</h2>
    <p>In these common forms, an open hand with spread fingers is placed with the thumb at the chin for MOTHER and near the forehead for FATHER. The comparison keeps the handshape similar and changes its location. Watch the thumb’s contact point rather than the fingertips.</p>
    <p>See the independent video lessons for <a href="https://www.lifeprint.com/asl101/pages-signs/m/mom.htm">MOTHER</a> and <a href="https://www.lifeprint.com/asl101/pages-signs/d/dad.htm">FATHER</a>. Variants exist; this pair does not imply a universal gender rule for all ASL vocabulary.</p>
    <Poster id="mother-father-location" alt="MOTHER and FATHER comparison showing an open hand with the thumb at the chin versus the forehead." caption="Same basic open handshape, different location. Confirm the movement in the linked lessons." />
    <h2>4. Questions: eyebrows carry grammatical information</h2>
    <p>A common introductory contrast is raised eyebrows for yes/no questions and lowered eyebrows for information-seeking WH-questions. These are grammatical signals, not simply a happy-versus-angry comparison. The pictured head and face positions are isolated cues rather than complete signed questions.</p>
    <p><a href="https://www.lifeprint.com/asl101/lessons/lesson02.htm">Lifeprint’s question lesson</a> explains the contrast and its exceptions. Rhetorical questions and conversational greetings can use different patterns. Facial cues must be read with the signs and the situation.</p>
    <Poster id="questions-on-the-face" alt="The same signer compares raised and lowered eyebrows, with closeups highlighting the two common question patterns." caption="Notice the eyebrows rather than assigning an emotion. Context and timing matter." />
    <h2>5. A and S handshapes: a small thumb difference</h2>
    <p>Both shapes involve a closed fist. In the A handshape, the thumb sits beside the fist; in the S handshape, it crosses the front of the folded fingers. Side-by-side closeups make that distinction easier to inspect. Handshape names are convenient labels and do not mean that every sign using one translates into that English letter or word.</p>
    <Poster id="a-s-thumb-position" alt="Closeups of A and S handshapes compare a thumb beside the fist with a thumb across the folded fingers." caption="Compare the thumb placement while keeping the other fingers curled." />
    <h2>6. Palm orientation: the direction of the hand matters</h2>
    <p>A hand can keep a similar shape while its palm faces outward, inward, up or down. The four views show those directions relative to the signer. They are orientation demonstrations, not four vocabulary signs. To identify a sign, inspect the remaining features and the surrounding message too.</p>
    <p>Lifeprint’s <a href="https://www.lifeprint.com/asl101/topics/parameters-asl.htm">discussion of ASL parameters</a> provides context for comparing these features rather than memorizing a disconnected pose.</p>
    <Poster id="palm-orientation-views" alt="Four human demonstrations show an open hand facing outward, inward, up and down relative to the signer." caption="Same general handshape, different palm directions. No standalone word meanings are assigned." />
    <h2>7. SIT and CHAIR: count the movements</h2>
    <p>This familiar noun–verb pair uses a similar two-handed arrangement. The common SIT form has one movement; CHAIR has a smaller repeated movement. The arrows are a reminder to inspect motion, not a replacement for watching it. Do not generalize the pattern to every ASL noun and verb.</p>
    <p>Compare the video demonstrations for <a href="https://www.lifeprint.com/asl101/pages-signs/s/sit.htm">SIT</a> and <a href="https://www.lifeprint.com/asl101/pages-signs/c/chair.htm">CHAIR</a>, including hand arrangement, contact and repetition.</p>
    <Poster id="sit-chair-movement" alt="SIT and CHAIR comparison uses crossed two-finger handshapes and arrows to distinguish one movement from two small movements." caption="Static frames make the hand arrangement visible; the video supplies the actual timing and motion." />
    <h2>What these pictures mean for ASL video translation</h2>
    <p>These comparisons show why a single frame or an English word list cannot fully represent a signed message. In our <a href="/blog/building-asl-video-translator">ASL engineering experiments</a>, an apparently successful demo was actually reading subtitles in the video. We corrected that interpretation: plausible English was not evidence that the model had understood the signing.</p>
    <p>If you use the <a href="/tools/asl-video-translator">ASL video-to-English tool</a>, treat the output as a draft. A fluent ASL reviewer should compare meaning, omissions and uncertainty against the source. The tool is separate from the poster generator and is not a substitute for qualified interpreting.</p>
    <p>For more visual examples, open the <a href="/nano-template/asl-sign-language-tutorial-infographic">ASL infographic template</a>. For upload and output steps, see the <a href="/blog/asl-video-translator">video translation guide</a>.</p>
    <h2>Sources and image provenance</h2>
    <p>The linked NIDCD and Lifeprint pages support the concepts described here. The pictures are newly generated, not copied teacher photographs. These organizations and teachers have not endorsed or reviewed this article. Image prompts and editorial checks are recorded with our content drop; independent fluent-ASL review is still needed before treating the illustrations as teaching references.</p>
  </article>;
}
