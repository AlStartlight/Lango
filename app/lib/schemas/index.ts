import { z } from 'zod';

// ─── Shared API Response Pattern ──────────────────

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export function apiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema,
    error: ApiErrorSchema.nullable(),
    meta: z.object({
      timestamp: z.string().datetime(),
      requestId: z.string().uuid(),
    }),
  });
}

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: z.infer<typeof ApiErrorSchema> | null;
  meta: { timestamp: string; requestId: string };
};

// ── Token ─────────────────────────────────────────────────────────────────────

export const TokenSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().positive(), // seconds until expiry
});

export type Token = z.infer<typeof TokenSchema>;

// ── User ─────────────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  avatarUrl: z.string().url().nullable(),
  nativeLanguage: z.string().nullable(),
  learningLanguage: z.string().nullable(),
  dailyGoalMinutes: z.number().int().positive().default(10),
  streakDays: z.number().int().min(0).default(0),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

// ── Auth requests ─────────────────────────────────────────────────────────────

export const LoginRequestSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RegisterRequestSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;

// ── Auth responses ────────────────────────────────────────────────────────────

export const AuthDataSchema = z.object({
  user: UserSchema,
  token: TokenSchema,
});

export type AuthData = z.infer<typeof AuthDataSchema>;

export const AuthResponseSchema = apiResponseSchema(AuthDataSchema);

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const RefreshDataSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number().positive(),
});

export type RefreshData = z.infer<typeof RefreshDataSchema>;

export const RefreshResponseSchema = apiResponseSchema(RefreshDataSchema);

// ─── Onboarding ──────────────────────────────────

export const LanguageSchema = z.object({
  id: z.string(),
  label: z.string(),
  native: z.string(),
  icon: z.string(),
  iconColor: z.string(),
  isFeatured: z.boolean(),
  corner: z.enum(['tl', 'tr', 'bl', 'br', 'none']),
});

export const GoalOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  minutesPerDay: z.number(),
  icon: z.string(),
  isRecommended: z.boolean(),
});

export const OnboardingDataSchema = z.object({
  availableLanguages: z.array(LanguageSchema),
  goalOptions: z.array(GoalOptionSchema),
});

export const OnboardingResponseSchema = apiResponseSchema(OnboardingDataSchema);

// ─── Home / Dashboard ────────────────────────────

export const MomentumSchema = z.object({
  userName: z.string(),
  streakDays: z.number(),
  streakLabel: z.string(),
  dailyGoalPercent: z.number(),
});

export const DailyChallengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  isNew: z.boolean(),
});

export const WeeklyStatsSchema = z.object({
  proficiencyPercent: z.number(),
  label: z.string(),
});

export const LeaderboardEntrySchema = z.object({
  rank: z.number(),
  name: z.string(),
  badge: z.string(),
  xp: z.number(),
  isCurrentUser: z.boolean(),
});

export const HomeDataSchema = z.object({
  momentum: MomentumSchema,
  dailyChallenge: DailyChallengeSchema,
  weeklyStats: WeeklyStatsSchema,
  leaderboard: z.array(LeaderboardEntrySchema),
  leagueLabel: z.string(),
});

export const HomeResponseSchema = apiResponseSchema(HomeDataSchema);

// ─── Daily Exercise ──────────────────────────────

export const ExerciseProgressSchema = z.object({
  progressPercent: z.number(),
  hearts: z.number(),
  xpEarned: z.number(),
});

export const FlipCardSchema = z.object({
  wordInTargetLanguage: z.string(),
  pronunciation: z.string(),
  wordInNativeLanguage: z.string(),
  definition: z.string(),
});

export const ChoiceSchema = z.object({
  id: z.string(),
  emoji: z.string(),
  label: z.string(),
});

export const ExerciseSchema = z.object({
  id: z.string(),
  xpReward: z.number(),
  masteryLevel: z.number(),
  flipCard: FlipCardSchema,
  choices: z.array(ChoiceSchema),
  correctChoiceId: z.string(),
  aiFeedbackMessage: z.string(),
});

