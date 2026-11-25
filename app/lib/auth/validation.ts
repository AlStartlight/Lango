import { z } from "zod";
import { validatePassword } from "./password";
import {
  ALL_CURRICULUM_LEVELS,
  LANGUAGE_CODES,
  UI_LOCALES,
  defaultLevelForLanguage,
  frameworkForLanguage,
  isLevelForLanguage,
  type CurriculumLevelCode,
  type LanguageCode,
} from "@/lib/i18n/locales";

const emailSchema = z
  .string()
  .trim()
  .transform((value) => value.toLowerCase())
  .pipe(z.string().email("Masukkan email yang valid."));

const passwordSchema = z.string().superRefine((value, context) => {
  const result = validatePassword(value);
  if (!result.valid) {
    context.addIssue({
      code: "custom",
      message: result.message ?? "Password tidak valid.",
    });
  }
});

export const UiLocaleSchema = z.enum(UI_LOCALES, {
  message: "Bahasa tampilan tidak didukung.",
});

export const LanguageCodeSchema = z.enum(LANGUAGE_CODES, {
  message: "Bahasa yang dipelajari tidak didukung.",
});

export const CurriculumLevelSchema = z.enum(
  ALL_CURRICULUM_LEVELS as [CurriculumLevelCode, ...CurriculumLevelCode[]],
  { message: "Level kurikulum tidak dikenal." },
);

export const ExplanationLocaleSchema = z.enum(["en", "id", "ja"], {
  message: "Bahasa penjelasan harus en, id, atau ja.",
});

function levelBelongsToLanguage(
  language: LanguageCode,
  level: string,
): boolean {
  return isLevelForLanguage(language, level);
}

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter.")
      .max(80, "Nama maksimal 80 karakter."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    rememberMe: z.boolean().optional().default(false),
    uiLocale: UiLocaleSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password wajib diisi."),
  rememberMe: z.boolean().optional().default(false),
});

export const ForgotPasswordSchema = z.object({
  email: emailSchema,
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(20, "Token tidak valid."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

export const VerifyEmailSchema = z.object({
  token: z.string().min(20, "Token tidak valid."),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

export const OnboardingSchema = z
  .object({
    targetLanguage: LanguageCodeSchema.default("en"),
    curriculumLevel: CurriculumLevelSchema.optional(),
    /** Legacy field kept for older clients; ignored when curriculumLevel exists. */
    cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1"]).optional(),
    uiLocale: UiLocaleSchema.optional(),
    dailyGoalMinutes: z.union([
      z.literal(5),
      z.literal(10),
      z.literal(15),
      z.literal(30),
    ]),
    timezone: z.string().min(1).max(80).default("Asia/Jakarta"),
    motivation: z
      .enum(["career", "exam", "travel", "hobby", "family"])
      .optional(),
  })
  .superRefine((data, context) => {
    if (
      data.curriculumLevel &&
      !levelBelongsToLanguage(data.targetLanguage, data.curriculumLevel)
    ) {
      context.addIssue({
        code: "custom",
        path: ["curriculumLevel"],
        message: `Level ${data.curriculumLevel} tidak tersedia untuk ${data.targetLanguage}. Framework: ${frameworkForLanguage(data.targetLanguage)}.`,
      });
    }
  });

export const ProfileUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    avatarUrl: z.string().url().nullable().optional(),
    nativeLanguage: LanguageCodeSchema.optional(),
    uiLocale: UiLocaleSchema.optional(),
    targetLanguage: LanguageCodeSchema.optional(),
    curriculumLevel: CurriculumLevelSchema.optional(),
    explanationLocale: ExplanationLocaleSchema.optional(),
    cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1"]).optional(),
    dailyGoalMinutes: z
      .union([z.literal(5), z.literal(10), z.literal(15), z.literal(30)])
      .optional(),
    timezone: z.string().min(1).max(80).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Tidak ada perubahan yang dikirim.",
  });

export const LocalePreferenceSchema = z
  .object({
    uiLocale: UiLocaleSchema,
  })
  .strict();

export const CurriculumAttemptSchema = z
  .object({
    clientAttemptId: z.string().min(8).max(80),
    questionId: z.string().min(3).max(180),
    answer: z.union([
      z.string().max(2000),
      z.object({ choiceId: z.string().max(80) }),
      z.object({ order: z.array(z.string().max(80)).max(20) }),
      z.object({ accepted: z.string().max(2000) }),
    ]),
    timeSpentMs: z.number().int().min(0).max(30 * 60 * 1000).default(0),
  })
  .strict();

export function resolveOnboardingLevel(
  input: Pick<
    z.infer<typeof OnboardingSchema>,
    "targetLanguage" | "curriculumLevel" | "cefrLevel"
  >,
): CurriculumLevelCode {
  if (input.curriculumLevel) return input.curriculumLevel;
  if (input.cefrLevel && isLevelForLanguage(input.targetLanguage, input.cefrLevel)) {
    return input.cefrLevel;
  }
  return defaultLevelForLanguage(input.targetLanguage);
}

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type OnboardingInput = z.infer<typeof OnboardingSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type LocalePreferenceInput = z.infer<typeof LocalePreferenceSchema>;
export type CurriculumAttemptInput = z.infer<typeof CurriculumAttemptSchema>;
