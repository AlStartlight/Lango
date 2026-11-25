import { ResetPasswordForm } from "@/components/auth/forms";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const query = await searchParams;
  const token = Array.isArray(query.token) ? query.token[0] : query.token;

  return <ResetPasswordForm locale={lang} token={token} />;
}
