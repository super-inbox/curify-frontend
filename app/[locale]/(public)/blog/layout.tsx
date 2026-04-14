import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog.metadata" });

  let title = t.has("title") ? t("title") : undefined;
  let description = t.has("description") ? t("description") : undefined;

  if (!title || !description) {
    const tEn = await getTranslations({
      locale: "en",
      namespace: "blog.metadata",
    });
    if (!title) title = tEn("title");
    if (!description) description = tEn("description");
  }

  return {
    title,
    description,
  };
}

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  await params;

  return (
    <main className="min-h-screen bg-[#FDFDFD] px-4 pt-4 pb-10 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}