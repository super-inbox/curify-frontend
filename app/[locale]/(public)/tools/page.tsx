// app/[locale]/tools/page.tsx
import ToolsClient from "./ToolsClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="min-h-screen">
      <ToolsClient />
    </main>
  );
}
