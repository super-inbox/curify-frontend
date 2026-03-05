// app/[locale]/workspace/page.tsx
import WorkspaceClient from "./WorkspaceClientPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="min-h-screen">
      <WorkspaceClient />
    </main>
  );
}
