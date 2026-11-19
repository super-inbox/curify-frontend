import { getCanonicalUrl } from '@/lib/canonical';
import CreativeVideoToolPage from '@/app/[locale]/_components/CreativeVideoToolPage';
import { setRequestLocale } from 'next-intl/server';
export const metadata = { title: 'Photo camera-motion video | Curify', alternates: {canonical: getCanonicalUrl('en', '/tools/photo-motion')}, robots: {index: false, follow: true} };
export default async function Page({params}: {params: Promise<{locale: string}>}) {
 const {locale}=await params; setRequestLocale(locale);
 return <CreativeVideoToolPage mode="motion" locale={locale}/>;
}
