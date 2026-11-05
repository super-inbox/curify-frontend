import type { Metadata } from "next";
import InlineContactCapture from "@/app/[locale]/_components/InlineContactCapture";
import { getCanonicalUrl, getCanonicalPath, getLanguagesMap } from "@/lib/canonical";
const slug = "product-photos-to-feature-video";
const copy = {
  en: {
    title: "From product photos to a feature video: plan the action before the shoot",
    description: "A product-photography studio’s sample review revealed a practical gap: attractive stills do not necessarily show how a bag opens. A case note on inputs, pacing and review.",
    eyebrow: "PROJECT NOTES / 02 · PRODUCT VIDEO", intro: "A photography studio wanted a product-only bag video: no hands, an opening zipper and a clear view of the interior. The sample discussion exposed a useful distinction between making a product move and explaining how it works.",
    status: "An anonymized enquiry and sample review, not a completed client campaign. The studio had no active end-client project at the time of the recorded follow-up.",
    headings: ["The request: show the feature, not the operator", "The feedback: the action was hard to follow", "What we would photograph differently", "A shot plan to test before producing variants", "Review the mechanism as well as the look", "What happened next"],
    paragraphs: [
      "The studio had reviewed sample videos and wanted to combine aspects of them: keep the product on its own, remove hands from the presentation, and add an unzipping action so the viewer could see the inside and its features. This was a request for a specific functional demonstration, not simply a rotating hero shot.",
      "The later feedback described the video as too fast and choppy. The studio suggested photographing the product specifically for video creation to support a smoother result. That is the observed feedback. The record does not establish whether missing views, generation artifacts, editing pace or a combination caused the problem; a reshoot had not been validated as the fix.",
      "Our proposed next test would capture the same bag closed, partly open and fully open, with a separate clear view of the lining and compartments. Keep the camera, scale and lighting consistent so changes between frames describe the mechanism rather than a different viewpoint. Include a close view of the zipper path and any features that must remain exact. This is a recommended capture plan, not a claim that those additional images were supplied in this trial.",
      "Start with one short sequence whose action can be inspected, then adapt it to other formats only after review. The diagram below is a proposed storyboard, not frames from a delivered video. Agree on how long each state should remain visible; a longer pause may clarify a feature, but it will not repair an invented zipper or distorted lining.",
      "Compare the silhouette, handles, seams, logo and zipper track with the source photos. Watch the transition frame by frame for disappearing hardware, changing compartments or hands entering a product-only scene. Then watch at normal speed: can a new viewer understand what opened and what is inside? Review motion and product fidelity separately. If the available photos cannot support the action, request more views or discuss a filmed demonstration rather than promising an exact mechanism from a single still.",
      "The studio preferred project-by-project contact and had no current downstream client requesting the service. The available record does not establish a final selected output, paid engagement or repeat order. The practical next step is a better-specified sample: agreed source views, one action, clear feature visibility and a review of timing before a batch of variants.",
    ],
    states: [["01 · CLOSED", "Establish the product", "Show the shape and the starting position of the zipper."], ["02 · OPENING", "Make the action legible", "Keep the zipper path and hardware coherent through the transition."], ["03 · OPEN", "Hold on the feature", "Give the viewer time to inspect the real interior and compartments."]],
    diagram: "Proposed capture and storyboard plan · illustrative, not an output sample",
    scope: "Before requesting a batch", checklist: ["Share the product category and available closed, open and detail views.", "Name the exact action and features to demonstrate; specify whether hands are allowed.", "List the details that must remain unchanged and who will approve them.", "Specify duration, aspect ratios, number of variants and deadline.", "Approve one sample’s motion and fidelity before expanding the scope."],
    cta: "Discuss a product-video sample", ctaText: "Have product photos and a feature to show? Send the available views, desired action and number of videos. We’ll review whether the inputs support a sample and what additional material may be needed.", button: "Discuss my video batch", note: "Product type, sample-image link, action, duration, ratios, quantity and deadline", service: "Explore production and collaboration", subject: "Product feature video — sample and batch enquiry",
  },
  zh: {
    title: "商品照片做功能短片：拍之前，先想清楚动作",
    description: "一次商品摄影工作室的样片讨论：没有手出镜，如何展示包袋拉链打开和内部功能？从真实反馈整理输入、节奏与验收方法。",
    eyebrow: "项目手记 / 02 · 商品功能视频", intro: "一家商品摄影工作室想要一段只出现产品的包袋短片：不露手，拉开拉链，让观众看清内部功能。这次样片讨论让一个区别变得很具体——让商品动起来，和把功能讲明白，是两件事。",
    status: "本文来自匿名化的询盘与样片反馈，不是已交付的客户广告。记录中的后续沟通显示，工作室当时没有正在采购这项服务的终端客户。",
    headings: ["需求：展示功能，让操作者退场", "反馈：动作太快，也不够连贯", "下一次拍摄，我们会补什么", "先验证一段动作，再扩展版本", "既验收外观，也验收动作逻辑", "这次讨论进行到了哪里"],
    paragraphs: [
      "工作室看过样片后，希望结合不同版本的特点：保留纯产品展示，去掉手部出镜，再加入拉链打开的过程，让内部空间和功能可见。这里要解决的是具体的功能演示，而不只是做一个产品旋转镜头。",
      "后续反馈认为视频节奏有些快、衔接不够顺畅，并提出：如果拍摄商品时就考虑后续的视频制作，也许能得到更流畅的结果。这是实际收到的反馈。记录没有证明问题究竟来自缺失的视角、生成瑕疵、剪辑节奏，还是它们的组合；重新拍摄也尚未被验证为已经奏效的修复。",
      "我们建议下一轮分别拍摄同一个包的闭合、半开、完全打开状态，再补内部衬里和隔层的清晰照片。尽量固定机位、尺度和光线，让画面之间的差异来自产品动作，而不是视角变化。拉链路径和必须准确保留的功能部件应有细节图。这是建议的补拍方案，不代表本次试片已经收到这些素材。",
      "先做一段动作可检查的短序列，通过审核后再改成其他比例或版本。下面是建议的分镜结构，不是已交付视频的截图。每个状态停留多久，需要提前约定；延长停顿可能让功能更清楚，却不能修复凭空生成的拉链或变形的内衬。",
      "把轮廓、提手、缝线、标志和拉链轨迹与源照片逐项比对。逐帧检查是否有五金消失、隔层变化，或不该出现的手进入画面。再正常播放一遍：第一次看的观众能不能明白哪里打开了、里面是什么？动作流畅度和商品保真要分别验收。如果现有照片不足以支持动作，应补拍视角或讨论实拍演示，不能仅凭一张静态图就承诺准确还原机构运动。",
      "工作室表示倾向按项目合作，当时没有正在寻找该服务的终端客户。现有记录没有确认最终选片、付费委托或复购。下一步应是一份更明确的试片约定：输入视角齐全，只验证一个动作，让功能可见，先确认节奏，再讨论整批版本。",
    ],
    states: [["01 · 闭合", "先交代产品", "看清产品外形，以及拉链的起始位置。"], ["02 · 打开中", "让动作可读", "检查过渡中拉链路径和五金是否连贯。"], ["03 · 打开", "停留在功能上", "留出时间看清真实内部空间与隔层。"]],
    diagram: "建议的补拍与分镜结构 · 示意，不是成片输出",
    scope: "咨询批量制作前，先准备这些", checklist: ["提供产品品类，以及已有的闭合、打开和细节视图。", "说明要展示的动作与功能，以及是否允许手部出镜。", "列出必须保留的细节，并确定验收人。", "说明时长、比例、版本数量和交期。", "先确认一条样片的动作与保真，再扩大制作范围。"],
    cta: "先讨论一条商品功能样片", ctaText: "已经有产品照片，想把某个功能展示出来？提供现有视图、动作要求和视频数量。我们会先看输入能否支持试片，以及是否需要补充素材。", button: "咨询批量商品视频", note: "产品类型、样图链接、动作、时长、比例、数量与交期", service: "了解制作与合作方式", subject: "商品功能视频 — 试片与批量询盘",
  },
};
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const lang = locale === "zh" ? "zh" : "en"; const c = copy[lang];
  return { title: c.title, description: c.description, alternates: { canonical: getCanonicalUrl(lang, `/blog/${slug}`), languages: getLanguagesMap(`/blog/${slug}`, ["en", "zh"]) }, robots: { index: ["en", "zh"].includes(locale), follow: true }, openGraph: { title: c.title, description: c.description, type: "article", url: getCanonicalUrl(lang, `/blog/${slug}`) } };
}
export default async function ProductVideoCase({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; const lang = locale === "zh" ? "zh" : "en"; const c = copy[lang];
  return <article lang={lang} className="mx-auto max-w-4xl py-12 text-slate-800">
    <header><p className="text-xs font-semibold tracking-widest text-teal-700">{c.eyebrow}</p><h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">{c.title}</h1><p className="mt-6 text-lg leading-8 text-slate-600">{c.intro}</p><p className="mt-5 text-sm text-slate-500">Curify · 2026-11-05</p><p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm leading-7">{c.status}</p></header>
    {c.headings.map((h,i) => <section key={h} className="mt-10"><h2 className="text-2xl font-semibold">{h}</h2><p className="mt-4 leading-8">{c.paragraphs[i]}</p>{i===3 && <figure className="my-6"><div className="grid gap-4 md:grid-cols-3">{c.states.map(([n,t,d])=><div key={n} className="rounded-xl border border-teal-200 bg-teal-50 p-5"><p className="text-xs font-semibold tracking-wider text-teal-700">{n}</p><h3 className="my-3 text-lg font-semibold">{t}</h3><p className="text-sm leading-7">{d}</p></div>)}</div><figcaption className="mt-3 text-xs text-slate-500">{c.diagram}</figcaption></figure>}</section>)}
    <section className="mt-10"><h2 className="text-2xl font-semibold">{c.scope}</h2><ul className="mt-4 list-disc space-y-3 pl-6 leading-7">{c.checklist.map(x=><li key={x}>{x}</li>)}</ul></section>
    <section className="mt-12 rounded-2xl border border-teal-200 bg-teal-50 p-6 md:p-9"><h2 className="text-2xl font-semibold">{c.cta}</h2><p className="my-5 leading-7">{c.ctaText}</p><InlineContactCapture source={`case-study:${slug}`} trackingId={`case-study:${slug}:enquiry`} subject={c.subject} cta={c.button} note={c.note}/><a href={getCanonicalPath(lang,"/business")} className="mt-6 inline-block text-sm text-teal-800 underline">{c.service} →</a></section>
  </article>;
}