export const DailyDataSchema = z.object({
  progress: ExerciseProgressSchema,
  exercise: ExerciseSchema.nullable(),
});

export const DailyResponseSchema = apiResponseSchema(DailyDataSchema);

export const ExerciseAnswerSchema = z.object({
  exerciseId: z.string(),
  choiceId: z.string(),
});

// ─── Tutor ────────────────────────────────────────

export const TutorMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['ai', 'user']),
  text: z.string(),
  translation: z.string().nullable(),
  grammarTip: z.string().nullable(),
  createdAt: z.string(),
});

export const TutorSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  language: z.string(),
  tutorName: z.string(),
  messages: z.array(TutorMessageSchema),
});

export const TutorSessionDataSchema = TutorSessionSchema;

export const TutorResponseSchema = apiResponseSchema(TutorSessionDataSchema);

export const TutorSendMessageSchema = z.object({
  sessionId: z.string(),
  text: z.string().min(1),
});

// ─── Profile ─────────────────────────────────────

export const ProfileUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  nativeLanguage: z.string(),
  learningLanguage: z.string(),
  dailyGoalMinutes: z.number(),
  streakDays: z.number(),
  createdAt: z.string(),
});

export const FluencyItemSchema = z.object({
  language: z.string(),
  percent: z.number(),
});

export const AchievementSchema = z.object({
  id: z.string(),
  icon: z.string(),
  iconBg: z.string(),
  iconColor: z.string(),
  title: z.string(),
  description: z.string(),
});

export const ProfileDataSchema = z.object({
  user: ProfileUserSchema,
  badge: z.string(),
  xpPoints: z.number(),
  globalRank: z.number(),
  fluencyBreakdown: z.array(FluencyItemSchema),
  pronunciationAccuracyPercent: z.number(),
  pronunciationTrendPercent: z.number(),
  activityHeatmap: z.array(z.string()),
  achievements: z.array(AchievementSchema),
});

export const ProfileResponseSchema = apiResponseSchema(ProfileDataSchema);

// ─── Grammar Detail ──────────────────────────────

export const GrammarRuleSchema = z.object({
  label: z.string(),
  suffix: z.string(),
  example: z.string(),
});

export const GrammarExampleSchema = z.object({
  id: z.string(),
  phrase: z.string(),
  translation: z.string(),
  agreementLabel: z.string(),
  note: z.string().nullable(),
});

export const QuizSchema = z.object({
  prompt: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
});

export const GrammarDetailDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  category: z.string(),
  genderRules: z.array(GrammarRuleSchema),
  numberRules: z.array(GrammarRuleSchema),
  examples: z.array(GrammarExampleSchema),
  quiz: QuizSchema.nullable(),
});

export const GrammarDetailResponseSchema = apiResponseSchema(GrammarDetailDataSchema);

// ─── Grammar History ─────────────────────────────

export const ReviewItemSchema = z.object({
  id: z.string(),
  icon: z.string(),
  title: z.string(),
  description: z.string(),
  isUrgent: z.boolean(),
});

export const TimelineEntrySchema = z.object({
  id: z.string(),
  score: z.number(),
  title: z.string(),
  date: z.string(),
  description: z.string(),
  status: z.enum(['Completed', 'Incomplete']),
  level: z.string(),
});

export const GrammarHistoryDataSchema = z.object({
  masteryPercent: z.number(),
  outperformedPercent: z.number(),
  needsReview: z.array(ReviewItemSchema),
  timeline: z.array(TimelineEntrySchema),
});

export const GrammarHistoryResponseSchema = apiResponseSchema(GrammarHistoryDataSchema);

// ─── Lesson Results ──────────────────────────────

export const LessonResultsDataSchema = z.object({
  lessonId: z.string(),
  userName: z.string(),
  accuracyPercent: z.number(),
  xpEarned: z.number(),
  timeTakenSeconds: z.number(),
  streakDays: z.number(),
  outperformedPercent: z.number(),
  expertTip: z.string(),
});

export const LessonResultsResponseSchema = apiResponseSchema(LessonResultsDataSchema);

// ─── Review Mistakes ─────────────────────────────

