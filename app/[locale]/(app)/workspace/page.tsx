// app/[locale]/workspace/page.tsx
import WorkspaceClient from "./WorkspaceClientPage";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <main className="min-h-screen">
      <WorkspaceClient locale={locale} />
    </main>
  );
}
