// app/[locale]/about/page.tsx

import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Curify | Vision, Technology & Team",
  description: "Learn about Curify's vision to democratize content creation with AI...",
};

export default function AboutPage() {
  return <AboutClient />;
}
