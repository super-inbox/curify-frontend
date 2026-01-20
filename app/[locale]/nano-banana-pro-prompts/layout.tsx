import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nano Banana Pro Prompts',
  description: 'Discover and explore creative prompts from Nano Banana Pro',
};

export default function NanoBananaProPromptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-16 min-h-screen bg-white">
      {children}
    </div>
  );
}
