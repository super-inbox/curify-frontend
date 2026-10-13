import type { Metadata } from "next";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";

const slug = "building-asl-video-translator";
const title = "Building an ASL Video Translator: Experiments, Failures and Evaluation";
const description = "What Curify learned from building an ASL-to-English pipeline: caption leakage, frame inspection, controlled experiments and the gap between research scores and usable translation.";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title, description,
    alternates: { canonical: getCanonicalUrl("en", `/blog/${slug}`), languages: getLanguagesMap(`/blog/${slug}`, ["en"]) },
    robots: { index: locale === "en", follow: true },
    openGraph: { title, description, type: "article", url: getCanonicalUrl("en", `/blog/${slug}`) },
  };
}

export default function AslEngineeringArticle() {
  return (
    <article lang="en" className="mx-auto max-w-3xl py-10 text-neutral-800 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:my-4 [&_p]:leading-8 [&_a]:text-indigo-700 [&_a]:underline [&_li]:my-2">
      <p className="text-sm font-medium uppercase tracking-wide">Curify engineering · October 13, 2026</p>
      <h1 className="text-3xl font-bold leading-tight md:text-5xl">{title}</h1>
      <p>By the Curify engineering team. Based on our experiment records through October 12, 2026.</p>
      <p>Building an ASL video translator taught us how easily plausible English can look like a successful translation. A fluent sentence, a tidy subtitle file and a repeatable response are all useful engineering properties. None establishes that the system understood the signing.</p>
      <p>This is a record of what we tested and what changed our decisions. The experimental <a href="/tools/asl-video-translator">ASL video-to-English tool</a> and the research models discussed below are separate. Our October results do not establish a production accuracy improvement or a validated replacement model.</p>
      <aside className="my-6 rounded-xl border border-amber-300 bg-amber-50 p-5">
        <strong>Scope of the evidence</strong>
        <p>These are internally recorded experiments, not an independently replicated benchmark report. We publish aggregate findings and methods here, without private user videos, transcripts or inspection-sheet frames. Research metrics are not percentages of translation accuracy.</p>
      </aside>

      <h2 id="caption-leakage">1. Check whether the model is reading the answer</h2>
      <p>One early demo appeared to translate a signed clip well. Inspection showed that the model was reading captions already burned into the frames. We retracted the result as evidence of sign-language understanding.</p>
      <p>The evaluation input must not contain the reference answer. That means checking visible text, prompts and how references were written, rather than assuming a video input makes a test independent. An internally produced translation with no recorded annotation method can help diagnose a failure, but it should not become an official accuracy score.</p>
      <p>Our practical change was to distinguish diagnostic examples from independent evaluation clips. A successful-looking demo now raises a question: which visual evidence supports the predicted meaning?</p>

      <h2 id="inspection">2. Inspect the frames the recognizer actually received</h2>
      <p>Our frame inspector aligns sampled frames, batch boundaries, reference cues and saved predictions on one timeline. It lets us ask whether a cue had enough temporal coverage, whether a transition crossed a batch boundary, and whether the text follows the visible action.</p>
      <p>The inspector must match the saved run. Recreating frames with a newer sampler or a different budget would explain a different input. We therefore preserve the sampling configuration alongside predictions. The historical inspection sheet used 96 frames; later duration-dependent sampling is not interchangeable with that record.</p>
      <figure className="my-8 rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
        <figcaption className="mb-4 text-lg font-semibold">An inspection sheet connects evidence to a claim</figcaption>
        <ol className="grid list-none gap-3 p-0 sm:grid-cols-2">
          {[
            ["1. Freeze the input", "Record the clip, model, prompt and sampling configuration."],
            ["2. Align the timeline", "Show sampled frames, cue times and batch boundaries together."],
            ["3. Compare meaning", "Check the prediction against an independent reference and fluent review."],
            ["4. Record the limit", "Separate an observed failure from a tested causal explanation."],
          ].map(([heading, body]) => <li key={heading} className="rounded-xl bg-white p-4"><strong>{heading}</strong><span className="mt-2 block text-sm leading-6">{body}</span></li>)}
        </ol>
        <p className="text-sm">Schematic of our inspection method; no signer images or private inspection data are reproduced.</p>
      </figure>

      <h2 id="temporal-tests">3. More frames did not establish better understanding</h2>
      <p>We tested denser sampling, uniform sampling, and overlapping batches with shared context. In our 12-clip diagnostic study, none of these frame-based variants recovered correct meaning. This is a result for that setup and sample, not proof that temporal modeling cannot help.</p>
      <p>A lower word error rate can also conceal a worse result. In one batching comparison, WER improved while character overlap fell and output became shorter. Looking only at one metric would have rewarded the system for saying less.</p>
      <p>Likewise, lowering generation temperature can make repeated runs more consistent without making their interpretation correct. Repeatability is valuable for debugging; it is not a substitute for meaning-level evaluation.</p>

      <h2 id="controlled-experiments">4. Compare data and representation under explicit controls</h2>
      <p>Our October landmark-model experiment held initialization and the 10,320-step compute budget fixed while increasing supervised training data. The frozen 147-clip evaluation did not show a sustained BLEU gain.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm [&_th]:border-b [&_th]:p-3 [&_td]:border-b [&_td]:p-3">
          <caption className="mb-3 text-left">Internal same-initialization data-scaling experiment, completed October 11</caption>
          <thead><tr><th scope="col">Training clips</th><th scope="col">Frozen-147 BLEU</th><th scope="col">Distinct predictions</th></tr></thead>
          <tbody>{[["2,751", "0.80", "63/147"], ["6,605", "1.15", "73/147"], ["13,210", "0.54", "35/147"], ["26,419", "0.52", "29/147"]].map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <p>The best increase was not statistically significant in our bootstrap comparison. Each condition used one seed; larger datasets received fewer epochs at fixed compute. This does not show that more sign-language pretraining data is unhelpful.</p>
      <p>A separate representation experiment held downstream supervision at 2,751 clips. Frozen Uni-Sign features improved BLEU from 1.023 to 3.249 and chrF from 11.121 to 17.049 on frozen-147. This comparison is separate from the same-initialization scaling table above.</p>
      <p>That supports representation as a bottleneck in our recipe. It does not isolate architecture from pretraining: the encoder had much more prior training, and a timing-matched check showed that preprocessing explained part of the raw gain. Seeds were not replicated, and the dataset shares signers between training and test. We cannot call these numbers customer-video accuracy.</p>

      <h2 id="preprocessing">5. A benchmark gap can contain several different problems</h2>
      <p>For Uni-Sign, the authors’ released predictions scored 14.50 BLEU-4 on the full 2,349-clip How2Sign test and 9.59 on our harder 128-clip subset. Our inference path scored 5.39 on that same subset. Comparing 14.50 directly with 5.39 would mix subset difficulty with our implementation gap.</p>
      <p>We found timing and crop differences worth testing. In 28 of those 128 clips, our original time interval and the officially realigned interval had no overlap. But these observations do not yet assign a causal share of the remaining 4.20 BLEU gap. A controlled path reproduction is still needed, and released predictions are not a fresh checkpoint run.</p>
      <p>We credit <a href="https://github.com/ZechengLi19/Uni-Sign">Uni-Sign and its authors</a> for the research baseline. Our evaluation findings describe our own integration experiments, not a claim that we reproduced every upstream result.</p>

      <h2 id="accuracy">How should ASL-to-English translation accuracy be evaluated?</h2>
      <ul className="list-disc pl-6">
        <li>Use independent references and audit visible-caption or prompt leakage.</li>
        <li>Freeze the evaluation split, model version and preprocessing; report sample sizes.</li>
        <li>Compare meaning, omissions, repetitions and timing alongside text-overlap metrics.</li>
        <li>Use fluent ASL review for correctness claims. Fluent English alone is not a quality check.</li>
        <li>Test the intended input distribution. A research-dataset gain does not establish performance on uploaded videos.</li>
      </ul>
      <p>Our historical 128-clip production-shaped evaluation also used a different model from the deployed recognizer because of evaluation-account access. It must not be presented as a measurement of the exact live configuration. Keeping that distinction visible is part of the evaluation, not a footnote to remove from a chart.</p>

      <h2 id="current-product">What this means for the current tool</h2>
      <p>The October research work did not replace the production recognizer. A locally prepared alternative-backend switch is an integration option, not evidence that a better model has shipped. Repetition, long-input behavior and quality on customer footage remain deployment questions.</p>
      <p>If you need to <a href="/tools/asl-video-translator">translate an ASL video into an English draft</a>, check the current tool’s price and limitations before uploading. Review the result against the signing with a fluent ASL reviewer. Successful export of text or subtitles is not proof that the translation is correct.</p>
      <p>For the practical steps, read our <a href="/blog/asl-video-translator">ASL video translation guide</a>. For engineering work, the next useful experiment is one that can distinguish competing explanations—not another polished demo.</p>

      <h2 id="sources">Sources and research context</h2>
      <p>The internal source record is Curify’s ASL engineering index, including its caption-leakage correction, frame-inspector notes, temporal ablations and October 12 consolidation of controlled experiments completed through October 11. The underlying private corpus is not a public benchmark and is not redistributed here.</p>
      <ul className="list-disc pl-6">
        <li><a href="https://how2sign.github.io/">How2Sign: dataset and documentation</a> — consult its terms before using or redistributing data.</li>
        <li><a href="https://arxiv.org/abs/2501.15187">Uni-Sign: Toward Unified Sign Language Understanding at Scale</a> — upstream research, separate from our integration results.</li>
      </ul>
    </article>
  );
}
