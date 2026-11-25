import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Legacy route. The classic learning workspace now lives at /{locale}/learn/survival.
 * Keep the alias so old links keep working, and preserve query params.
 */
export default async function EditorPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const query = await searchParams;
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, item);
    } else if (value !== undefined) {
      search.set(key, value);
    }
  }

  const suffix = search.toString();
  redirect(`/${lang}/learn/survival${suffix ? `?${suffix}` : ""}`);
}
