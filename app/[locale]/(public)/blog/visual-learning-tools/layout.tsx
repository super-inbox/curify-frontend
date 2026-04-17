import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visual Learning Tools: How Students, Parents, and Teachers Can Transform Education',
  description: 'Discover our comprehensive visual learning tools designed for students, parents, and teachers. Learn how AI-powered visual aids can transform education and enhance learning experiences.',
  openGraph: {
    title: 'Visual Learning Tools: How Students, Parents, and Teachers Can Transform Education',
    description: 'Discover our comprehensive visual learning tools designed for students, parents, and teachers. Learn how AI-powered visual aids can transform education and enhance learning experiences.',
    images: ['/images/nano_insp_preview/template-word-scene-zh-student-wizard-school-prev.jpg'],
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