export const TipSchema = z.object({
  title: z.string(),
  body: z.string(),
});

export const MistakeSchema = z.object({
  id: z.string(),
  type: z.string(),
  prompt: z.string(),
  yourAnswer: z.string(),
  correctAnswer: z.string(),
  tip: TipSchema,
});

export const ReviewMistakesDataSchema = z.object({
  lessonId: z.string(),
  totalMistakes: z.number(),
  mistakes: z.array(MistakeSchema),
});

export const ReviewMistakesResponseSchema = apiResponseSchema(ReviewMistakesDataSchema);

// ─── Settings ────────────────────────────────────

export const SettingsUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().nullable(),
});

export const LearningSettingsSchema = z.object({
  dailyGoalMinutes: z.number(),
  targetLanguage: z.string(),
  tutorVoice: z.string(),
});

export const NotificationSettingsSchema = z.object({
  lessonReminders: z.boolean(),
  streakAlerts: z.boolean(),
  communityMessages: z.boolean(),
});

export const AppSettingsSchema = z.object({
  darkMode: z.boolean(),
  appLanguage: z.string(),
});

export const SettingsDataSchema = z.object({
  user: SettingsUserSchema,
  level: z.number(),
  levelLabel: z.string(),
  levelProgressPercent: z.number(),
  isPro: z.boolean(),
  learning: LearningSettingsSchema,
  notifications: NotificationSettingsSchema,
  app: AppSettingsSchema,
});

export const SettingsResponseSchema = apiResponseSchema(SettingsDataSchema);

export const SettingsUpdateSchema = z.object({
  learning: LearningSettingsSchema.partial().optional(),
  notifications: NotificationSettingsSchema.partial().optional(),
  app: AppSettingsSchema.partial().optional(),
});

// ─── Community ──────────────────────────────────

export const GlobalChallengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  progressPercent: z.number(),
  participantCount: z.number(),
});

export const CommunityLeaderboardEntrySchema = z.object({
  rank: z.number(),
  username: z.string(),
  xp: z.number(),
});

export const StudyGroupSchema = z.object({
  id: z.string(),
  icon: z.string(),
  iconBg: z.string(),
  iconColor: z.string(),
  title: z.string(),
  description: z.string(),
  memberCount: z.number(),
});

export const CommunityDataSchema = z.object({
  globalChallenge: GlobalChallengeSchema,
  weeklyLeaderboard: z.array(CommunityLeaderboardEntrySchema),
  studyGroups: z.array(StudyGroupSchema),
});

export const CommunityResponseSchema = apiResponseSchema(CommunityDataSchema);

// ─── Type exports ────────────────────────────────

export type Language = z.infer<typeof LanguageSchema>;
export type GoalOption = z.infer<typeof GoalOptionSchema>;
export type Momentum = z.infer<typeof MomentumSchema>;
export type DailyChallenge = z.infer<typeof DailyChallengeSchema>;
export type WeeklyStats = z.infer<typeof WeeklyStatsSchema>;
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
export type ExerciseProgress = z.infer<typeof ExerciseProgressSchema>;
export type FlipCard = z.infer<typeof FlipCardSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type TutorMessage = z.infer<typeof TutorMessageSchema>;
export type TutorSession = z.infer<typeof TutorSessionSchema>;
export type FluencyItem = z.infer<typeof FluencyItemSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type GrammarRule = z.infer<typeof GrammarRuleSchema>;
export type GrammarExample = z.infer<typeof GrammarExampleSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type ReviewItem = z.infer<typeof ReviewItemSchema>;
export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;
export type Mistake = z.infer<typeof MistakeSchema>;
export type Tip = z.infer<typeof TipSchema>;
export type StudyGroup = z.infer<typeof StudyGroupSchema>;
export type GlobalChallengeType = z.infer<typeof GlobalChallengeSchema>;
export type CommunityLeaderboardEntry = z.infer<typeof CommunityLeaderboardEntrySchema>;
export type AppSettings = z.infer<typeof AppSettingsSchema>;
export type LearningSettings = z.infer<typeof LearningSettingsSchema>;
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;
