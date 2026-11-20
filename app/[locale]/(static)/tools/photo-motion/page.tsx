import { creativeVideoMetadata } from '@/lib/creative-video-seo';
import CreativeVideoToolPage from '@/app/[locale]/_components/CreativeVideoToolPage';
import { setRequestLocale } from 'next-intl/server';
export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
 const {locale} = await params;
 return creativeVideoMetadata('motion', locale);
}
export default async function Page({params}: {params: Promise<{locale: string}>}) {
 const {locale}=await params; setRequestLocale(locale);
 return <CreativeVideoToolPage mode="motion" locale={locale}/>;
}
