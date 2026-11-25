import { SignUpForm } from "@/components/auth/forms";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function SignUpPage({ params }: Props) {
  const { lang } = await params;

  return <SignUpForm locale={lang} />;
}
