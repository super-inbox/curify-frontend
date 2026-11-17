export default function BatchProductCaseLink({ locale = "en" }: { locale?: string }) {
  const zh = locale === "zh";
  return <aside className="my-10 rounded-2xl border border-teal-200 bg-teal-50 p-6">
    <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">{zh ? "真实制作过程" : "Production case study"}</p>
    <h2 className="mt-3 text-2xl font-semibold">{zh ? "96张商品图，如何只返工12张？" : "96 product images. Why revise only 12?"}</h2>
    <p className="my-4 text-sm leading-7 text-slate-600">{zh ? "从产品结构质检到尺寸图背景修改：看我们如何保留84张场景图，限定返工范围，并区分文件检查与客户验收。" : "Product-fidelity checks, protected dimension artwork and a revision that left 84 scene files unchanged. See what file checks establish—and what still needs customer sign-off."}</p>
    <a href={`${zh ? "/zh" : ""}/blog/batch-product-image-quality-control`} className="font-semibold text-teal-800 underline">{zh ? "阅读批量质检案例" : "Read the batch quality-control case"} →</a>
  </aside>;
}
