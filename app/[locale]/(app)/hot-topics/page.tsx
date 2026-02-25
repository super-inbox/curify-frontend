import { Metadata } from "next";
import HotTopicsClientPage from "./HotTopicsClientPage";

export const metadata: Metadata = {
  title: "Hot Topics - Curify Studio",
  description: "Discover trending content with high scores across multiple dimensions",
};

export default function HotTopicsPage() {
  return <HotTopicsClientPage />;
}
