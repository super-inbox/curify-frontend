// app/[locale]/tools/page.tsx
import type { Metadata } from "next";
import ToolsClient from "./ToolsClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Curify Tools",
  description:
    "Explore Curify Studio tools for video dubbing, subtitles, and AI-powered content workflows.",
};

export default function Page() {
  return (
    <main className="min-h-screen">
      <ToolsClient />
    </main>
  );
}
