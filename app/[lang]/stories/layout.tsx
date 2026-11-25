import type { ReactNode } from "react";
import { requireLearner } from "@/lib/auth/guards";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function StoriesLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  await requireLearner(lang, `/${lang}/stories`);
  return children;
}
