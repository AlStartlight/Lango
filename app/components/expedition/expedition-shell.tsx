"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  BadgeCheck,
  BookMarked,
  BookOpen,
  Compass,
  Dumbbell,
  Flame,
  Gem,
  Heart,
  LibraryBig,
  Menu,
  ShieldAlert,
  Sparkles,
  Store,
  Swords,
  Target,
  Trophy,
  X,
} from "lucide-react";
import { expeditionCopy } from "./copy";
import { LangoMascot } from "./art";
import { AmbienceProvider } from "./ambience/ambience-provider";
import { AmbienceDock } from "./ambience/ambience-dock";
import { AmbienceOverlay } from "./ambience/ambience-overlay";
import { ambienceCopy } from "./ambience/ambience-copy";
import type { ExpeditionHud } from "@/lib/story/expedition";

export type ExpeditionSection =
  | "map"
  | "reader"
  | "practice"
  | "vault"
  | "results"
  | "library"
  | "leaderboard"
  | "store"
  | "survival"
  | "passport"
  | "ambience";

/**
 * Derives the highlighted sidebar section from the live pathname. The shell is
 * mounted in a shared layout, so this is the only thing that needs to react to
 * navigation on the client.
 */
function sectionFromPath(pathname: string): ExpeditionSection | null {
  const segments = pathname.split("/").filter(Boolean);
  const section = segments[1];
  if (section === "learn") return segments[2] === "survival" ? "survival" : "map";
  if (section === "reader") return "reader";
  if (section === "practice") return "practice";
  if (section === "vault") return "vault";
  if (section === "results") return "results";
  if (section === "stories") return "library";
  if (section === "leaderboard") return "leaderboard";
  if (section === "store") return "store";
  if (section === "passport") return "passport";
  if (section === "settings") return segments[2] === "ambience" ? "ambience" : null;
  return null;
}

/**
 * Inline navigation feedback. `useLinkStatus` flips to pending as soon as a
 * sidebar link is clicked and the router is waiting for the server render.
 */
function LinkPending() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`ml-auto h-2 w-2 shrink-0 rounded-full bg-exp-primary-container transition-opacity duration-150 ${
        pending ? "animate-pulse opacity-100" : "opacity-0"
      }`}
    />
  );
}

interface NavItem {
  key: ExpeditionSection;
  href: string;
  icon: typeof Compass;
  label: string;
  hint?: string;
}

