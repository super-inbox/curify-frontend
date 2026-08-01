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

/**
 * Compact profile layout for the example page's Info panel (right column,
 * above the Customize button): each attribute is its own row (label left,
 * value right — a profile/spec sheet), followed by the authored knowledge
 * slots. No-ops when unauthored. Separate from the chip strip so the
 * template-detail page's VerticalAttributeChips look is untouched.
 */
export function VerticalInfoPanel({
  vertical,
}: {
  vertical: ResolvedVerticalPage | null;
}) {
  if (
    !vertical ||
    (vertical.attributes.length === 0 &&
      vertical.knowledge.length === 0 &&
      vertical.groupKnowledge.length === 0)
  ) {
    return null;
  }
  const KnowledgeRows = ({
    items,
  }: {
    items: { key: string; label: string; text: string }[];
  }) => (
    <div className="flex flex-col gap-3">
      {items.map((k) => (
        <div key={k.key}>
          <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">
            {k.label}
          </div>
          <p className="mt-1 text-sm leading-6 text-neutral-700">{k.text}</p>
        </div>
      ))}
    </div>
  );
  return (
    <div className="flex flex-col gap-4">
      {vertical.attributes.length > 0 && (
        <dl
          className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200"
          aria-label={`${vertical.schema.label} attributes`}
        >
          {vertical.attributes.map((a) => (
            <div key={a.key} className="flex items-baseline justify-between gap-3 px-3 py-2">
              <dt className="text-xs font-medium text-neutral-500">{a.label}</dt>
              <dd className="text-right text-sm font-semibold text-neutral-900">{a.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Type/level tier — shared across every example of this MBTI type / HSK
          level. Set apart so it doesn't read as example-specific. */}
      {vertical.groupKnowledge.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
          <div className="text-sm font-bold text-neutral-900">
            {vertical.groupLabel
              ? `About ${vertical.groupLabel}`
              : `About this ${vertical.schema.label.toLowerCase()}`}
          </div>
          <KnowledgeRows items={vertical.groupKnowledge} />
        </div>
      )}

      {/* Example-specific knowledge (this player / this reading card). */}
      {vertical.knowledge.length > 0 && <KnowledgeRows items={vertical.knowledge} />}
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
