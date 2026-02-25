import { Metadata } from "next";
import HotTopicsListClient from "./HotTopicsListClient";

export const metadata: Metadata = {
  title: "Hot Topics List - Curify Studio",
  description: "Simple list view of trending topics with AI-powered scores",
};

export default function HotTopicsListPage() {
  return <HotTopicsListClient />;
}
