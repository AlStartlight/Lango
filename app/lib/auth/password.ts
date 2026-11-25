import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

/**
 * Small, explicit blocklist. A production deployment should replace this with
 * a larger list or a k-anonymity breach check (see PRD 13.2).
 */
const COMMON_PASSWORDS = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "password1",
  "password123",
  "qwerty123",
  "qwertyuiop",
  "iloveyou",
  "admin123",
  "letmein",
  "welcome",
  "monkey",
  "dragon",
  "football",
  "baseball",
  "abc12345",
  "lango123",
]);

export interface PasswordValidation {
  valid: boolean;
  message?: string;
}

export function validatePassword(password: string): PasswordValidation {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`,
    };
  }

  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
    return {
      valid: false,
      message: `Password maksimal ${MAX_PASSWORD_BYTES} byte.`,
    };
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return {
      valid: false,
      message: "Password terlalu umum. Gunakan password yang lebih unik.",
    };
  }

  return { valid: true };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function passwordByteLength(password: string): number {
  return Buffer.byteLength(password, "utf8");
}
