import Link from "next/link";
import CdnImage from "../../_components/CdnImage";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tag: string;
  image: string;
}

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

export default function BlogListPage() {
  const t = useTranslations("blog");
  const blogPosts = t.raw("posts") as BlogPost[];

  return (
    <div className="pt-2 pb-8">
      <div className="mx-auto max-w-[1180px]">
        <h1 className="mb-10 text-4xl font-bold">{t("latestArticles")}</h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.slug}
              className="group overflow-hidden rounded-xl border shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-56 w-full">
                <CdnImage
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-5">
                <div className="mb-2 text-xs font-semibold uppercase text-red-600">
                  {post.tag}
                </div>

                <div className="mb-2 text-sm text-gray-500">
                  {post.date} &nbsp; / &nbsp; {post.readTime}
                </div>

                <h2 className="text-lg font-semibold transition group-hover:text-blue-600">
                  {post.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}