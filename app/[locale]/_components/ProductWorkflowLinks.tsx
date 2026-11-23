import { Link } from '@/i18n/navigation';

export default function ProductWorkflowLinks({ slug, locale }: { slug: string; locale: string }) {
  if (!['ai-product-photo-generator', 'ecommerce-photo', 'product-video'].includes(slug) || !['en', 'zh'].includes(locale)) return null;
  const zh = locale === 'zh';
  const video = slug === 'product-video';
  return <section id="product-workflow-options" className="mx-auto my-10 scroll-mt-28 max-w-4xl rounded-2xl border border-purple-200 bg-purple-50 p-6 text-left" aria-labelledby="product-next-step-title">
    <h2 id="product-next-step-title" className="text-2xl font-semibold">{zh ? '单次生成，还是定制制作？' : 'One generation or a custom production project?'}</h2>
    <p className="mt-3 text-sm leading-7 text-neutral-700">{zh ? (video ? '本页用商品照片和文字信息制作短视频。需要演示产品如何打开、使用或变形，或制作多镜头品牌广告？这些需要单独确定分镜、素材和审核范围。' : '本页从商品照片开始，默认生成一张场景海报。九宫格、包装样机和视频各有独立工作流；一批商品的精修与一致性审核可单独咨询。') : (video ? 'This page makes a short video from product photos and copy. Showing a product opening, being used or transforming—or producing a multi-shot brand ad—needs a separate brief, storyboard and review scope.' : 'Start here with a product photo and generate a scene poster. Nine-scene grids, packaging mockups and videos use separate workflows. Discuss retouching and consistency review for a product batch as a separate service.')}</p>
    <nav className="mt-5 grid gap-4 sm:grid-cols-2" aria-label={zh ? '相关工具与制作证据' : 'Related workflows and production evidence'}>
      <Link locale={locale} className="rounded-xl bg-white p-4 font-medium text-purple-800 underline" href={video ? '/tools/ecommerce-photo#reproduce' : '/tools/product-video#reproduce'}>{zh ? (video ? '先制作商品场景图片' : '用商品照片制作短视频') : (video ? 'Create a product scene image first' : 'Turn product photos into a short video')} →</Link>
      <Link locale={locale} className="rounded-xl bg-white p-4 font-medium text-purple-800 underline" href={video ? '/blog/product-photos-to-feature-video' : '/blog/batch-product-image-quality-control'}>{zh ? (video ? 'ZEELUM：查看定制功能演示的制作过程' : '96张商品图：查看批次检查与局部返工') : (video ? 'ZEELUM: how a custom feature demo was made' : '96 product images: batch checks and selective revision')} →</Link>
      <Link locale={locale} className="text-sm font-medium text-purple-800 underline" href="/tools/product-photo-retouching-service">{zh ? '商品照片修图服务' : 'Product photo retouching service'} →</Link>
      <Link locale="en" className="text-sm font-medium text-purple-800 underline" href="/resources/ai-photo-retouching-quality-checklist">{zh ? '下载修图 QA 清单（英文）' : 'Download the retouching QA checklist'} →</Link>
    </nav>
    <Link locale={locale} href={{ pathname: '/contact', query: { subject: video ? (zh ? '定制商品视频制作' : 'Custom product video production') : (zh ? '批量商品照片制作与修图' : 'Batch product image production and retouching'), source: `tool:${slug}:custom-production` } }} className="mt-5 inline-flex rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold !text-white">{zh ? '提供样片、数量和截止时间，咨询项目' : 'Discuss your samples, quantity and deadline'} →</Link>
  </section>;
}
