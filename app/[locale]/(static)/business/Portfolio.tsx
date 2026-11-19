'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { categories, works, type Work } from './portfolio-data';
import type { BusinessLang } from './copy';
import { useTracking } from '@/services/useTracking';

export default function Portfolio({ lang }: { lang: BusinessLang }) {
  const [category, setCategory] = useState('all');
  const { trackAction } = useTracking();
  const zh = lang === 'zh';
  const labels: Record<string,string> = zh ? { process:'真实制作过程', demo:'原创 Demo', trial:'项目试片', reference:'提供的修图示例' } : { process:'Production process', demo:'Original demo', trial:'Project trial', reference:'Supplied editing example' };
  const local = (path: string) => `${zh ? '/zh' : ''}${path}`;
  const inquiry = (work: Work) => ({ pathname: '/contact', query: {
    subject: `${zh ? '想做类似项目' : 'A project like'}: ${work.title[lang]}`,
    source: `business:${lang}:work_id=${work.id}:category=${work.categories[0]}`,
    work_id: work.id, category: work.categories[0],
  }});
  return <>
    <section id="examples" aria-labelledby="examples-title" className="mt-12 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.2em] text-purple-700">CURIFY / SELECTED WORK</p><h2 id="examples-title" className="mt-3 text-3xl font-semibold sm:text-4xl">{zh ? '先看作品，再聊你的项目' : 'Find the work you want to make'}</h2></div><a href="#case-notes" className="text-sm font-semibold text-purple-700 underline underline-offset-4">{zh ? '看看作品怎么做出来' : 'Explore the production process'} ↓</a></div>
      <p className="mt-4 max-w-3xl leading-7 text-neutral-600">{zh ? '从商品广告、摄影修图到品牌视觉与知识内容。每件作品说明制作状态；试片与原创演示不代表已验收的客户交付。' : 'Product ads, photo editing, brand visuals and learning content. Each work identifies its production status; trials and original demos are not claims of approved client delivery.'}</p>
      <div role="group" aria-label={zh ? '按交付成果筛选作品' : 'Filter works by outcome'} className="mt-7 flex flex-wrap gap-2">
        {[{id:'all',zh:'全部作品',en:'All work'},...categories].map(c => <button key={c.id} type="button" aria-pressed={category===c.id} onClick={() => {setCategory(c.id); trackAction({contentId:`business:${lang}:filter:${c.id}`,contentType:'menu_link'},'click');}} className={`rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-600 ${category===c.id ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-white text-neutral-700 hover:border-purple-400'}`}>{c[lang]}</button>)}
      </div>
      <p aria-live="polite" className="mt-4 text-xs text-neutral-500">{works.filter(w=>category==='all'||w.categories.includes(category)).length} {zh ? '件精选作品' : 'selected works'}</p>
      <div className="mt-5 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {works.map(work => <article key={work.id} id={`work-${work.id}`} hidden={category!=='all'&&!work.categories.includes(category)} className="scroll-mt-24 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex min-h-48 items-center justify-center bg-neutral-100">
            {work.video ? <video controls playsInline preload="none" onEnded={(event) => event.currentTarget.load()} poster={work.image} data-business-video={work.id} aria-label={work.title[lang]} className="max-h-[26rem] w-full bg-neutral-950 object-contain"><source src={work.video} type="video/mp4"/><a href={work.video}>{work.title[lang]}</a></video> : <img src={work.id==='shoe-series'&&zh ? '/service-examples/womens-shoe-restoration-zh.jpg' : work.image} alt={work.title[lang]} width={800} height={600} loading="lazy" className="aspect-[4/3] w-full object-contain"/>}
          </div>
          <div className="p-5"><p className="text-xs font-semibold text-purple-700">{labels[work.kind]}</p><h3 className="mt-2 text-xl font-semibold leading-snug">{work.title[lang]}</h3><p className="mt-3 text-sm leading-6 text-neutral-600">{work.description[lang]}</p>
            <details className="mt-4 border-t border-neutral-100 pt-3"><summary className="cursor-pointer text-sm font-semibold">{zh ? '了解这件作品' : 'Explore this work'}</summary>
              {!work.video && <a href={work.id==='shoe-series'&&zh ? '/service-examples/womens-shoe-restoration-zh.jpg' : work.image} target="_blank" rel="noreferrer" className="mt-3 block text-sm text-purple-700 underline">{zh ? '查看完整图片 ↗' : 'View the full image ↗'}</a>}
              {work.images && <div className="mt-4 grid grid-cols-3 gap-2">{work.images.map((image,i)=><a key={image} href={image} target="_blank" rel="noreferrer" aria-label={`${work.title[lang]} ${i+1}`}><img src={image} alt={`${work.title[lang]} ${i+1}`} width={300} height={400} loading="lazy" className="h-auto w-full rounded"/></a>)}</div>}
              <p className="mt-3 text-sm leading-6 text-neutral-600">{zh ? '带上你的素材、用途、数量和截止时间，我们一起确定样片与交付范围。' : 'Share your source assets, intended use, quantity and deadline so we can agree a sample and delivery scope.'}</p>
              {work.steps && <a href={`#case-${work.id}`} className="mt-3 block text-sm text-purple-700 underline">{zh ? '需求、制作过程与结果' : 'Brief, process and result'} →</a>}
              {work.href && <a data-business-event={`work:${work.id}:related`} href={local(work.href)} className="mt-3 block text-sm text-purple-700 underline">{work.href.startsWith('/blog') ? (zh?'阅读完整案例':'Read the full case') : work.href.startsWith('/nano-template') ? (zh?'查看完整系列':'Explore the series') : (zh?'查看相关服务':'Explore the service')} →</a>}
              {work.tool && <a data-business-event={`work:${work.id}:tool`} href={local(work.tool)} className="mt-3 block text-sm text-purple-700 underline">{zh?'用包装工具自己试做':'Try the packaging tool yourself'} →</a>}
            </details>
            <Link locale={lang} href={inquiry(work)} data-business-event={`work:${work.id}:enquiry`} className="mt-5 inline-block text-sm font-semibold text-purple-800 underline underline-offset-4">{zh ? '我也想做类似项目' : 'Make something like this'} →</Link>
          </div>
        </article>)}
      </div>
    </section>
    <section id="case-notes" className="mt-20 scroll-mt-24" aria-labelledby="case-notes-title"><h2 id="case-notes-title" className="text-3xl font-semibold">{zh?'从输入到结果，看看制作过程':'A closer look at the production process'}</h2><p className="mt-3 text-neutral-600">{zh?'批量商品图、项目试片与原创教育系列：各有不同的验收重点，制作完成与客户签收分别说明。':'Batch product images, project trials and an original educational series, with production results distinguished from customer sign-off.'}</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">{works.filter(w=>w.steps).map(work=><article id={`case-${work.id}`} key={work.id} className="scroll-mt-24 rounded-2xl bg-purple-50 p-6"><p className="text-xs font-semibold text-purple-700">{labels[work.kind]}</p><h3 className="mt-2 text-xl font-semibold">{work.title[lang]}</h3><dl className="mt-5 space-y-4">{work.steps![lang].map((text,i)=><div key={i}><dt className="text-xs font-bold tracking-wide text-purple-800">{(zh?['需求','输入素材','制作过程','当前结果']:['BRIEF','INPUT','PROCESS','RESULT'])[i]}</dt><dd className="mt-1 text-sm leading-6 text-neutral-700">{text}</dd></div>)}</dl><a href={local(work.href!)} className="mt-5 inline-block text-sm font-semibold text-purple-800 underline">{zh?'查看案例与素材':'Explore the case and materials'} →</a><Link locale={lang} href={inquiry(work)} data-business-event={`case:${work.id}:enquiry`} className="mt-4 block text-sm font-semibold text-purple-800 underline">{zh?'聊聊类似项目':'Discuss a similar project'} →</Link></article>)}</div>
    </section>
  </>;
}