function Avatar({
  name,
  avatarUrl,
  className = "h-9 w-9",
}: {
  name: string;
  avatarUrl: string | null;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      role="img"
      aria-label={name}
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-exp-primary-fixed bg-cover bg-center text-xs font-extrabold text-exp-on-primary-container ring-2 ring-exp-surface ${className}`}
      style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
    >
      {!avatarUrl && initials}
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-exp-surface bg-exp-primary-container" />
    </span>
  );
}

export function ExpeditionShell({
  lang,
  hud,
  continueSceneId,
  emailVerified,
  children,
}: {
  lang: string;
  hud: ExpeditionHud;
  continueSceneId: string | null;
  emailVerified: boolean;
  children: ReactNode;
}) {
  const copy = expeditionCopy(lang);
  const ambience = ambienceCopy(lang);
  const pathname = usePathname();
  const active = sectionFromPath(pathname);
  const [open, setOpen] = useState(false);
  const targetPercent = Math.min(
    100,
    Math.round((hud.minutesToday / Math.max(1, hud.goalMinutes)) * 100),
  );

  const readerHref = `/${lang}/reader`;

  const nav: NavItem[] = [
    { key: "map", href: `/${lang}/learn`, icon: Compass, label: copy.map },
    { key: "reader", href: readerHref, icon: BookOpen, label: copy.interactive },
    { key: "practice", href: `/${lang}/practice`, icon: Dumbbell, label: copy.practice },
    { key: "vault", href: `/${lang}/vault`, icon: BookMarked, label: copy.vault },
    { key: "results", href: `/${lang}/results`, icon: BadgeCheck, label: copy.results },
    { key: "library", href: `/${lang}/stories`, icon: LibraryBig, label: copy.library },
    { key: "leaderboard", href: `/${lang}/leaderboard`, icon: Trophy, label: copy.leaderboard },
    { key: "store", href: `/${lang}/store`, icon: Store, label: copy.store },
  ];

  const navLink = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = item.key === active;
    return (
      <Link
        key={item.key}
        href={item.href}
        onClick={() => setOpen(false)}
        aria-current={isActive ? "page" : undefined}
        className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors ${
          isActive
            ? "bg-exp-primary-container text-exp-on-primary-container shadow-[0_3px_0_var(--exp-primary)]"
            : "text-exp-on-surface-variant hover:bg-exp-container-high hover:text-exp-on-surface"
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="truncate">{item.label}</span>
        {item.key === "reader" && continueSceneId && (
          <span
            className="ml-auto h-2 w-2 shrink-0 rounded-full bg-exp-secondary-container"
            title={copy.continueReading}
            aria-hidden="true"
          />
        )}
        <LinkPending />
      </Link>
    );
  };

  const sidebar = (
    <div className="flex h-full flex-col justify-between gap-6 px-4 pb-6 pt-6">
      <div className="flex flex-col gap-6">
        <Link
          href={`/${lang}/learn`}
          className="flex items-center gap-2.5 px-2"
          onClick={() => setOpen(false)}
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-exp-primary-container shadow-[0_3px_0_var(--exp-primary)]">
            <LangoMascot className="h-8 w-8" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-exp-primary">Lango</span>
        </Link>

        <nav className="flex flex-col gap-1" aria-label={copy.menu}>
          {nav.map(navLink)}
          <div className="my-2 h-px bg-exp-container-high" />
          <Link
            href={`/${lang}/passport`}
            onClick={() => setOpen(false)}
            aria-current={active === "passport" ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors ${
              active === "passport"
                ? "bg-exp-primary-container text-exp-on-primary-container"
                : "text-exp-on-surface-variant hover:bg-exp-container-high hover:text-exp-on-surface"
            }`}
          >
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            {copy.passport}
          </Link>
          <Link
            href={`/${lang}/learn/survival`}
            onClick={() => setOpen(false)}
            aria-current={active === "survival" ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors ${
              active === "survival"
                ? "bg-exp-primary-container text-exp-on-primary-container"
                : "text-exp-on-surface-variant hover:bg-exp-container-high hover:text-exp-on-surface"
            }`}
          >
            <Swords className="h-5 w-5" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block truncate">{copy.survival}</span>
              <span
                className={`block truncate text-[10px] font-semibold uppercase tracking-wider ${
                  active === "survival"
                    ? "text-exp-on-primary-container/80"
                    : "text-exp-outline"
                }`}
              >
                {copy.survivalTip}
              </span>
            </span>
          </Link>
          <Link
            href={`/${lang}/settings/ambience`}
            onClick={() => setOpen(false)}
            aria-current={active === "ambience" ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors ${
              active === "ambience"
                ? "bg-exp-primary-container text-exp-on-primary-container"
                : "text-exp-on-surface-variant hover:bg-exp-container-high hover:text-exp-on-surface"
            }`}
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block truncate">{ambience.title}</span>
              <span
                className={`block truncate text-[10px] font-semibold uppercase tracking-wider ${
                  active === "ambience"
                    ? "text-exp-on-primary-container/80"
                    : "text-exp-outline"
                }`}
              >
                {ambience.livePreview}
              </span>
            </span>
          </Link>
        </nav>
      </div>

      <div className="rounded-2xl bg-exp-container p-4">
        <div className="flex items-center gap-2 text-exp-secondary">
          <Trophy className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs font-extrabold uppercase tracking-wide">
            {copy.adventurer}
          </span>
        </div>
        <p className="mt-2 text-xs font-medium leading-5 text-exp-on-surface-variant">
          {copy.shellTip}
        </p>
        <Link
          href={`/${lang}/practice`}
          onClick={() => setOpen(false)}
          className="mt-3 flex items-center gap-1 text-xs font-extrabold text-exp-primary hover:underline"
        >
          {copy.startNow}
        </Link>
      </div>
    </div>
  );

  return (
    <AmbienceProvider>
      <div className="relative min-h-screen bg-exp-surface text-exp-on-surface">
        <div className="relative z-10">
          <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-exp-container-high bg-exp-surface-low lg:block">
            {sidebar}
          </aside>

          {open && (
            <div className="fixed inset-0 z-[60] lg:hidden">
              <button
                type="button"
                aria-label={copy.close}
                className="absolute inset-0 bg-exp-inverse-surface/45 backdrop-blur-sm"
                onClick={() => setOpen(false)}
              />
              <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-exp-surface-low shadow-2xl">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={copy.close}
                  className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-exp-container text-exp-on-surface"
                >
                  <X className="h-4 w-4" />
                </button>
                {sidebar}
              </aside>
            </div>
          )}

          <div className="lg:pl-72">
            <header className="sticky top-0 z-40 border-b border-exp-container-high bg-exp-surface/85 backdrop-blur-xl">
              <div className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label={copy.menu}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-exp-container text-exp-on-surface lg:hidden"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-2 overflow-x-auto exp-scroll-hide">
                    <span className="exp-pill shrink-0 bg-exp-container text-exp-on-surface">
                      <Flame className="h-4 w-4 text-exp-secondary-container" aria-hidden="true" />
                      {hud.streak} {copy.streakDays}
                    </span>
                    <span className="exp-pill shrink-0 bg-exp-container text-exp-on-surface">
                      <Gem className="h-4 w-4 text-exp-tertiary" aria-hidden="true" />
                      {hud.xpTotal.toLocaleString("en-US")} {copy.xp}
                    </span>
                    <span className="exp-pill shrink-0 bg-exp-container text-exp-on-surface">
                      <Heart className="h-4 w-4 text-exp-error" aria-hidden="true" />
                      {hud.hearts}/5
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden items-center gap-2 rounded-full bg-exp-surface-low px-3 py-1.5 shadow-sm lg:flex">
                    <Target className="h-3.5 w-3.5 text-exp-on-surface-variant" aria-hidden="true" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wide text-exp-on-surface-variant">
                      {copy.dailyTarget}
                    </span>
                    <span className="h-2.5 w-24 overflow-hidden rounded-full bg-exp-container-highest">
                      <span
                        className="block h-full rounded-full bg-exp-primary-container"
                        style={{ width: `${targetPercent}%` }}
                      />
                    </span>
                    <span className="text-[11px] font-extrabold text-exp-primary">{targetPercent}%</span>
                  </div>
                  <Link
                    href={`/${lang}/profile`}
                    className="flex items-center gap-2 rounded-full bg-exp-surface-low px-2 py-1.5 pr-3 shadow-sm hover:bg-exp-container"
                  >
                    <span className="hidden flex-col text-right sm:flex">
                      <span className="max-w-36 truncate text-xs font-extrabold">{hud.name}</span>
                      <span className="text-[10px] font-bold text-exp-secondary">
                        {copy.level} {hud.level}
                      </span>
                    </span>
                    <Avatar name={hud.name} avatarUrl={hud.avatarUrl} />
                  </Link>
                </div>
              </div>
            </header>

            {!emailVerified && (
              <div className="flex flex-wrap items-center justify-center gap-2 border-b border-exp-secondary/30 bg-exp-secondary-fixed px-4 py-2 text-center text-xs font-semibold text-exp-secondary">
                <span>Verifikasi email untuk mengamankan progres ekspedisimu.</span>
                <Link href={`/${lang}/profile`} className="underline underline-offset-2">
                  {copy.profile}
                </Link>
              </div>
            )}

            <main className="min-h-[calc(100vh-4rem)] w-full">{children}</main>
          </div>

          <AmbienceOverlay />
          <AmbienceDock locale={lang} raised={active === "reader"} />
        </div>
      </div>
    </AmbienceProvider>
  );
}
