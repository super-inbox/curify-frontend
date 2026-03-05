
function InspirationListItemSkeleton() {
  return (
    <div className="flex gap-5 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="h-32 w-32 shrink-0 rounded-2xl border-2 border-neutral-100 bg-neutral-200" />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          <div className="mb-2 flex items-start gap-3">
            <div className="h-6 flex-1 rounded bg-neutral-200" />
            <div className="h-8 w-20 shrink-0 rounded-full bg-amber-100" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-4/5 rounded bg-neutral-200" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="h-7 w-24 rounded-full bg-purple-100" />
          <div className="h-7 w-20 rounded-full bg-blue-100" />
          <div className="h-7 w-28 rounded-full bg-blue-100" />
        </div>

        <div className="mt-auto flex gap-4">
          <div className="h-6 w-14 rounded bg-neutral-200" />
          <div className="h-6 w-14 rounded bg-neutral-200" />
          <div className="h-6 w-14 rounded bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

function NanoCardSkeleton() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-5 shadow-md">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="h-8 w-28 rounded-full bg-purple-100" />
        <div className="h-5 w-5 rounded bg-neutral-200" />
      </div>

      <div className="mb-4 aspect-[4/3] overflow-hidden rounded-2xl border-2 border-purple-100 bg-white">
        <div className="h-full w-full bg-purple-100" />
      </div>

      <div className="mb-4 rounded-2xl border border-purple-100 bg-white/70 p-4">
        <div className="h-5 w-full rounded bg-neutral-200" />
        <div className="mt-2 h-4 w-3/4 rounded bg-neutral-200" />
      </div>

      <div className="mt-auto flex gap-4">
        <div className="h-6 w-14 rounded bg-neutral-200" />
        <div className="h-6 w-14 rounded bg-neutral-200" />
        <div className="h-6 w-14 rounded bg-neutral-200" />
      </div>
    </div>
  );
}

function NanoInspirationRowSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, idx) => (
        <NanoCardSkeleton key={`inspiration-nano-${idx}`} />
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-20 pb-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Daily Inspiration Hub
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-600">
          Curated cards that translate real-world signals into creator-ready
          hooks and production beats. AI-rated for quality.
        </p>
      </header>

      <section className="animate-pulse">
        <div className="mb-6 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="h-10 flex-1 rounded-xl border border-neutral-200 bg-white" />
            <div className="h-10 w-36 rounded-xl border border-neutral-200 bg-white" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-3 w-52 rounded bg-neutral-200" />
            <div className="h-3 w-16 rounded bg-neutral-200" />
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <InspirationListItemSkeleton key={`hub-list-top-${idx}`} />
          ))}
          <NanoInspirationRowSkeleton />
          {Array.from({ length: 2 }).map((_, idx) => (
            <InspirationListItemSkeleton key={`hub-list-bottom-${idx}`} />
          ))}
        </div>
      </section>
    </main>
  );
}
