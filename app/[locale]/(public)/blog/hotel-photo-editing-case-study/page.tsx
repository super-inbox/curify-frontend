import type { Metadata } from "next";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import InlineContactCapture from "@/app/[locale]/_components/InlineContactCapture";
import { getCanonicalUrl, getLanguagesMap, getCanonicalPath } from "@/lib/canonical";

const slug = "hotel-photo-editing-case-study";
const image = "https://cdn.curify-ai.com/images/real_estate/hotel-room-before-after.jpg";
const copy = {
  en: {
    title: "Hotel photo editing: a brighter room is only the first step",
    description: "A real hotel-room editing trial: balancing window light, refining bedding and checking what a cleaner image changes. Before-and-after, process and limits.",
    eyebrow: "FIELD NOTES / 01 · HOTEL PHOTOGRAPHY", intro: "A room can look brighter and still miss the brief. In this hotel-photo trial, the harder questions were about bedding, the view outside and which details an edit should preserve.",
    labels: ["Real source photo", "Editing trial · v4", "Published with permission"],
    caption: "Original on the left; version 4 of our editing trial on the right. The existing TV contains an added landscape image. This is a trial comparison, not a record of final client acceptance.",
    brief: "The brief", briefText: "Prepare a clearer, tidier presentation of an actual guest room for a hotel listing. The working brief combined a bright interior, neutral linen and controlled window highlights with preservation of the room’s layout and furnishings. Seven exposures were supplied from one camera angle: one scene, not seven independent examples.",
    changes: [
      ["01", "Balance the room and the window", "The first edit brightened the room, but the window remained too bright in several areas. A later pass used a darker exposure as a reference. The aim was to make the interior readable without treating the view outside as a blank space to replace."],
      ["02", "Treat bedding as its own task", "Version 4 refined the duvet and pillowcase surfaces using a bedding reference. A smooth surface alone does not make a bed look well made: hems, seams, folds and overall shape need a separate inspection. Subsequent revisions continued exploring these details."],
      ["03", "Call out deliberate additions", "A landscape was inserted into the existing TV and fitted to its perspective. That is a styling choice, not recovered source detail. A batch brief should say whether screens stay unchanged, remain dark or receive agreed content."],
    ],
    lesson: "What this trial taught us", lessonText: "Brightness is a useful first check, but it is not the acceptance criterion. Review the bed silhouette, fabric texture, wall details, furniture edges and window view independently. A pleasing overall image can still change a detail that matters to the property owner.",
    limits: "What this example does—and does not—show", limitText: "This trial used the JPEG embedded in a camera RAW file as its input, followed by image-generation editing. It was not RAW sensor development or a radiometric HDR merge. The generated frame was 1,537 × 1,023 pixels. Exact wall artwork, fixture details and exterior geometry were not certified pixel-identical. The displayed version has no recorded final client sign-off; it does not demonstrate a completed batch or a booking uplift.",
    checklist: "Before editing a whole room set", checks: ["Agree on one representative sample before extending the look to the batch.", "List details that must remain: room layout, amenities, wall graphics and the actual view.", "Define the bedding finish with a reference—and inspect both texture and bed shape.", "Specify screen content, export dimensions, crop ratios and the review process.", "Check each angle separately; one successful scene does not validate every room."],
    ctaTitle: "Have a batch of hotel photos to edit?", ctaText: "Send a representative sample, the photo count, deadline and intended listing format. We’ll review the scope and agree on a sample approach before discussing the full batch.", cta: "Discuss my photo batch", note: "Photo count, deadline, source format, required edits and a link to sample images", service: "See the real-estate and hotel photo editing service", subject: "Hotel photo editing — batch enquiry",
  },
  zh: {
    title: "酒店客房修图：提亮，只是第一步",
    description: "复盘一次真实酒店客房试片：如何平衡窗内外亮度、处理床品、明确电视画面的添加，以及批量修图前应该验收什么。",
    eyebrow: "项目手记 / 01 · 酒店摄影", intro: "一张客房照片变亮了，不代表已经达到要求。这次试片里，更难的问题是：床品是否整齐、窗外景观是否可信，以及哪些细节必须保留。",
    labels: ["真实源照片", "修图试片 · v4", "已获展示授权"],
    caption: "左侧为原图，右侧为第 4 版试片。原有电视屏幕中添加了风景画面。这是一组过程对照，不代表客户最终验收版本。",
    brief: "这次要解决什么", briefText: "让一间真实客房以更明亮、整洁的状态呈现在酒店房源页面。试片的工作要求包括提亮室内、让床品颜色更中性、控制窗边高光，同时保留原有空间和家具。输入是同一机位的七张不同曝光照片：它们是一个场景，不是七个独立案例。",
    changes: [
      ["01", "同时看室内和窗外", "第一版提亮了室内，但部分窗户区域仍然过亮。后续版本参考较暗的曝光来调整窗边表现。目标是让室内清楚可见，而不是把窗外当作可以随意替换的空白区域。"],
      ["02", "把床品单独拿出来验收", "第 4 版参照床品效果图，进一步处理被面和枕套。表面平整并不等于铺床整齐：床尾轮廓、包边、接缝和褶皱走向都需要单独检查。后续试片仍继续探索这些细节。"],
      ["03", "明确哪些内容是后加的", "我们在原有电视屏幕内加入风景，并按照屏幕透视放置。这属于画面布置，不是恢复原片信息。做批量任务前，应约定屏幕保持原样、保持黑屏，还是使用指定内容。"],
    ],
    lesson: "这次试片留下的经验", lessonText: "亮度适合做第一眼检查，却不能代替验收。床的轮廓、织物质感、墙面细节、家具边缘和窗外景观应该分别检查。整体好看的图片，仍可能改变业主在意的真实细节。",
    limits: "这张样例能说明什么", limitText: "本次从相机 RAW 文件中提取内嵌 JPEG，再进行图像生成式编辑；不是 RAW 传感器数据显影，也不是多曝光辐射合成 HDR。生成单帧为 1,537 × 1,023 像素。墙面图案、设备细节和窗外几何没有被认证为逐像素一致。展示版本没有最终客户验收记录，也不能据此推断整批交付完成或预订转化提升。",
    checklist: "整批开始之前，先确认这五件事", checks: ["先选有代表性的一张完成试片，再决定是否延伸到整批。", "列明必须保留的内容：空间布局、设施、墙面图案和真实窗景。", "用参考图约定床品效果，同时检查纹理和铺床形状。", "约定电视内容、导出尺寸、裁切比例以及反馈方式。", "每个机位分别检查；一个场景通过不代表所有房型都通过。"],
    ctaTitle: "有一批酒店照片需要处理？", ctaText: "提供代表性样图、照片数量、交期和房源平台的图片要求。我们会先看素材、确认范围，再讨论试片和整批方案。", cta: "咨询批量照片处理", note: "照片数量、交期、源文件格式、处理要求及样图链接", service: "查看房产与酒店照片处理服务", subject: "酒店照片处理 — 批量询盘",
  },
};
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const lang = locale === "zh" ? "zh" : "en"; const c = copy[lang];
  return { title: c.title, description: c.description, alternates: { canonical: getCanonicalUrl(lang, `/blog/${slug}`), languages: getLanguagesMap(`/blog/${slug}`, ["en", "zh"]) }, robots: { index: ["en", "zh"].includes(locale), follow: true }, openGraph: { title: c.title, description: c.description, type: "article", url: getCanonicalUrl(lang, `/blog/${slug}`), images: [image] } };
}
export default async function HotelCase({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; const lang = locale === "zh" ? "zh" : "en"; const c = copy[lang];
  return <article lang={lang} className="mx-auto max-w-5xl py-10 text-slate-800 md:py-16">
    <header className="max-w-3xl"><p className="text-xs font-semibold tracking-[0.18em] text-teal-700">{c.eyebrow}</p><h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">{c.title}</h1><p className="mt-6 text-lg leading-8 text-slate-600">{c.intro}</p><p className="mt-5 text-sm text-slate-500">Curify · 2026-11-02</p></header>
    <div className="mt-8 flex flex-wrap gap-2">{c.labels.map(x => <span key={x} className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs text-teal-900">{x}</span>)}</div>
    <figure className="mt-5"><CdnImage src={image} alt={lang === "zh" ? "同一酒店客房的原图与第4版试片对照" : "Original hotel room and version 4 editing trial side by side"} width={1600} height={600} priority className="h-auto w-full rounded-2xl border border-slate-200" /><figcaption className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">{c.caption}</figcaption></figure>
    <section className="my-12 max-w-3xl"><h2 className="text-2xl font-semibold">{c.brief}</h2><p className="mt-4 leading-8">{c.briefText}</p></section>
    <div className="grid gap-5 md:grid-cols-3">{c.changes.map(([n,h,p]) => <section key={n} className="rounded-2xl bg-slate-50 p-6"><p className="text-sm font-medium text-teal-700">{n}</p><h2 className="mt-3 text-xl font-semibold">{h}</h2><p className="mt-4 text-sm leading-7 text-slate-600">{p}</p></section>)}</div>
    <div className="my-12 max-w-3xl space-y-10"><section><h2 className="text-2xl font-semibold">{c.lesson}</h2><p className="mt-4 leading-8">{c.lessonText}</p></section><section className="border-l-2 border-teal-500 pl-6"><h2 className="text-xl font-semibold">{c.limits}</h2><p className="mt-4 leading-8 text-slate-600">{c.limitText}</p></section><section><h2 className="text-2xl font-semibold">{c.checklist}</h2><ol className="mt-5 list-decimal space-y-3 pl-6 leading-7">{c.checks.map(x => <li key={x}>{x}</li>)}</ol></section></div>
    <section className="rounded-2xl border border-teal-200 bg-teal-50 p-6 md:p-10"><h2 className="text-2xl font-semibold">{c.ctaTitle}</h2><p className="mt-4 max-w-2xl leading-7">{c.ctaText}</p><div className="mt-6"><InlineContactCapture source={`case-study:${slug}`} trackingId={`case-study:${slug}:enquiry`} subject={c.subject} cta={c.cta} note={c.note} /></div><a className="mt-6 inline-block text-sm font-medium text-teal-800 underline" href={getCanonicalPath(lang, "/tools/real-estate-photo-editing")}>{c.service} →</a></section>
  </article>;
}
