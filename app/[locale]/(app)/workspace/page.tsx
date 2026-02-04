// app/[locale]/workspace/page.tsx
import ProfileClientPage from "./ProfileClientPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="min-h-screen">
      <ProfileClientPage />
    </main>
  );
}
