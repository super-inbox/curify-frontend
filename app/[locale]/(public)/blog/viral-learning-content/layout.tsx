import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Create Viral Learning Content (Flashcards, Dialogue Scenes, Visual Knowledge)',
  description: 'Discover how to create engaging educational content that goes viral. Learn to make vocabulary cards, dialogue scenes, and visual learning templates for ESL creators and teachers.',
  openGraph: {
    title: 'How to Create Viral Learning Content (Flashcards, Dialogue Scenes, Visual Knowledge)',
    description: 'Discover how to create engaging educational content that goes viral. Learn to make vocabulary cards, dialogue scenes, and visual learning templates for ESL creators and teachers.',
    images: ['/images/learnContent.png'],
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
