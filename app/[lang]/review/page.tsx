import Link from "next/link";
import { requireLearner } from "@/lib/auth/guards";
import { getReviewQueue } from "@/lib/learning/content-repository";

export const metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function ReviewPage({ params }: Props) {
  const { lang } = await params;
  const user = await requireLearner(lang, `/${lang}/review`);
  const items = await getReviewQueue(user.id, user.targetLanguage);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Review queue
          </h1>
          <p className="mt-1 text-sm text-secondary-text">
            Konsep yang sudah jatuh tempo. Ulangi sekarang agar tidak lupa.
          </p>
        </div>
        <Link
          href={`/${lang}/learn`}
          className="rounded-xl border border-default px-4 py-2 text-sm font-medium text-secondary-text hover:bg-elevated"
        >
          Kembali belajar
        </Link>
      </div>

      {items.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-default px-6 py-12 text-center">
          <p className="text-sm font-medium text-primary">
            Tidak ada review jatuh tempo.
          </p>
          <p className="mt-1 text-sm text-secondary-text">
            Jawab beberapa soal dulu; konsep yang salah akan muncul di sini.
          </p>
          <Link
            href={`/${lang}/learn`}
            className="mt-4 inline-flex h-10 items-center rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white hover:bg-accent-primary/90"
          >
            Mulai belajar
          </Link>
        </section>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-default bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary">
                    {item.question?.prompt ?? item.conceptKey}
                  </p>
                  <p className="mt-1 text-xs text-muted-text">
                    {item.question
                      ? `${item.question.lessonTitle} · ${item.question.level}`
                      : item.sourceType}
                  </p>
                </div>
                {item.question ? (
                  <Link
                    href={`/${lang}/learn/survival?module=curriculum&lesson=${encodeURIComponent(item.question.lessonId)}`}
                    className="shrink-0 rounded-xl bg-accent-primary px-3 py-2 text-sm font-semibold text-white hover:bg-accent-primary/90"
                  >
                    Ulangi
                  </Link>
                ) : (
                  <span className="rounded-full bg-elevated px-2 py-1 text-xs text-muted-text">
                    {item.moduleId}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
