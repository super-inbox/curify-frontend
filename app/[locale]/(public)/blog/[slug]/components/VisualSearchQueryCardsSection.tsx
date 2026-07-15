import WcSearchQueryCard from "@/app/[locale]/_components/WcSearchQueryCard";

interface VisualSearchQueryCardsSectionProps {
  locale: string;
}

// Query list for the "Try These Searches on Curify" section of the
// visual-search-platform-comparison blog post only — the same 8 queries
// referenced in that post's pilot dataset (messages/*/blog.json
// toolsContent, kept in blog.json as unrendered source data for this slug).
const VISUAL_SEARCH_DEMO_QUERIES = [
  "单词",
  "卡通",
  "家居装饰",
  "食物",
  "Spanish vocabulary printable",
  "ESL flashcards printable",
  "cozy reading aesthetic",
  "genshin",
];

export default function VisualSearchQueryCardsSection({ locale }: VisualSearchQueryCardsSectionProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {VISUAL_SEARCH_DEMO_QUERIES.map((query) => (
        <WcSearchQueryCard key={query} locale={locale} query={query} />
      ))}
    </div>
  );
}
