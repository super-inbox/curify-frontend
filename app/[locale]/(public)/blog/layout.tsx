export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  await params;

  return (
    <main className="min-h-screen bg-[#FDFDFD] px-4 pt-18 pb-10 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}