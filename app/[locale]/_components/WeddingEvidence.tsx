import CdnImage from './CdnImage';
import { Link } from '@/i18n/navigation';

const base = '/service-examples/wedding';

/** Authorized client retouching; custom production examples are not tool benchmarks. */
export function WeddingRetouchEvidence({ locale, source }: { locale: string; source: string }) {
  if (locale !== 'en' && locale !== 'zh') return null;
  const zh = locale === 'zh';
  return <section id="wedding-retouch-example" className="mx-auto my-12 scroll-mt-28 max-w-4xl space-y-5 text-left" aria-labelledby="wedding-retouch-title">
    <p className="text-xs font-semibold uppercase tracking-wider text-purple-700">{zh ? '已授权客户照片 · 定制修图过程' : 'Client photo shared with permission · Custom editing process'}</p>
    <h2 id="wedding-retouch-title" className="text-2xl font-semibold">{zh ? '婚礼修图：保留原片，逐项改善' : 'Wedding photo retouching: refine the original photograph'}</h2>
    <p className="leading-7 text-neutral-600">{zh ? '这次处理围绕肤色、背景污痕和局部发丝展开。先比较自然、珍珠柔亮和微暖三个方向，再在自然版上做局部修订。这是一张照片的定制处理记录，不代表整场婚礼的批量交付，也不是当前工具的一键效果。' : 'This edit addressed skin tone, background marks and selected stray hairs. We compared natural, pearl and warm finishes, then refined the natural version locally. It documents a custom edit of one photograph, not a completed wedding-gallery batch or a one-click result from the tool.'}</p>
    <div className="grid gap-4 sm:grid-cols-2">
      {['original', 'retouched'].map((name, i) => <figure key={name}>
        <CdnImage src={`${base}/${name}.webp`} alt={zh ? (i ? '定制修图后的婚礼双人照片' : '未经此次修图的婚礼原片') : (i ? 'Wedding photograph after custom retouching' : 'Original wedding photograph before retouching')} width={1200} height={1800} className="h-auto w-full rounded-xl" />
        <figcaption className="mt-2 text-sm font-medium">{zh ? (i ? '修图后' : '原片') : (i ? 'After custom editing' : 'Original photograph')}</figcaption>
      </figure>)}
    </div>
    <details className="rounded-xl border border-neutral-200 p-4">
      <summary className="cursor-pointer font-medium">{zh ? '放大查看肤色与发丝细节' : 'Inspect skin and hair detail'}</summary>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{['original', 'retouched'].map((name, i) => <figure key={name}>
        <CdnImage src={`${base}/${name}-detail.webp`} alt={zh ? (i ? '修图后同一区域细节' : '原片人物细节') : (i ? 'The same portrait detail after editing' : 'Portrait detail from the original')} width={1000} height={750} className="h-auto w-full rounded-lg" />
        <figcaption className="mt-2 text-sm">{zh ? (i ? '修图后细节' : '原片细节') : (i ? 'Edited detail' : 'Original detail')}</figcaption>
      </figure>)}</div>
    </details>
    <div className="grid gap-5 sm:grid-cols-2">
      <div><h3 className="font-semibold">{zh ? '修改与保留范围' : 'What changed, what stayed'}</h3><p className="mt-2 text-sm leading-6 text-neutral-600">{zh ? '调整肤色与局部明暗，清理指定背景污痕和发丝。保留构图、姿势、眼镜、表情及婚纱；这次没有瘦脸或身体重塑。原始输出为2560×3840，网页展示图已缩小。' : 'Skin colour and local tones were adjusted; selected background marks and hair strands were cleaned. The composition, pose, glasses, expression and dress were retained, with no face or body reshaping in this job. The original output is 2560×3840; these web previews are resized.'}</p></div>
      <div><h3 className="font-semibold">{zh ? '为什么需要返修检查' : 'Why revision checks matter'}</h3><p className="mt-2 text-sm leading-6 text-neutral-600">{zh ? '曾拒绝会改变眼嘴的生成提案，也修正过发丝断续和眉部缺口。最终只采用限定区域修补，部分细碎飞发保留。数值检查之外，仍需放大检查眼镜、眉眼和衣服边缘。' : 'A generated proposal that changed the eyes and mouth was rejected. Later revisions corrected a broken hair strand and a small brow gap. The final pass used bounded repairs and retained some fine flyaways. Numerical checks still need visual review of glasses, brows and garment edges.'}</p></div>
    </div>
    <p className="text-sm leading-6">{zh ? '要外包一组婚礼照片？请提供样片数量、期望风格、总张数和截止时间，先确认试片与保留范围。' : 'Outsourcing a wedding set? Share sample-photo details, your reference look, the total photo count and deadline so we can agree a sample edit and preservation scope first.'}</p>
    <Link locale={locale} href={{ pathname: '/contact', query: { subject: zh ? '婚礼照片批量修图咨询' : 'Batch wedding photo editing', source: `wedding-evidence:${source}:original-to-retouched` } }} className="inline-flex rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold !text-white !no-underline">{zh ? '咨询婚礼批量修图' : 'Discuss batch wedding editing'} →</Link>
  </section>;
}

