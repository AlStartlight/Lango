/**
 * Instant navigation fallback for the learner workspace.
 *
 * The layout above this boundary keeps the sidebar and HUD mounted; this
 * skeleton streams in the moment a sidebar link is clicked, so a slow dynamic
 * render no longer looks like a frozen tab.
 */
export default function ExpeditionLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat halaman"
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-5 sm:px-6 lg:gap-6 lg:px-8 lg:py-8"
    >
      <div className="exp-card h-40 animate-pulse rounded-3xl bg-exp-container-high/60 sm:h-48" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="flex flex-col gap-5 xl:col-span-7">
          <div className="exp-card h-32 animate-pulse bg-exp-container-high/50" />
          <div className="exp-card h-64 animate-pulse bg-exp-container-high/40" />
        </div>
        <div className="flex flex-col gap-5 xl:col-span-5">
          <div className="exp-card h-48 animate-pulse bg-exp-container-high/50" />
          <div className="exp-card h-40 animate-pulse bg-exp-container-high/40" />
        </div>
      </div>
    </div>
  );
}
