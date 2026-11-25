import { cn } from "@/lib/utils";

/**
 * Shimmer skeleton primitives for the learner workspace.
 *
 * The `(expedition)` layout keeps the sidebar and HUD mounted, so only the page
 * segment streams on navigation. These blocks mirror the dashboard's real
 * geometry (hero → language/level rail → two-column card grid) so the swap from
 * skeleton to content does not shift the layout.
 *
 * The shimmer is CSS-only (`.exp-skeleton` in `globals.css`) and stops under
 * `prefers-reduced-motion`; the block keeps its base fill so it still reads as
 * a placeholder.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("exp-skeleton block rounded-lg", className)}
    />
  );
}

function SkeletonCardHeader() {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export function WorkspaceDashboardSkeleton({
  label = "Memuat dashboard",
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-5 sm:px-6 lg:gap-6 lg:px-8 lg:py-8"
    >
      <span className="sr-only">{label}…</span>

      {/* Welcome banner */}
      <section className="exp-hero relative overflow-hidden rounded-3xl p-5 shadow-xl sm:p-7 lg:p-9">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <Skeleton className="exp-skeleton-inverse h-6 w-44 rounded-full" />
            <Skeleton className="exp-skeleton-inverse h-9 w-full max-w-md rounded-xl sm:h-10" />
            <Skeleton className="exp-skeleton-inverse h-4 w-full max-w-xl rounded-full" />
            <Skeleton className="exp-skeleton-inverse h-4 w-2/3 max-w-sm rounded-full" />
            <div className="flex flex-wrap gap-2 pt-1">
              <Skeleton className="exp-skeleton-inverse h-7 w-28 rounded-full" />
              <Skeleton className="exp-skeleton-inverse h-7 w-32 rounded-full" />
            </div>
          </div>

          <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border-b-4 border-exp-container-highest bg-exp-surface-lowest p-3.5">
            <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-3.5 w-full rounded-full" />
              <Skeleton className="h-3.5 w-4/5 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Language + level rail */}
      <div className="exp-card flex flex-col gap-2 p-3.5">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`language-${index}`} className="h-9 w-20 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={`level-${index}`} className="h-9 w-16 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        {/* Left column */}
        <section className="flex flex-col gap-5 xl:col-span-7">
          {/* Continue card */}
          <div className="exp-card flex flex-col gap-4 p-5 lg:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-3 w-28 rounded-full" />
                  <Skeleton className="h-5 w-44 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-3 w-40 rounded-full" />
                <Skeleton className="h-3 w-8 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-full rounded-full" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <Skeleton className="h-4 w-56 rounded-full" />
              <Skeleton className="h-11 w-full rounded-xl sm:w-36" />
            </div>
          </div>

          {/* Quest map */}
          <div className="exp-card exp-dotted-map relative overflow-hidden p-5 lg:p-6">
            <div className="relative z-10 mb-5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-exp-container-high pb-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-6 w-48 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-32 rounded-full" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-5">
              {[0, 1, 2].map((index) => (
                <div
                  key={`node-${index}`}
                  className={cn(
                    "flex w-full flex-col items-center gap-2",
                    index % 3 === 0
                      ? "md:-translate-x-20"
                      : index % 3 === 1
                        ? "md:translate-x-20"
                        : "md:translate-x-0",
                  )}
                >
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-5 w-40 rounded-lg" />
                </div>
              ))}
            </div>

            <Skeleton className="relative z-10 mt-6 h-16 w-full rounded-xl" />
          </div>

          {/* Location artwork */}
          <Skeleton className="h-48 w-full rounded-2xl" />
        </section>

        {/* Right column */}
        <aside className="flex w-full flex-col gap-5 xl:col-span-5">
          {/* Daily quests */}
          <div className="exp-card flex flex-col gap-4 p-5">
            <SkeletonCardHeader />
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((index) => (
                <div
                  key={`quest-${index}`}
                  className="flex items-center gap-2.5 rounded-xl bg-exp-surface-low p-2.5"
                >
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Skeleton className="h-3 w-24 rounded-full" />
                      <Skeleton className="h-3 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>

          {/* Vocabulary vault */}
          <div className="exp-card flex flex-col gap-4 p-5">
            <SkeletonCardHeader />
            <div className="flex flex-wrap gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Skeleton key={`word-${index}`} className="h-7 w-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>

          {/* League */}
          <div className="exp-card flex flex-col gap-4 p-5">
            <SkeletonCardHeader />
            <div className="flex flex-col gap-1">
              {[0, 1, 2].map((index) => (
                <div
                  key={`league-${index}`}
                  className="flex items-center justify-between gap-2 p-1.5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Skeleton className="h-4 w-5 rounded-full" />
                    <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-24 rounded-full" />
                      <Skeleton className="h-2.5 w-16 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-12 rounded-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        </aside>
      </div>
    </div>
  );
}
