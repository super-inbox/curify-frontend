import type { ResolvedVerticalPage } from "@/lib/nano_seo_utils";

/**
 * VerticalPageSchema v1 render (Pillars 1 & 2). Server components, no client JS.
 * - VerticalAttributeChips: the ontology chip strip under the H1 (Pillar 2, visible).
 * - VerticalKnowledgeSection: the authored domain-knowledge block (Pillar 1).
 * Both no-op when `vertical` is null, so pages outside the pilot render unchanged.
 * See docs/vertical-page-schema-v1.md.
 */

export function VerticalAttributeChips({
  vertical,
}: {
  vertical: ResolvedVerticalPage | null;
}) {
  if (!vertical || vertical.attributes.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2" aria-label={`${vertical.schema.label} attributes`}>
      {vertical.attributes.map((a) => (
        <span
          key={a.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-700"
        >
          <span className="font-medium text-neutral-400">{a.label}</span>
          <span className="font-semibold text-neutral-800">{a.value}</span>
        </span>
      ))}
    </div>
  );
}

export function VerticalKnowledgeSection({
  vertical,
}: {
  vertical: ResolvedVerticalPage | null;
}) {
  if (!vertical || vertical.knowledge.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-neutral-900">{vertical.schema.label} details</h2>
      <dl className="mt-4 space-y-5">
        {vertical.knowledge.map((k) => (
          <div key={k.key}>
            <dt className="text-base font-semibold text-neutral-900">{k.label}</dt>
            <dd className="mt-2 text-sm leading-6 text-neutral-700">{k.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
