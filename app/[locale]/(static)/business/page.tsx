import type { Metadata } from 'next';
import Image from 'next/image';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/constants';
import InlineContactCapture from '@/app/[locale]/_components/InlineContactCapture';
import BusinessTracking from './BusinessTracking';
import { businessCopy, businessLang } from './copy';
import { businessCases, portfolioCopy } from './cases';
import { taskHref } from '@/lib/creation-tasks';

export const revalidate = false;
export const generateStaticParams = () => routing.locales.map(locale => ({ locale }));
type Props = { params: Promise<{ locale: string }> };
const pageUrl = (lang: string) => `${SITE_URL}${lang === 'zh' ? '/zh' : ''}/business`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = businessLang((await params).locale);
  const c = businessCopy[lang];
  const url = pageUrl(lang);
  return {
    title: { absolute: c.seoTitle }, description: c.description,
    alternates: { canonical: url, languages: { en: pageUrl('en'), zh: pageUrl('zh'), 'x-default': pageUrl('en') } },
    openGraph: { title: c.title, description: c.description, url, type: 'website', siteName: 'Curify', locale: lang === 'zh' ? 'zh_CN' : 'en_US', images: [{ url: `${SITE_URL}/business/fabric-poster.jpg`, alt: c.samples[0][1] }] },
    twitter: { card: 'summary_large_image', title: c.title, description: c.description, images: [`${SITE_URL}/business/fabric-poster.jpg`] },
  };
}

