import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "./session";

/**
 * Server-side guard for learner-only pages. Returns the authenticated user or
 * redirects to sign-in/onboarding. Proxy only checks cookie presence; this is
 * the authoritative check.
 */
export async function requireLearner(
  locale: string,
  nextPath?: string,
): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    const next = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/${locale}/sign-in${next}`);
  }

  if (!user.onboardingCompletedAt) {
    redirect(`/${locale}/onboarding`);
  }

  return user;
}
