import Link from "next/link";
import { requireLearner } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getLessonById } from "@/components/editor/grammar/grammar-data";

export const metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function ProgressPage({ params }: Props) {
  const { lang } = await params;
  const user = await requireLearner(lang, `/${lang}/progress`);

  const [stats, progress, dueReview] = prisma
    ? await Promise.all([
        prisma.userStats.findUnique({ where: { userId: user.id } }),
        prisma.lessonProgress.findMany({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
          take: 20,
        }),
        prisma.spacedReviewItem.count({
          where: {
            userId: user.id,
            status: "active",
            dueAt: { lte: new Date() },
          },
        }),
      ])
    : [null, [], 0];

  const completed = progress.filter(
    (item) => item.status === "completed" || item.status === "mastered",
  );

  const metrics = [
    { label: "XP total", value: stats?.xpTotal ?? 0 },
    { label: "Level", value: stats?.level ?? 1 },
    { label: "Streak", value: `${stats?.streakCurrent ?? 0} hari` },
    { label: "Review jatuh tempo", value: dueReview },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Progres belajar
          </h1>
          <p className="mt-1 text-sm text-secondary-text">
            Bukti kemajuanmu sejauh ini. Data diambil dari akun, bukan dari
            browser.
          </p>
        </div>
        <Link
          href={`/${lang}/learn`}
          className="rounded-xl border border-default px-4 py-2 text-sm font-medium text-secondary-text hover:bg-elevated"
        >
          Kembali belajar
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-default bg-surface p-4"
          >
            <p className="text-xs font-medium text-muted-text">{metric.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-default bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-text">
            Pelajaran terakhir
          </h2>
          <span className="text-xs text-muted-text">
            {completed.length} selesai
          </span>
        </div>

        {progress.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-default px-4 py-8 text-center">
            <p className="text-sm text-secondary-text">
              Belum ada aktivitas. Mulai pelajaran pertamamu.
            </p>
            <Link
              href={`/${lang}/learn`}
              className="mt-4 inline-flex h-10 items-center rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white hover:bg-accent-primary/90"
            >
              Pilih modul
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-default">
            {progress.map((item) => {
              const lesson = getLessonById(item.lessonId);
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary">
                      {lesson?.title ?? item.lessonId}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-text">
                      {lesson?.cefrLevel ?? "—"} · {item.attemptCount} attempt ·{" "}
                      akurasi {item.lastAccuracy}%
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      item.status === "completed" || item.status === "mastered"
                        ? "bg-state-success/10 text-state-success"
                        : "bg-state-warning/10 text-state-warning"
                    }`}
                  >
                    {item.status === "completed" || item.status === "mastered"
                      ? "Selesai"
                      : "Berjalan"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {dueReview > 0 && (
        <section className="mt-5 rounded-2xl border border-accent-xp/30 bg-accent-xp/5 p-5">
          <p className="text-sm font-semibold text-primary">
            {dueReview} konsep perlu diulang
          </p>
          <p className="mt-1 text-sm text-secondary-text">
            Review terjadwal membantu kamu mengingat materi lebih lama.
          </p>
        </section>
      )}
    </main>
  );
}