export default async function BusinessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = businessLang(locale);
  const c = businessCopy[lang];
  // Keep the shared form in the same language as this bilingual page, including
  // validation, role choices and success/error states in fallback locales.
  const work = portfolioCopy[lang];
  const messages = await getMessages({ locale: lang });
  const schema = {
    '@context': 'https://schema.org', '@type': 'Service',
    name: c.title, description: c.description, url: pageUrl(lang),
    provider: { '@type': 'Organization', name: 'Curify', url: SITE_URL },
    hasOfferCatalog: { '@type': 'OfferCatalog', name: c.sectorsTitle, itemListElement: c.sectors.map(([id, name, description]) => ({
      '@type': 'Offer', itemOffered: { '@type': 'Service', name, description, url: `${pageUrl(lang)}#${id}` },
    })) },
  };
  const capture = (position: string, withNote = false) => (
    <NextIntlClientProvider locale={lang} messages={{ contact: messages.contact }}>
      <InlineContactCapture source={`business:${lang}:${position}`} subject={c.title} cta={c.cta}
        trackingId={`business:${lang}:${position}`} note={withNote ? c.note : undefined} className="mt-6 max-w-xl" />
    </NextIntlClientProvider>
  );
  return (
    <BusinessTracking lang={lang}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <section className="grid items-center gap-10 rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-amber-50 p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-xs font-bold tracking-widest text-purple-700">{c.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{c.title}</h1>
          <p className="mt-5 text-xl font-semibold text-neutral-800">{c.heading}</p>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">{c.intro}</p>
          <a href="#partnership" data-business-event="brief" className="mt-7 inline-flex rounded-full bg-purple-700 px-6 py-3 font-semibold text-white hover:bg-purple-800">{c.cta} →</a><br />
          <a data-business-event="examples" href="#examples" className="mt-5 inline-block text-sm font-semibold text-purple-700 underline underline-offset-4">{c.examplesCta} ↓</a>
        </div>
        <figure className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <Image src={businessCases[0].image} alt={businessCases[0].copy[lang].output} width={960} height={540} priority className="aspect-video w-full object-cover" />
          <figcaption className="p-5 text-sm leading-relaxed text-neutral-600">{businessCases[0].copy[lang].note}</figcaption>
        </figure>
      </section>

      <section id="examples" className="mt-16 scroll-mt-28" aria-labelledby="examples-title">
        <h2 id="examples-title" className="text-3xl font-bold tracking-tight sm:text-4xl">{work.title}</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-neutral-600">{work.intro}</p>
        <div className="mt-8 grid items-start gap-8 md:grid-cols-2">
          {businessCases.map(item => {
            const detail = item.copy[lang];
            return <article key={item.id} data-business-case={item.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              {item.video ? <video data-business-video={item.id} controls playsInline preload="none" poster={item.image} aria-label={detail.title} className="aspect-[4/3] w-full bg-neutral-950 object-contain">
                <source src={item.video} type="video/mp4" /><a href={item.video}>{detail.title}</a>
              </video> : <Image src={item.image} alt={detail.output} width={1200} height={900} className="aspect-[4/3] w-full bg-neutral-100 object-contain" />}
              <div className="p-6 sm:p-7">
                <p className="text-xs font-bold tracking-wide text-purple-700">{detail.badge}</p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight">{detail.title}</h3>
                <dl className="mt-5 space-y-3 text-sm leading-6">
                  <div><dt className="font-semibold">{work.input}</dt><dd className="text-neutral-600">{detail.input}</dd></div>
                  <div><dt className="font-semibold">{work.output}</dt><dd className="text-neutral-600">{detail.output}</dd></div>
                </dl>
                <p className="mt-4 text-xs leading-5 text-neutral-500">{detail.note}</p>
                {item.id === 'kyoto' && <Link locale={lang} href={taskHref('souvenir')} data-business-event="case:kyoto:self-serve" className="mt-4 block font-semibold text-purple-700">{lang === 'zh' ? '用我的照片制作 · 新功能预览 →' : 'Use my portrait · new tool preview →'}</Link>}
                {item.article && <Link locale={lang} href={item.article} data-business-event={`case:${item.id}:read`} className="mt-4 inline-block text-sm font-semibold text-purple-700 underline underline-offset-4">{work.article} →</Link>}
                <details className="group mt-6 border-t border-neutral-200 pt-5">
                  <summary data-business-event={`case:${item.id}:inquiry`} className="cursor-pointer rounded-xl bg-purple-50 px-4 py-3 font-semibold text-purple-800 hover:bg-purple-100">{work.similar}</summary>
                  <p className="mt-4 text-sm leading-6 text-neutral-600">{work.hint}</p>
                  <NextIntlClientProvider locale={lang} messages={{ contact: messages.contact }}>
                    <InlineContactCapture source={`business:${lang}:case:${item.id}`} caseId={item.id} subject={`${work.inquiry}: ${detail.title}`} cta={work.submit} note={work.brief} trackingId={`business:${lang}:case:${item.id}:submit`} className="mt-4" />
                  </NextIntlClientProvider>
                </details>
              </div>
            </article>;
          })}
        </div>
      </section>
      <aside className="mt-10 flex flex-col gap-4 rounded-2xl bg-neutral-100 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="font-bold">{work.selfServe}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">{work.selfServeIntro}</p></div>
        <Link href="/tools" locale={lang} data-business-event="self-serve" className="shrink-0 font-semibold text-purple-700">{work.tool} →</Link>
      </aside>

      <section className="mt-20" aria-labelledby="sectors-title">
        <h2 id="sectors-title" className="text-3xl font-bold tracking-tight">{c.sectorsTitle}</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-neutral-600">{c.sectorsIntro}</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {c.sectors.map(([id, title, description], index) => (
            <article key={id} id={id} className="flex scroll-mt-28 flex-col rounded-2xl border border-neutral-200 bg-white p-6">
              <span className="text-sm font-semibold text-purple-600">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-xl font-bold">{title}</h3>
              <p className="mb-6 mt-3 text-sm leading-7 text-neutral-600">{description}</p>
              <Link data-business-event={`sector:${id}`} locale={lang} href={{ pathname: '/contact', query: { subject: `${c.cta}: ${title}`, source: `business:${lang}:${id}` } }} className="mt-auto text-sm font-semibold text-purple-700 hover:underline">{c.sectorCta} →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20" aria-labelledby="process-title">
        <h2 id="process-title" className="text-3xl font-bold tracking-tight">{c.processTitle}</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">{c.steps.map(([title, description], index) => (
          <li key={title} className="border-t-2 border-purple-200 pt-5"><p className="text-sm font-semibold text-purple-700">0{index + 1}</p><h3 className="mt-2 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-7 text-neutral-600">{description}</p></li>
        ))}</ol>
      </section>
      <section id="partnership" className="mt-20 scroll-mt-28 rounded-3xl bg-purple-50 p-6 sm:p-10">
        <h2 className="text-3xl font-bold tracking-tight">{c.contactTitle}</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-neutral-600">{c.contactIntro}</p>
        {capture('brief', true)}
      </section>
      <section className="mt-16" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-2xl font-bold">{c.faqTitle}</h2>
        <div className="mt-5 divide-y divide-neutral-200">{c.faqs.map(([question, answer]) => (
          <details key={question} className="py-5"><summary className="cursor-pointer font-semibold">{question}</summary><p className="mt-3 max-w-3xl leading-7 text-neutral-600">{answer}</p></details>
        ))}</div>
      </section>
      <aside className="mt-12 border-t border-neutral-200 pt-8 text-sm text-neutral-600">{c.enterprise} <Link data-business-event="enterprise" locale={lang} href="/enterprise" className="font-semibold text-purple-700 hover:underline">{c.enterpriseCta} →</Link></aside>
    </BusinessTracking>
  );
}
