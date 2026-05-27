import { formatNanoBananaContent } from "../utils/content-formatters";
import NanoBananaExamples from "../NanoBananaExamples";

interface NanoBananaContentProps {
  slug: string;
  t: any;
  locale: string;
}

// Helper: render a section only when the title+content pair has at least the
// content key. Avoids rendering empty H2s when fluff sections are deleted from
// the namespace.
function Section({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  if (!body) return null;
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div
        className="prose prose-lg max-w-none mb-4"
        dangerouslySetInnerHTML={{ __html: formatNanoBananaContent(body) }}
      />
    </section>
  );
}

const SECTION_KEYS: Array<{ titleKey: string; contentKey: string }> = [
  { titleKey: "whatIsTitle", contentKey: "whatIsContent" },
  { titleKey: "ecosystemTitle", contentKey: "ecosystemContent" },
  { titleKey: "seoTitle", contentKey: "seoContent" },
  { titleKey: "generatorTitle", contentKey: "generatorContent" },
  { titleKey: "toolsTitle", contentKey: "toolsContent" },
  { titleKey: "curifyTitle", contentKey: "curifyContent" },
  { titleKey: "promptGuideTitle", contentKey: "promptGuideContent" },
  { titleKey: "promptStructureTitle", contentKey: "promptStructureContent" },
  { titleKey: "promptExamplesTitle", contentKey: "promptExamplesContent" },
  { titleKey: "promptTemplatesTitle", contentKey: "promptTemplatesContent" },
  { titleKey: "promptGenerationTitle", contentKey: "promptGenerationContent" },
];

export default function NanoBananaContent({ slug, t, locale }: NanoBananaContentProps) {
  // t is safeT here — it returns the resolvedDefault when a key is missing.
  // For section skipping we want to check if the namespace actually has the key.
  // safeT signals "missing" by returning an empty string for unknown keys
  // (per page.tsx safeT impl).
  const get = (k: string) => {
    const v = t(k, "");
    return typeof v === "string" ? v : "";
  };
  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-blue-600 mb-4">{get("intro")}</p>

      {SECTION_KEYS.map(({ titleKey, contentKey }) => {
        const title = get(titleKey);
        const body = get(contentKey);
        if (!title && !body) return null;
        return <Section key={contentKey} title={title} body={body} />;
      })}

      <NanoBananaExamples locale={locale} blogSlug={slug} />

      {(get("conclusionTitle") || get("conclusionContent")) && (
        <Section title={get("conclusionTitle")} body={get("conclusionContent")} />
      )}
    </div>
  );
}
