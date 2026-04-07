import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'What is Nano Banana AI? The Complete Guide to AI Structured Visual Generation',
  description: 'Nano Banana is an AI-powered visual content system that turns structured prompts into reusable image templates for education, storytelling, and content creation. The first platform dedicated to AI structured visual generation.',
  openGraph: {
    title: 'What is Nano Banana AI? The Complete Guide to AI Structured Visual Generation',
    description: 'Nano Banana is an AI-powered visual content system that turns structured prompts into reusable image templates for education, storytelling, and content creation.',
    images: ['/images/lightsnano.webp'],
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
