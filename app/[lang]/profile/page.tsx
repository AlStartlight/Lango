import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ProfilePanel } from "@/components/auth/profile-panel";
import { getLanguageAvailability } from "@/lib/learning/content-repository";
import { isUiLocale } from "@/lib/i18n/locales";

export const metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { lang } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect(`/${lang}/sign-in?next=/${lang}/profile`);
  }

  if (!user.onboardingCompletedAt) {
    redirect(`/${lang}/onboarding`);
  }

  const uiLocale = isUiLocale(lang) ? lang : user.uiLocale;
  const availability = await getLanguageAvailability();

  return (
    <ProfilePanel
      locale={lang}
      availability={availability}
      user={{
        name: user.name,
        email: user.email,
        emailVerifiedAt: user.emailVerifiedAt,
        uiLocale,
        targetLanguage: user.targetLanguage,
        curriculumLevel: user.curriculumLevel,
        cefrLevel: user.cefrLevel,
        explanationLocale: user.explanationLocale,
        dailyGoalMinutes: user.dailyGoalMinutes,
        timezone: user.timezone,
        xpPoints: user.xpPoints,
        streakDays: user.streakDays,
      }}
    />
  );
}
