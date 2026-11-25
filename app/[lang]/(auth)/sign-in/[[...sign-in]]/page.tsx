import { SignInForm } from "@/components/auth/forms";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ next?: string | string[] }>;
}

export default async function SignInPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const query = await searchParams;
  const next = Array.isArray(query.next) ? query.next[0] : query.next;

  return <SignInForm locale={lang} next={next} />;
}
