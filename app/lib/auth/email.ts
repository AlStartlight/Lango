import "server-only";
import nodemailer from "nodemailer";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface SendEmailResult {
  delivered: boolean;
  dev: boolean;
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();
  const from = process.env.EMAIL_FROM?.trim() || "Lango <no-reply@lango.local>";

  const isPlaceholder = (value?: string) =>
    !value ||
    value.includes("example.com") ||
    value.includes("your-") ||
    value.includes("xxxx");

  if (isPlaceholder(host) || isPlaceholder(user) || isPlaceholder(pass)) {
    return null;
  }

  return { host: host!, port, user: user!, pass: pass!, from };
}

export function appUrl(path = "/"): string {
  const base =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const config = getSmtpConfig();

  if (!config) {
    // Development fallback: make the flow testable without real SMTP
    // credentials. Never log the body in production.
    if (process.env.NODE_ENV !== "production") {
      console.info("\n[email:dev] --------------------------------------------------");
      console.info(`[email:dev] to: ${input.to}`);
      console.info(`[email:dev] subject: ${input.subject}`);
      console.info(input.text);
      console.info("[email:dev] --------------------------------------------------\n");
    } else {
      console.error(
        "[email] SMTP is not configured; transactional email was skipped.",
      );
    }
    return { delivered: false, dev: process.env.NODE_ENV !== "production" };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  await transporter.sendMail({
    from: config.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return { delivered: true, dev: false };
}

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="id">
  <body style="margin:0;padding:0;background:#f9f7f4;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#1a1714;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #ddd9d0;border-radius:16px;padding:32px;">
            <tr><td style="font-size:20px;font-weight:700;color:#ff6b35;padding-bottom:20px;">Lango</td></tr>
            <tr><td style="font-size:18px;font-weight:700;padding-bottom:12px;">${title}</td></tr>
            <tr><td style="font-size:15px;line-height:1.6;color:#4a4640;">${body}</td></tr>
            <tr><td style="padding-top:28px;font-size:12px;color:#837e78;">Jika kamu tidak meminta email ini, abaikan saja.</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function verificationEmail(name: string, url: string) {
  return {
    subject: "Verifikasi email Lango",
    text: `Halo ${name},\n\nVerifikasi email kamu dengan membuka tautan ini (berlaku 24 jam):\n${url}\n\nJika kamu tidak membuat akun Lango, abaikan email ini.`,
    html: layout(
      `Halo ${name}, verifikasi email kamu`,
      `<p>Klik tombol di bawah untuk memverifikasi email. Tautan berlaku 24 jam dan hanya bisa dipakai sekali.</p>
       <p style="padding:16px 0;"><a href="${url}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:600;">Verifikasi email</a></p>
       <p style="font-size:13px;color:#837e78;word-break:break-all;">${url}</p>`,
    ),
  };
}

export function passwordResetEmail(name: string, url: string) {
  return {
    subject: "Reset password Lango",
    text: `Halo ${name},\n\nKami menerima permintaan reset password. Buka tautan ini (berlaku 30 menit):\n${url}\n\nJika kamu tidak meminta reset, abaikan email ini; password kamu tidak berubah.`,
    html: layout(
      `Halo ${name}, atur ulang password`,
      `<p>Kami menerima permintaan reset password. Tautan berlaku 30 menit dan hanya bisa dipakai sekali.</p>
       <p style="padding:16px 0;"><a href="${url}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:600;">Atur password baru</a></p>
       <p style="font-size:13px;color:#837e78;word-break:break-all;">${url}</p>
       <p>Jika kamu tidak meminta reset, abaikan email ini.</p>`,
    ),
  };
}

export function passwordChangedEmail(name: string) {
  return {
    subject: "Password Lango berhasil diubah",
    text: `Halo ${name},\n\nPassword akun Lango kamu baru saja diubah. Semua sesi lain telah dikeluarkan. Jika ini bukan kamu, segera gunakan fitur lupa password.`,
    html: layout(
      `Halo ${name}, password kamu diubah`,
      `<p>Password akun Lango kamu baru saja diubah dan semua sesi lain telah dikeluarkan.</p>
       <p>Jika ini bukan kamu, segera gunakan fitur <strong>Lupa password</strong> dan hubungi support.</p>`,
    ),
  };
}
