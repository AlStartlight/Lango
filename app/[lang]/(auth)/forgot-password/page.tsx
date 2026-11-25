import { ForgotPasswordForm } from "@/components/auth/forms";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { lang } = await params;
  return <ForgotPasswordForm locale={lang} />;
}
