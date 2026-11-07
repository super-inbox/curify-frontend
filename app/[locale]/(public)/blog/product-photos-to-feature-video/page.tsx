import type { Metadata } from "next";
import InlineContactCapture from "@/app/[locale]/_components/InlineContactCapture";
import { getCanonicalUrl, getCanonicalPath, getLanguagesMap } from "@/lib/canonical";
const slug = "product-photos-to-feature-video";
const copy = {
  en: {
    title: "From product photos to a feature video: the ZEELUM backpack demo",
    description: "Watch the 10-second ZEELUM backpack demo and follow the process from supplied product photos to relit frames, generated motion and a product-only edit.",
    eyebrow: "PROJECT NOTES / 02 · PRODUCT VIDEO", intro: "A photography studio wanted a product-only bag video: no hands, an opening zipper and a clear view of the interior. The sample discussion exposed a useful distinction between making a product move and explaining how it works.",
    status: "The final generated demo from our ZEELUM trial (V10), based on supplied product photographs. This is an AI-assisted sample, not evidence of an approved client campaign or sales results. The web version is silent.",
    headings: ["Start with photographs that show the product", "Unify the stills before adding motion", "Generate camera movement and the opening action", "Assemble the final 10-second product-only edit", "Check the mechanism as well as the look", "What the trial established—and what remains"],
    paragraphs: [
      "The supplied black backpack photographs provided separate views of the exterior, branding and interior. We used the views recorded as BACKPACK_BLACK_05, _14 and _07 for the studio treatment, and BACKPACK_BLACK_11 for the actual open lower compartment. That open photograph matters: it gives the model a reference for the flap, lining and zipper rather than asking it to invent an unseen interior.",
      "We used image editing to place the supplied photographs in a consistent charcoal studio, with a neutral softbox and edge light. The instructions preserved the bag silhouette, seams, zipper tracks and LEGENDS lettering while making the black textile and interior readable. These are generated relit frames, not a new physical photoshoot; texture and lettering still need comparison with the originals.",
      "For the hero and interior shots, MiniMax-H3 animated the prepared stills with a camera arc and a controlled inward glide. The lower-compartment shot used a different construction: start from the known open reference, generate a six-second closing movement, then reverse the clip to show opening. This made the visible interior the starting constraint. It remains an AI visualization, not filmed proof of how the physical mechanism moves.",
      "V10 reused the earlier hero, label and interior material with the product-only opening clip; this final edit did not require a new generation. The timing is 0–1.5 seconds for the hero, 1.5–2.25 for the label, 2.25–7 for the opening, 7–8.5 for the main interior and 8.5–10 for the closing hero shot. The 1080 × 1080 output runs at 24 fps. There are no hands or narration; the reference soundtrack has been removed for this web presentation.",
      "Compare the silhouette, handles, seams, logo and zipper track with the source photos. Inspect transitions for changing hardware, invented compartments and distorted fabric; then watch at normal speed to check whether the opening is readable. The production record includes sampled-frame checks. Those checks do not establish exact mechanical fidelity across every frame, and the trial feedback still described the pace as fast and choppy.",
      "This trial demonstrates a practical path from existing photographs to one short feature sequence, including reuse of successful shots across versions. It does not establish client approval, a paid campaign or a repeat order. For the next sample, we would request consistent closed, partly open and fully open views, agree the motion and hold times, and approve one sequence before producing a batch."
],
    states: [["01 · CLOSED", "Establish the product", "Show the shape and the starting position of the zipper."], ["02 · OPENING", "Make the action legible", "Keep the zipper path and hardware coherent through the transition."], ["03 · OPEN", "Hold on the feature", "Give the viewer time to inspect the real interior and compartments."]],
    diagram: "Proposed capture and storyboard plan · illustrative, not an output sample",
    scope: "Before requesting a batch", checklist: ["Share the product category and available closed, open and detail views.", "Name the exact action and features to demonstrate; specify whether hands are allowed.", "List the details that must remain unchanged and who will approve them.", "Specify duration, aspect ratios, number of variants and deadline.", "Approve one sample’s motion and fidelity before expanding the scope."],
    cta: "Discuss a product-video sample", ctaText: "Have product photos and a feature to show? Send the available views, desired action and number of videos. We’ll review whether the inputs support a sample and what additional material may be needed.", button: "Discuss my video batch", note: "Product type, sample-image link, action, duration, ratios, quantity and deadline", service: "Explore production and collaboration", subject: "Product feature video — sample and batch enquiry",
  },
  zh: {
    title: "商品照片如何变成功能短片：ZEELUM 背包试片",
    description: "观看 ZEELUM 背包 10 秒试片：从原始商品照片、统一布光、生成运动到剪辑，解释不露手的开包动作如何制作，以及需要检查的局限。",
    eyebrow: "项目手记 / 02 · 商品功能视频", intro: "一家商品摄影工作室想要一段只出现产品的包袋短片：不露手，拉开拉链，让观众看清内部功能。这次样片讨论让一个区别变得很具体——让商品动起来，和把功能讲明白，是两件事。",
    status: "这里展示 ZEELUM 试片最终生成的 V10，基于提供的商品照片制作。它是 AI 辅助样片，不代表客户已验收的广告或销售效果。网页版本为无声版。",
    headings: ["先用原图交代产品结构", "先统一静帧，再加入运动", "分别生成镜头运动与开包动作", "剪成 10 秒纯产品展示", "既验收外观，也验收动作逻辑", "试片验证了什么，还有哪些局限"],
    paragraphs: [
      "提供的黑色背包照片分别展示外观、标志与内部。制作记录中，BACKPACK_BLACK_05、_14、_07 用于棚拍风格处理；BACKPACK_BLACK_11 提供真实打开的下部隔层。打开状态的原图尤其关键：翻盖、内衬与拉链有了可参考的结构，避免要求模型凭空补出看不见的内部。",
      "我们先用图像编辑把照片统一到深灰棚拍环境，使用中性柔光与轮廓光，让黑色织物和内部细节更清楚。编辑要求保留包体轮廓、缝线、拉链轨迹与 LEGENDS 字样。这些是基于原图生成的重新布光静帧，并非重新实拍；纹理和文字仍需与原图核对。",
      "外观与内部镜头使用 MiniMax-H3，让准备好的静帧产生环绕和缓慢推进的镜头运动。下部隔层采用另一种制作方法：从已知的打开状态出发，生成约六秒的闭合动作，再在剪辑中倒放为打开。这样以真实可见的内部作为约束，但它仍是 AI 动作可视化，不能当作真实机构运动的实拍证明。",
      "V10 复用前面版本的外观、标志和内部素材，搭配纯产品开包片段，最终剪辑没有重新生成。时间线为：0–1.5 秒外观，1.5–2.25 秒标志，2.25–7 秒打开下部隔层，7–8.5 秒主仓内部，8.5–10 秒回到外观。成片为 1080 × 1080、24 fps、10 秒，不露手、无旁白；网页展示移除了试片参考配乐。",
      "验收时把轮廓、提手、缝线、标志与拉链轨迹对照原图，检查过渡中是否出现五金变化、隔层增减或织物变形；再正常播放，看开包动作是否清楚。制作记录保留了抽帧检查，但抽帧不能证明每一帧都准确还原真实机构。试片反馈仍指出节奏偏快、衔接不够顺畅，这也是下一轮要继续验证的部分。",
      "这次试片验证了从已有照片组织一段功能展示的制作路径，也展示了跨版本复用有效镜头的方法。它不代表已经获得客户最终验收、付费投放或复购。下一轮应补齐同机位的闭合、半开、全开视图，约定动作与停留时间，先审核一条，再扩展为整批。"
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
    <header><p className="text-xs font-semibold tracking-widest text-teal-700">{c.eyebrow}</p><h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">{c.title}</h1><p className="mt-6 text-lg leading-8 text-slate-600">{c.intro}</p><p className="mt-5 text-sm text-slate-500">Curify · 2026-11-07</p><p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm leading-7">{c.status}</p></header>
    <figure className="mt-10"><video controls playsInline preload="metadata" poster="https://cdn.curify-ai.com/case-studies/zeelum-20261107/zeelum-poster.jpg" aria-label={lang === "zh" ? "ZEELUM 背包最终 V10 无声试片" : "ZEELUM backpack final V10 silent demo"} className="mx-auto aspect-square w-full max-w-2xl rounded-2xl bg-black"><source src="https://cdn.curify-ai.com/case-studies/zeelum-20261107/zeelum-v10-silent.mp4" type="video/mp4"/><a href="https://cdn.curify-ai.com/case-studies/zeelum-20261107/zeelum-v10-silent.mp4">{lang === "zh" ? "打开视频" : "Open video"}</a></video><figcaption className="mt-3 text-sm leading-7 text-slate-600">{lang === "zh" ? "最终生成的 V10 · 10 秒 · AI 辅助功能演示 · 无声。外观 → 标志 → 下部隔层打开 → 主仓内部 → 外观。" : "Final generated V10 · 10 seconds · AI-assisted feature demonstration · silent. Hero → label → lower compartment opening → main interior → hero."}</figcaption></figure>
    {c.headings.map((h,i) => <section key={h} className="mt-10"><h2 className="text-2xl font-semibold">{h}</h2><p className="mt-4 leading-8">{c.paragraphs[i]}</p>{i===3 && <figure className="my-6"><div className="grid gap-4 md:grid-cols-3">{c.states.map(([n,t,d])=><div key={n} className="rounded-xl border border-teal-200 bg-teal-50 p-5"><p className="text-xs font-semibold tracking-wider text-teal-700">{n}</p><h3 className="my-3 text-lg font-semibold">{t}</h3><p className="text-sm leading-7">{d}</p></div>)}</div><figcaption className="mt-3 text-xs text-slate-500">{c.diagram}</figcaption></figure>}</section>)}
    <section className="mt-10"><h2 className="text-2xl font-semibold">{c.scope}</h2><ul className="mt-4 list-disc space-y-3 pl-6 leading-7">{c.checklist.map(x=><li key={x}>{x}</li>)}</ul></section>
    <section className="mt-12 rounded-2xl border border-teal-200 bg-teal-50 p-6 md:p-9"><h2 className="text-2xl font-semibold">{c.cta}</h2><p className="my-5 leading-7">{c.ctaText}</p><InlineContactCapture source={`case-study:${slug}`} trackingId={`case-study:${slug}:enquiry`} subject={c.subject} cta={c.button} note={c.note}/><a href={getCanonicalPath(lang,"/business")} className="mt-6 inline-block text-sm text-teal-800 underline">{c.service} →</a></section>
  </article>;
}
