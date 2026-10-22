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
          {capture('hero')}
          <a data-business-event="examples" href="#examples" className="mt-5 inline-block text-sm font-semibold text-purple-700 underline underline-offset-4">{c.examplesCta} ↓</a>
        </div>
        <figure className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <Image src="/business/fabric-poster.jpg" alt={c.samples[0][1]} width={960} height={540} priority className="aspect-video w-full object-cover" />
          <figcaption className="p-5 text-sm leading-relaxed text-neutral-600">{c.samples[0][2]}</figcaption>
        </figure>
      </section>

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

      <section id="examples" className="mt-20 scroll-mt-28" aria-labelledby="examples-title">
        <h2 id="examples-title" className="text-3xl font-bold tracking-tight">{c.samplesTitle}</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-neutral-600">{c.samplesIntro}</p>
        <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
          {c.samples.map(([id, title, description]) => (
            <figure key={id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <video data-business-video={id} controls playsInline preload="none" poster={`/business/${id}-poster.jpg`} aria-label={title} className="aspect-video w-full bg-neutral-950 object-contain">
                <source src={`/business/${id}-watermarked.mp4`} type="video/mp4" />
                <a href={`/business/${id}-watermarked.mp4`}>{title}</a>
              </video>
              <figcaption className="p-6"><h3 className="text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-neutral-600">{description}</p></figcaption>
            </figure>
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
