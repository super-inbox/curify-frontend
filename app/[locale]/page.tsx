// app/page.tsx
import type { Metadata } from "next";
import HomeClient from "./_componentForPage/HomeClient";

export const metadata: Metadata = {
  title: "Curify | Power Content Creation with AI",
  description:
    "Curify is an AI-native platform helping creators, educators, and media teams produce and localize videos, manga, and presentations at scale. One-click video translation, emotional voice, lip syncing, and subtitle tools.",
};

export default function HomePage() {
  return <HomeClient />;
}
