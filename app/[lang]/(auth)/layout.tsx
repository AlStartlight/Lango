import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-lime-300">
      {/* Left panel — branding / feature list (large screens only) */}
      <aside className="hidden w-1/2 flex-col justify-between bg-surface p-16 lg:flex">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold tracking-tight text-accent-primary">
            Lango
          </h1>
          <p className="mt-3 text-xl text-secondary-text">
            Master any language with native speakers
          </p>
        </div>

        <ul className="max-w-md space-y-5 text-base text-secondary-text">
          <li className="flex items-start gap-4 leading-relaxed">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-primary" />
            Interactive lessons tailored to your skill level with real-time feedback
          </li>
          <li className="flex items-start gap-4 leading-relaxed">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-primary" />
            One-on-one sessions with expert native tutors on your schedule
          </li>
          <li className="flex items-start gap-4 leading-relaxed">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-primary" />
            AI-powered practice exercises, smart review, and progress dashboards
          </li>
          <li className="flex items-start gap-4 leading-relaxed">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-primary" />
            Flexible monthly plans with no long-term commitment required
          </li>
        </ul>

        <p className="text-sm text-faint">
          &copy; {new Date().getFullYear()} Lango. All rights reserved.
        </p>
      </aside>

      {/* Right panel — Clerk form */}
      <main className="flex flex-1 items-center justify-center px-8 py-16">
        {children}
      </main>
    </div>
  )
}
