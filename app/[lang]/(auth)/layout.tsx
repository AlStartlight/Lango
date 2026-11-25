import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-base">
      <aside className="hidden w-1/2 flex-col justify-between border-r border-default bg-surface p-16 lg:flex">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold tracking-tight text-accent-primary">
            Lango
          </h1>
          <p className="mt-3 text-xl text-secondary-text">
            Latihan bahasa yang jelas, singkat, dan tersimpan.
          </p>
        </div>

        <ul className="max-w-md space-y-5 text-base text-secondary-text">
          <li className="flex items-start gap-4 leading-relaxed">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-primary" />
            Pelajaran singkat yang menjelaskan setiap kesalahan
          </li>
          <li className="flex items-start gap-4 leading-relaxed">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-primary" />
            Progres, XP, dan streak yang tersimpan di akunmu
          </li>
          <li className="flex items-start gap-4 leading-relaxed">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-primary" />
            Review terjadwal untuk konsep yang perlu diulang
          </li>
          <li className="flex items-start gap-4 leading-relaxed">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-primary" />
            Mulai dari levelmu sendiri, tanpa komitmen kursus panjang
          </li>
        </ul>

        <p className="text-sm text-faint">
          &copy; {new Date().getFullYear()} Lango. All rights reserved.
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-8">
        {children}
      </main>
    </div>
  );
}
