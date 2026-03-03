import ContentCreationToolsSidebar from "@/app/[locale]/_components/ContentCreationToolsSidebar";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#FDFDFD] px-4 pt-18 pb-10 lg:px-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left: content */}
          <div className="lg:col-span-8 min-w-0">{children}</div>

          {/* Right: sidebar */}
          <aside className="lg:col-span-4 lg:border-l lg:border-neutral-200/70 lg:pl-8">
            <div className="space-y-6 lg:sticky lg:top-24">
              <ContentCreationToolsSidebar />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}