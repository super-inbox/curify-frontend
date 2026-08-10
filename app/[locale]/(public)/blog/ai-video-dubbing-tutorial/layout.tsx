import { dedicatedBlogMetadata } from "../_dedicated-metadata";

// This route renders a bespoke client component, so it bypasses
// [slug]/page.tsx and needs its own metadata — without this it inherits the
// blog-index title. See ../_dedicated-metadata.ts.
export const generateMetadata = dedicatedBlogMetadata("ai-video-dubbing-tutorial");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
