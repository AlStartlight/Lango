"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSettings } from "@/components/settings/language-settings";
import type { LanguageAvailability } from "@/lib/learning/curriculum";
import type { LanguageCode } from "@/lib/i18n/locales";

interface ProfileUser {
  name: string;
  email: string;
  emailVerifiedAt: string | null;
  uiLocale: string;
  targetLanguage: string;
  curriculumLevel: string | null;
  cefrLevel: string;
  explanationLocale: string;
  dailyGoalMinutes: number;
  timezone: string;
  xpPoints: number;
  streakDays: number;
}

export function ProfilePanel({
  locale,
  user,
  availability,
}: {
  locale: string;
  user: ProfileUser;
  availability: Partial<Record<LanguageCode, LanguageAvailability>>;
}) {
  const { t } = useTranslation();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  async function resendVerification() {
    setSending(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(body?.error?.message ?? t("settings.verificationError"));
        return;
      }
      setNotice(
        body?.data?.devUrl
          ? t("settings.verificationDev")
          : t("settings.verificationSent"),
      );
    } catch {
      setError(t("settings.connectionError"));
    } finally {
      setSending(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChanging(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/v1/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, password, confirmPassword }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(body?.error?.message ?? t("settings.passwordChangeError"));
        return;
      }
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      setNotice(t("settings.passwordUpdated"));
    } catch {
      setError(t("settings.connectionError"));
    } finally {
      setChanging(false);
    }
  }

  async function logoutAll() {
    setLoggingOut(true);
    await fetch("/api/v1/auth/logout-all", { method: "POST" }).catch(
      () => null,
    );
    window.location.assign(`/${locale}/sign-in`);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            {t("settings.title")}
          </h1>
          <p className="mt-1 text-sm text-secondary-text">
            {t("settings.subtitle")}
          </p>
        </div>
        <Link
          href={`/${locale}/learn`}
          className="rounded-xl border border-default px-4 py-2 text-sm font-medium text-secondary-text hover:bg-elevated"
        >
          {t("settings.backToLearning")}
        </Link>
      </div>

      {notice && (
        <div className="mb-5 rounded-xl border border-state-success/30 bg-state-success/5 px-4 py-3 text-sm text-secondary-text">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-xl border border-state-error/30 bg-state-error/5 px-4 py-3 text-sm text-state-error">
          {error}
        </div>
      )}

      <LanguageSettings
        locale={locale}
        user={{
          uiLocale: user.uiLocale,
          targetLanguage: user.targetLanguage,
          curriculumLevel: user.curriculumLevel,
          explanationLocale: user.explanationLocale,
          timezone: user.timezone,
        }}
        availability={availability}
        hasUnsavedPassword={Boolean(
          currentPassword || password || confirmPassword,
        )}
      />

      <section className="mt-5 rounded-2xl border border-default bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-text">
          {t("settings.accountSection")}
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-text">{t("settings.nameLabel")}</dt>
            <dd className="mt-0.5 text-sm font-medium text-primary">
              {user.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-text">{t("settings.emailLabel")}</dt>
            <dd className="mt-0.5 flex items-center gap-2 text-sm font-medium text-primary">
              {user.email}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  user.emailVerifiedAt
                    ? "bg-state-success/10 text-state-success"
                    : "bg-state-warning/10 text-state-warning"
                }`}
              >
                {user.emailVerifiedAt
                  ? t("settings.verified")
                  : t("settings.unverified")}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-text">{t("settings.targetLabel")}</dt>
            <dd className="mt-0.5 text-sm font-medium uppercase text-primary">
              {user.targetLanguage}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-text">{t("settings.levelLabel")}</dt>
            <dd className="mt-0.5 text-sm font-medium text-primary">
              {user.cefrLevel}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-text">{t("settings.dailyGoalLabel")}</dt>
            <dd className="mt-0.5 text-sm font-medium text-primary">
              {t("settings.minutesPerDay", { count: user.dailyGoalMinutes })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-text">{t("settings.timezoneLabel")}</dt>
            <dd className="mt-0.5 text-sm font-medium text-primary">
              {user.timezone}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-text">{t("settings.xpLabel")}</dt>
            <dd className="mt-0.5 text-sm font-medium text-primary">
              {user.xpPoints}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-text">{t("settings.streakLabel")}</dt>
            <dd className="mt-0.5 text-sm font-medium text-primary">
              {t("settings.days", { count: user.streakDays })}
            </dd>
          </div>
        </dl>

        {!user.emailVerifiedAt && (
          <button
            type="button"
            onClick={resendVerification}
            disabled={sending}
            className="mt-5 h-10 rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white hover:bg-accent-primary/90 disabled:opacity-50"
          >
            {sending
              ? t("settings.sendingVerification")
              : t("settings.resendVerification")}
          </button>
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-default bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-text">
          {t("settings.passwordSection")}
        </h2>
        {!user.emailVerifiedAt ? (
          <p className="mt-3 text-sm text-secondary-text">
            {t("settings.verifyFirst")}
          </p>
        ) : (
          <form onSubmit={changePassword} className="mt-4 grid gap-3 sm:max-w-md">
            <label className="text-sm font-medium text-primary">
              {t("settings.currentPassword")}
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                className="mt-1 h-11 w-full rounded-xl border border-default bg-base px-4 text-sm text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
              />
            </label>
            <label className="text-sm font-medium text-primary">
              {t("settings.newPassword")}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                className="mt-1 h-11 w-full rounded-xl border border-default bg-base px-4 text-sm text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
              />
            </label>
            <label className="text-sm font-medium text-primary">
              {t("settings.confirmNewPassword")}
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                className="mt-1 h-11 w-full rounded-xl border border-default bg-base px-4 text-sm text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
              />
            </label>
            <button
              type="submit"
              disabled={changing}
              className="mt-1 h-11 rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white hover:bg-accent-primary/90 disabled:opacity-50"
            >
              {changing ? t("settings.savingPassword") : t("settings.savePassword")}
            </button>
          </form>
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-default bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-text">
          {t("settings.securitySection")}
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-secondary-text">
          {t("settings.sessionBody")}
        </p>
        <button
          type="button"
          onClick={logoutAll}
          disabled={loggingOut}
          className="mt-4 h-10 rounded-xl border border-state-error/30 bg-state-error/5 px-4 text-sm font-semibold text-state-error hover:bg-state-error/10 disabled:opacity-50"
        >
          {loggingOut ? t("settings.loggingOut") : t("settings.logoutAll")}
        </button>
      </section>
    </main>
  );
}
