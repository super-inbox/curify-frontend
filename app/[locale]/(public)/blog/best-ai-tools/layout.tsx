import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '10 Best AI Tools for Content Creators in 2026',
  description: 'Discover the top AI tools for content creation in 2026. From note-taking to video production, find the perfect tools to enhance your creative workflow.',
  openGraph: {
    title: '10 Best AI Tools for Content Creators in 2026',
    description: 'Discover the top AI tools for content creation in 2026. From note-taking to video production, find the perfect tools to enhance your creative workflow.',
    images: ['/images/bestools.webp'],
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
