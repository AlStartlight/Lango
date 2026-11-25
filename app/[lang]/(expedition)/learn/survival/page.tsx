import { WorkspacePage } from "@/components/editor/workspace-page";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function SurvivalPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return <WorkspacePage lang={lang} />;
}
