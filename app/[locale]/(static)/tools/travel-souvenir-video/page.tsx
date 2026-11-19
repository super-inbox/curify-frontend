import { getCanonicalUrl } from '@/lib/canonical';
import CreativeVideoToolPage from '@/app/[locale]/_components/CreativeVideoToolPage';
import { setRequestLocale } from 'next-intl/server';
export const metadata = { title: 'Travel souvenir video | Curify', alternates: {canonical: getCanonicalUrl('en', '/tools/travel-souvenir-video')}, robots: {index: false, follow: true} };
export default async function Page({params}: {params: Promise<{locale: string}>}) {
 const {locale}=await params; setRequestLocale(locale);
 return <CreativeVideoToolPage mode="souvenir" locale={locale}/>;
}
