
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
        <NanoCardSkeleton key={`nano-card-${idx}`} />
      ))}
    </div>
  );
}

function SidebarToolSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-xl p-2.5">
      <div className="h-11 w-11 shrink-0 rounded-xl bg-neutral-200" />
      <div className="flex-1">
        <div className="h-5 w-2/3 rounded bg-neutral-200" />
        <div className="mt-2 h-4 w-full rounded bg-neutral-200" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] px-4 pt-18 pb-10 lg:px-6">
      <div className="mx-auto max-w-[1400px] animate-pulse">
        <div className="pt-10 pb-6">
          <div className="mx-auto max-w-4xl">
            <div className="h-10 w-3/4 rounded-xl bg-neutral-200" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full rounded bg-neutral-200" />
              <div className="h-4 w-5/6 rounded bg-neutral-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <div className="sticky top-24 z-10 mb-6 rounded-2xl border border-neutral-200 bg-white/95 p-2 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 px-2">
                <div className="h-5 w-5 rounded bg-neutral-200" />
                <div className="h-5 w-full rounded bg-neutral-200" />
              </div>
            </div>

            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <InspirationListItemSkeleton key={`home-list-top-${idx}`} />
              ))}
              <NanoInspirationRowSkeleton />
              {Array.from({ length: 2 }).map((_, idx) => (
                <InspirationListItemSkeleton key={`home-list-bottom-${idx}`} />
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 lg:border-l lg:border-neutral-200/70 lg:pl-8">
            <div className="space-y-6 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
                <div className="mb-4 h-7 w-48 rounded bg-neutral-200" />

                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <SidebarToolSkeleton key={`tool-${idx}`} />
                  ))}
                </div>

                <div className="mt-6 border-t border-neutral-100 pt-4">
                  <div className="h-11 w-full rounded-xl bg-blue-200" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
