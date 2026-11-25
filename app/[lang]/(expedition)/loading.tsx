import { WorkspaceDashboardSkeleton } from "@/components/expedition/loading-skeleton";

/**
 * Instant navigation fallback for the learner workspace.
 *
 * The layout above this boundary keeps the sidebar and HUD mounted; this
 * shimmer skeleton streams in the moment a sidebar link is clicked, so a slow
 * dynamic render no longer looks like a frozen tab.
 */
export default function ExpeditionLoading() {
  return <WorkspaceDashboardSkeleton />;
}
