"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { isUiLocale, toRouteLocale } from "@/lib/i18n/locales";

type Locale = string;

interface AuthFormProps {
  locale: Locale;
}

interface SignInProps extends AuthFormProps {
  next?: string;
}

interface ApiErrorBody {
  error?: { message?: string };
}

async function errorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error?.message ?? "Terjadi kesalahan. Coba lagi.";
}

function safeNext(next: string | undefined, locale: string): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return `/${locale}/learn`;
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border border-state-error/30 bg-state-error/5 px-4 py-3 text-sm text-state-error"
    >
      {message}
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  placeholder,
  required = true,
  minLength,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-primary"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="h-11 w-full rounded-xl border border-default bg-base px-4 text-sm text-primary outline-none transition-colors placeholder:text-faint focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
      />
    </div>
  );
}

function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="h-11 w-full rounded-xl bg-accent-primary text-sm font-semibold text-white transition-colors hover:bg-accent-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Memproses…" : children}
    </button>
  );
}

function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-primary">{title}</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-secondary-text">
        {subtitle}
      </p>
    </div>
  );
}

export function SignInForm({ locale, next }: SignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!response.ok) {
        setError(await errorMessage(response));
        return;
      }

      const body = await response.json();
      const onboardingCompleted = Boolean(
        body?.data?.user?.onboardingCompletedAt,
      );
      const preferredLocale =
        typeof body?.data?.user?.uiLocale === "string" &&
        isUiLocale(body.data.user.uiLocale)
          ? body.data.user.uiLocale
          : locale;
      const routeLocale = toRouteLocale(preferredLocale);
      window.location.assign(
        onboardingCompleted
          ? safeNext(next, routeLocale)
          : `/${routeLocale}/onboarding`,
      );
    } catch {
      setError("Koneksi terputus. Periksa jaringan lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Header
        title="Masuk ke Lango"
        subtitle="Lanjutkan latihan dan jaga progres belajarmu."
      />
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormError message={error} />
        <Field
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          placeholder="nama@email.com"
        />
        <Field
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          placeholder="Password"
        />
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-secondary-text">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-default accent-accent-primary"
            />
            Ingat saya
          </label>
          <Link
            href={`/${locale}/forgot-password`}
            className="text-sm font-medium text-accent-primary hover:underline"
          >
            Lupa password?
          </Link>
        </div>
        <SubmitButton loading={loading}>Masuk</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-secondary-text">
        Belum punya akun?{" "}
        <Link
          href={`/${locale}/sign-up`}
          className="font-semibold text-accent-primary hover:underline"
        >
          Daftar
        </Link>
      </p>
      <p className="mt-4 text-center text-xs leading-relaxed text-faint">
        Dengan masuk, kamu menyetujui{" "}
        <Link href={`/${locale}/terms`} className="underline">
          Ketentuan Layanan
        </Link>{" "}
        dan{" "}
        <Link href={`/${locale}/privacy`} className="underline">
          Kebijakan Privasi
        </Link>
        .
      </p>
    </div>
  );
}

