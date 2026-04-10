import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Turn 1 Idea into 30 Days of Content (Without Burning Out)',
  description: 'Discover the Nano Template System for content multiplication. Learn how to transform one core idea into a full month of high-value posts using atomization and template packs.',
  openGraph: {
    title: 'How to Turn 1 Idea into 30 Days of Content (Without Burning Out)',
    description: 'Discover the Nano Template System for content multiplication. Learn how to transform one core idea into a full month of high-value posts using atomization and template packs.',
    images: ['/mock-thumbnail.jpg'],
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