export function WeddingGenerationEvidence({ locale, source }: { locale: string; source: string }) {
  if (locale !== 'en' && locale !== 'zh') return null;
  const zh = locale === 'zh';
  return <section id="wedding-style-examples" className="mx-auto my-12 scroll-mt-28 max-w-4xl space-y-5 text-left" aria-labelledby="wedding-styles-title">
    <p className="text-xs font-semibold uppercase tracking-wider text-purple-700">{zh ? '定制生成样例 · 非自助工具测试' : 'Custom-generated examples · Separate from the self-service tool test'}</p>
    <h2 id="wedding-styles-title" className="text-2xl font-semibold">{zh ? '同一对人物，探索唐风、宋风与现代婚纱' : 'Explore Tang-inspired, Song-inspired and modern wedding portraits'}</h2>
    <p className="text-neutral-600 leading-7">{zh ? '这三张来自一个定制项目的十张系列：唐风四张、宋风四张、现代婚纱两张。制作中使用同一份人物参考，多轮检查脸型、手部和饰品。这些是人工参与选图与返修的生成样例，不代表工具一次生成整套，也不代表客户已确认所有成片。' : 'These three images come from a ten-image custom project: four Tang-inspired, four Song-inspired and two modern wedding portraits. Production used the same identity reference and repeated checks of faces, hands and accessories. The examples involved manual selection and revisions; they do not represent a one-click collection or client approval of every result.'}</p>
    <div className="grid gap-4 sm:grid-cols-3">{['tang', 'song', 'studio'].map((name, i) => <figure key={name}>
      <CdnImage src={`${base}/${name}.webp`} width={1122} height={1402} alt={zh ? ['唐风金绿礼服双人生成肖像','宋风浅青礼服双人生成肖像','现代窗光婚纱双人生成肖像'][i] : ['Generated couple portrait in Tang-inspired gold and green clothing','Generated couple portrait in Song-inspired pale blue clothing','Generated modern wedding portrait in window light'][i]} className="h-auto w-full rounded-xl" />
      <figcaption className="mt-2 text-sm">{zh ? ['唐风：服装、手部与人物比例需逐项检查','宋风：比较同一人物在新服装中的面部细节','现代婚纱：重新核对脸型、手部与婚纱边缘'][i] : ['Tang-inspired: inspect clothing, hands and body proportions.','Song-inspired: compare facial details after the costume change.','Modern wedding: recheck faces, hands and dress edges.'][i]}</figcaption>
    </figure>)}</div>
    <p className="text-sm leading-6 text-neutral-600">{zh ? '朝代风格是视觉灵感，不是历史服饰考据。该项目曾修复多余手部，并以人物参考校正脸型；精美场景不等于人物相似度通过。自助工具的真实测试另行标注，生成后仍需自己核对。' : 'The era labels describe visual inspiration, not verified historical costume. This project included an extra-hand repair and facial-shape corrections against the identity reference. An attractive scene is not evidence of accurate likeness. The self-service tool test is labelled separately; review every new result.'}</p>
    <nav className="flex flex-wrap gap-4 text-sm font-medium text-purple-700" aria-label={zh ? '婚纱生成下一步' : 'Wedding portrait next steps'}>
      <Link locale={locale} href="/tools/ai-wedding-photo-generator#reproduce" className="underline">{zh ? '用自己的照片试做一张' : 'Try one portrait with your own photo'} →</Link>
      <Link locale={locale} href={{ pathname: '/contact', query: { subject: zh ? '定制婚纱风格系列' : 'Custom wedding portrait collection', source: `wedding-evidence:${source}:era-collection` } }} className="underline">{zh ? '咨询多套风格与定制修改' : 'Discuss a custom collection'} →</Link>
    </nav>
  </section>;
}
