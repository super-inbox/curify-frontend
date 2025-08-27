import dynamic from "next/dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Projects | Curify Studio",
  description: "Access your recent translation, dubbing, and editing projects in one place.",
};

const ClientProfilePage = dynamic(() => import("./profile-client"), { ssr: false });

export default function ProfilePage() {
  return <ClientProfilePage />;
}
