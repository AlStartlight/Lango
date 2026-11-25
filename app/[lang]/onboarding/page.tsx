import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { OnboardingForm } from "@/components/auth/onboarding-form";

export const metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function OnboardingPage({ params }: Props) {
  const { lang } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect(`/${lang}/sign-in?next=/${lang}/onboarding`);
  }

  if (user.onboardingCompletedAt) {
    redirect(`/${lang}/learn`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-6 py-12">
      <OnboardingForm
        locale={lang}
        initial={{
          targetLanguage: user.targetLanguage,
          curriculumLevel: user.curriculumLevel,
          dailyGoalMinutes: user.dailyGoalMinutes,
          timezone: user.timezone,
        }}
      />
    </main>
  );
}