export function SignUpForm({ locale }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          uiLocale: locale,
        }),
      });

      if (!response.ok) {
        setError(await errorMessage(response));
        return;
      }

      window.location.assign(`/${locale}/onboarding?welcome=1`);
    } catch {
      setError("Koneksi terputus. Periksa jaringan lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Header
        title="Buat akun Lango"
        subtitle="Mulai dengan target dan levelmu. Gratis, tanpa kartu kredit."
      />
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormError message={error} />
        <Field
          id="name"
          label="Nama"
          value={name}
          onChange={setName}
          autoComplete="name"
          placeholder="Nama kamu"
        />
        <Field
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          placeholder="nama@email.com"
        />
        <Field
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          minLength={8}
        />
        <Field
          id="confirmPassword"
          label="Konfirmasi password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          placeholder="Ulangi password"
          minLength={8}
        />
        <p className="text-xs leading-relaxed text-faint">
          Gunakan minimal 8 karakter. Kami akan mengirim tautan verifikasi ke
          emailmu; kamu tetap bisa mulai belajar sebelum memverifikasi.
        </p>
        <SubmitButton loading={loading}>Buat akun</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-secondary-text">
        Sudah punya akun?{" "}
        <Link
          href={`/${locale}/sign-in`}
          className="font-semibold text-accent-primary hover:underline"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}

export function ForgotPasswordForm({ locale }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        setError(await errorMessage(response));
        return;
      }

      const body = await response.json();
      setMessage(
        body?.data?.message ??
          "Jika email terdaftar, tautan reset telah dikirim.",
      );
    } catch {
      setError("Koneksi terputus. Periksa jaringan lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Header
        title="Lupa password"
        subtitle="Masukkan email akunmu. Kami akan mengirim tautan untuk mengatur password baru."
      />
      {message ? (
        <div
          role="status"
          className="rounded-xl border border-state-success/30 bg-state-success/5 px-4 py-4 text-sm leading-relaxed text-secondary-text"
        >
          {message}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormError message={error} />
          <Field
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            placeholder="nama@email.com"
          />
          <SubmitButton loading={loading}>Kirim tautan reset</SubmitButton>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-secondary-text">
        <Link
          href={`/${locale}/sign-in`}
          className="font-semibold text-accent-primary hover:underline"
        >
          Kembali ke halaman masuk
        </Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm({
  locale,
  token,
}: AuthFormProps & { token?: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setError("Tautan reset tidak valid. Minta tautan baru.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      if (!response.ok) {
        setError(await errorMessage(response));
        return;
      }

      setDone(true);
    } catch {
      setError("Koneksi terputus. Periksa jaringan lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Header
        title="Atur password baru"
        subtitle="Gunakan password yang kuat dan belum pernah kamu pakai di layanan lain."
      />
      {done ? (
        <div className="space-y-5">
          <div
            role="status"
            className="rounded-xl border border-state-success/30 bg-state-success/5 px-4 py-4 text-sm leading-relaxed text-secondary-text"
          >
            Password berhasil diperbarui. Semua sesi lain telah dikeluarkan.
          </div>
          <Link
            href={`/${locale}/sign-in`}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-accent-primary text-sm font-semibold text-white hover:bg-accent-primary/90"
          >
            Masuk dengan password baru
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormError message={error} />
          <Field
            id="password"
            label="Password baru"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            minLength={8}
          />
          <Field
            id="confirmPassword"
            label="Konfirmasi password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            placeholder="Ulangi password"
            minLength={8}
          />
          <SubmitButton loading={loading}>Simpan password</SubmitButton>
        </form>
      )}
      {!done && (
        <p className="mt-6 text-center text-sm text-secondary-text">
          <Link
            href={`/${locale}/forgot-password`}
            className="font-semibold text-accent-primary hover:underline"
          >
            Minta tautan baru
          </Link>
        </p>
      )}
    </div>
  );
}

export function VerifyEmailPanel({
  locale,
  token,
}: AuthFormProps & { token?: string }) {
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    token ? "verifying" : "error",
  );
  const [message, setMessage] = useState(
    token
      ? "Memverifikasi email…"
      : "Tautan verifikasi tidak valid. Minta tautan baru.",
  );
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;

    async function verify() {
      try {
        const response = await fetch("/api/v1/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          setStatus("error");
          setMessage(await errorMessage(response));
          return;
        }

        setStatus("success");
        setMessage("Email berhasil diverifikasi. Akunmu sekarang aman.");
      } catch {
        setStatus("error");
        setMessage("Koneksi terputus. Coba klik tautan lagi nanti.");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="w-full max-w-md">
      <Header
        title="Verifikasi email"
        subtitle="Konfirmasi bahwa alamat email ini benar-benar milikmu."
      />
      <div
        role="status"
        aria-live="polite"
        className={`rounded-xl border px-4 py-4 text-sm leading-relaxed ${
          status === "success"
            ? "border-state-success/30 bg-state-success/5 text-secondary-text"
            : status === "error"
              ? "border-state-error/30 bg-state-error/5 text-secondary-text"
              : "border-default bg-elevated text-secondary-text"
        }`}
      >
        {message}
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {status === "success" ? (
          <Link
            href={`/${locale}/learn`}
            className="flex h-11 items-center justify-center rounded-xl bg-accent-primary text-sm font-semibold text-white hover:bg-accent-primary/90"
          >
            Lanjut belajar
          </Link>
        ) : (
          <>
            <Link
              href={`/${locale}/sign-in`}
              className="flex h-11 items-center justify-center rounded-xl bg-accent-primary text-sm font-semibold text-white hover:bg-accent-primary/90"
            >
              Masuk
            </Link>
            <Link
              href={`/${locale}/forgot-password`}
              className="text-center text-sm font-medium text-accent-primary hover:underline"
            >
              Butuh bantuan?
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
