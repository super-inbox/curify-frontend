import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Character Prompt Generator: Complete Guide to AI Character Design',
  description: 'Discover our comprehensive character prompt generator with nano banana templates. Learn how writers, artists, and creators can bring characters to life with AI.',
  openGraph: {
    title: 'Character Prompt Generator: Complete Guide to AI Character Design',
    description: 'Discover our comprehensive character prompt generator with nano banana templates. Learn how writers, artists, and creators can bring characters to life with AI.',
    images: ['/images/nano_insp_preview/template-character-analysis-zh-sha-wujing-prev.jpg'],
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
