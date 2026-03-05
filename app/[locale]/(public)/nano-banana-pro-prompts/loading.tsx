
function PromptCardSkeleton() {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-md">
      <div className="h-48 bg-gray-200" />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-20 rounded-full bg-indigo-100" />
            <div className="h-5 w-24 rounded-full bg-gray-100" />
          </div>

          <div className="mb-2 h-6 w-5/6 rounded bg-gray-300" />
          <div className="mb-2 h-4 w-full rounded bg-gray-200" />
          <div className="mb-4 h-4 w-2/3 rounded bg-gray-200" />

          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
              <div className="h-3 w-14 rounded bg-gray-200" />
              <div className="h-4 w-12 rounded bg-indigo-200" />
            </div>
            <div className="space-y-2 p-3">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-4/5 rounded bg-gray-200" />
            </div>
          </div>

          <div className="mt-3 h-6 w-28 rounded-full bg-indigo-100" />
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 w-24 rounded bg-gray-300" />
              <div className="mt-2 h-3 w-16 rounded bg-gray-200" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-16 rounded-md bg-gray-200" />
              <div className="h-8 w-16 rounded-md bg-indigo-200" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        <header className="mb-12 text-center">
          <div className="mx-auto h-10 w-3/4 rounded bg-gray-300" />
          <div className="mx-auto mt-3 h-6 w-1/2 rounded bg-gray-200" />
        </header>

        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={`stats-${idx}`}
              className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
            >
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="mt-3 h-9 w-20 rounded bg-gray-300" />
            </div>
          ))}
        </section>

        <section className="mb-8" aria-hidden="true">
          <div className="mb-4 h-6 w-44 rounded bg-gray-300" />
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`domain-${idx}`} className="h-10 w-28 rounded-lg bg-white shadow-sm" />
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-lg bg-white p-6 shadow" aria-hidden="true">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <div className="mb-1 h-4 w-14 rounded bg-gray-200" />
              <div className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2">
                <div className="h-5 w-4/5 rounded bg-gray-200" />
              </div>
            </div>

            <div>
              <div className="mb-1 h-4 w-14 rounded bg-gray-200" />
              <div className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2">
                <div className="h-5 w-3/4 rounded bg-gray-200" />
              </div>
            </div>

            <div>
              <div className="mb-1 h-4 w-24 rounded bg-gray-200" />
              <div className="flex h-10 items-center gap-2 px-1">
                <div className="h-6 w-24 rounded-full bg-indigo-100" />
                <div className="h-6 w-24 rounded-full bg-indigo-100" />
              </div>
            </div>
          </div>
        </section>

        <section aria-hidden="true">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, idx) => (
              <PromptCardSkeleton key={`prompt-card-${idx}`} />
            ))}
          </div>
        </section>

        <div className="mt-8 flex justify-center">
          <div className="h-12 w-60 rounded-md bg-indigo-200" />
        </div>
      </div>
    </div>
  );
}
