import { PrismaClient } from "../app/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../app/lib/auth";

// Load env before creating Prisma client
import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env" });
dotenvConfig({ path: ".env.local" });

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL not set");
    process.exit(1);
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

// ── Dynamic user config ──────────────────────────

interface SeedUserConfig {
  name: string;
  email: string;
  password: string;
}

function getUsers(): SeedUserConfig[] {
  const raw = process.env.SEED_USERS;
  if (raw) {
    try {
      return JSON.parse(raw) as SeedUserConfig[];
    } catch {
      console.warn("⚠️  SEED_USERS invalid JSON, falling back to env vars");
    }
  }
  return [
    {
      name: process.env.SEED_USER_NAME || process.env.MOCK_USER_NAME || "Demo User",
      email: process.env.SEED_USER_EMAIL || process.env.MOCK_USER_EMAIL || "demo@langopulse.dev",
      password: process.env.SEED_USER_PASSWORD || process.env.MOCK_USER_PASSWORD || "password123",
    },
  ];
}

// ── Helpers ──────────────────────────────────────

const _now = new Date();
function daysAgo(n: number): Date {
  return new Date(_now.getTime() - n * 86_400_000);
}
function hoursAgo(n: number): Date {
  return new Date(_now.getTime() - n * 3_600_000);
}
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const HEATMAP_COLORS = [
  "#e2e2e2", "#aef759", "#94da3f", "#3f6a00", "#3f6a00",
];

function randomHeatmapColor(): string {
  return HEATMAP_COLORS[randomInt(0, HEATMAP_COLORS.length - 1)];
}

// ── Reference data ───────────────────────────────

const LANGUAGES = [
  { id: "english", label: "English", native: "English", icon: "white-balance-sunny", iconColor: "#3f6900", isFeatured: true, corner: "tr" },
  { id: "spanish", label: "Spanish", native: "Español", icon: "white-balance-sunny", iconColor: "#3f6900", isFeatured: true, corner: "none" },
  { id: "japanese", label: "Japanese", native: "日本語", icon: "flower", iconColor: "#ba1a1a", isFeatured: false, corner: "bl" },
  { id: "korean", label: "Korean", native: "한국어", icon: "flower", iconColor: "#785179", isFeatured: false, corner: "tl" },
  { id: "hindi", label: "Hindi", native: "हिन्दी", icon: "flower", iconColor: "#006e2f", isFeatured: false, corner: "br" },
  { id: "german", label: "German", native: "Deutsch", icon: "white-balance-sunny", iconColor: "#3f6900", isFeatured: false, corner: "tr" },
  { id: "arabic", label: "Arabic", native: "العربية", icon: "domain", iconColor: "#006e2f", isFeatured: false, corner: "none" },
  { id: "french", label: "French", native: "Français", icon: "silverware-fork-knife", iconColor: "#785179", isFeatured: false, corner: "tl" },
  { id: "portuguese", label: "Portuguese", native: "Português", icon: "white-balance-sunny", iconColor: "#3f6900", isFeatured: false, corner: "bl" },
  { id: "italian", label: "Italian", native: "Italiano", icon: "silverware-fork-knife", iconColor: "#785179", isFeatured: false, corner: "br" },
  { id: "dutch", label: "Dutch", native: "Nederlands", icon: "white-balance-sunny", iconColor: "#3f6900", isFeatured: false, corner: "tr" },
  { id: "indonesian", label: "Indonesian", native: "Bahasa Indonesia", icon: "white-balance-sunny", iconColor: "#3f6900", isFeatured: false, corner: "none" },
];

const GOAL_OPTIONS = [
  { id: "casual", label: "Casual", description: "5 mins / day", minutesPerDay: 5, icon: "coffee", isRecommended: false },
  { id: "regular", label: "Regular", description: "15 mins / day", minutesPerDay: 15, icon: "lightning-bolt", isRecommended: true },
  { id: "intense", label: "Intense", description: "30 mins / day", minutesPerDay: 30, icon: "dumbbell", isRecommended: false },
];

const ACHIEVEMENTS = [
  { id: "ach-001", icon: "weather-sunny", iconBg: "#ffd6fd", iconColor: "#785179", title: "Early Bird", description: "50 morning lessons" },
  { id: "ach-002", icon: "lightning-bolt", iconBg: "#aef759", iconColor: "#3f6a00", title: "Sprint Master", description: "7-day perfect streak" },
  { id: "ach-003", icon: "book-education", iconBg: "#6bff8f", iconColor: "#006e2f", title: "Grammar Guru", description: "Zero errors in quiz" },
];

const DAILY_CHALLENGE_ID = "challenge-001";
const EXERCISE_ID = "exercise-001";

const STUDY_GROUPS = [
  { id: "sg-001", icon: "coffee", iconBg: "#6bff8f", iconColor: "#007432", title: "Spanish Coffee Chat", description: "Daily conversational practice for intermediate learners.", memberCount: 124 },
  { id: "sg-002", icon: "pencil", iconBg: "#facaf9", iconColor: "#785179", title: "Japanese Kanji Masters", description: "Flashcard drills and etymology deep dives for JLPT N2.", memberCount: 89 },
  { id: "sg-003", icon: "book-open-variant", iconBg: "#a5ed50", iconColor: "#3f6900", title: "French Literature Club", description: "Reading and discussing classic French novels together.", memberCount: 57 },
  { id: "sg-004", icon: "microphone", iconBg: "#e8f5d0", iconColor: "#3f6a00", title: "Arabic Pronunciation", description: "Focused sessions on mastering Arabic phonetics.", memberCount: 43 },
];

const GLOBAL_CHALLENGE_ID = "gc-001";

const GRAMMAR_DETAIL_ID = "gd-001";
const GRAMMAR_RULES = [
  { id: "gr-masc", label: "Masculine", suffix: "-o", example: "El libro nuevo" },
  { id: "gr-fem", label: "Feminine", suffix: "-a", example: "La casa nueva" },
  { id: "gr-sing", label: "Singular", suffix: "", example: "The base form of the adjective." },
  { id: "gr-plur", label: "Plural", suffix: "-s / -es", example: "Add -s (vowels) or -es (consonants)." },
];
const EXAMPLES = [
  { id: "ex-001", phrase: "El gato negro", translation: "The black cat", agreementLabel: "Masculine / Singular", note: null },
  { id: "ex-002", phrase: "Un hombre inteligente", translation: "A smart man", agreementLabel: "Gender Neutral", note: "Adjectives ending in -e are often gender neutral." },
  { id: "ex-003", phrase: "Las casas blancas", translation: "The white houses", agreementLabel: "Feminine / Plural", note: null },
];

// ── Seed reference data ──────────────────────────

async function seedReferenceData() {
  console.log("🌱  Seeding reference data...");

  for (const lang of LANGUAGES) {
    await prisma.language.upsert({ where: { id: lang.id }, update: lang, create: lang });
  }
  console.log(`  ✓ ${LANGUAGES.length} languages`);

  for (const opt of GOAL_OPTIONS) {
    await prisma.goalOption.upsert({ where: { id: opt.id }, update: opt, create: opt });
  }
  console.log(`  ✓ ${GOAL_OPTIONS.length} goal options`);

  for (const ach of ACHIEVEMENTS) {
    await prisma.achievement.upsert({ where: { id: ach.id }, update: ach, create: ach });
  }
  console.log(`  ✓ ${ACHIEVEMENTS.length} achievements`);

  await prisma.dailyChallenge.upsert({
    where: { id: DAILY_CHALLENGE_ID },
    update: { title: "The Night Market", description: "Master conversational nuances in a bustling marketplace.", isNew: true },
    create: { id: DAILY_CHALLENGE_ID, title: "The Night Market", description: "Master conversational nuances in a bustling marketplace.", isNew: true },
  });

  await prisma.exercise.upsert({
    where: { id: EXERCISE_ID },
    update: {
      dailyChallengeId: DAILY_CHALLENGE_ID,
      xpReward: 15,
      masteryLevel: 2,
      flipCardWordTarget: "Blij",
      flipCardPronunciation: "/blɛi/",
      flipCardWordNative: "Happy",
      flipCardDefinition: "Common adjective for feeling joy or satisfaction.",
      correctChoiceId: "a",
      aiFeedbackMessage: "Great pronunciation! Now, can you tap the matching facial expression?",
    },
    create: {
      id: EXERCISE_ID,
      dailyChallengeId: DAILY_CHALLENGE_ID,
      xpReward: 15,
      masteryLevel: 2,
      flipCardWordTarget: "Blij",
      flipCardPronunciation: "/blɛi/",
      flipCardWordNative: "Happy",
      flipCardDefinition: "Common adjective for feeling joy or satisfaction.",
      correctChoiceId: "a",
      aiFeedbackMessage: "Great pronunciation! Now, can you tap the matching facial expression?",
    },
  });
  console.log(`  ✓ 1 daily challenge + 1 exercise`);

  const CHOICES = [
    { id: "a", emoji: "😊", label: "Happy" },
    { id: "b", emoji: "😢", label: "Sad" },
    { id: "c", emoji: "😲", label: "Surprised" },
    { id: "d", emoji: "😡", label: "Angry" },
  ];
  for (const ch of CHOICES) {
    await prisma.choice.upsert({
      where: { exerciseId_id: { exerciseId: EXERCISE_ID, id: ch.id } },
      update: { ...ch, exerciseId: EXERCISE_ID },
      create: { ...ch, exerciseId: EXERCISE_ID },
    });
  }
  console.log(`  ✓ ${CHOICES.length} choices`);

  await prisma.grammarDetail.upsert({
    where: { id: GRAMMAR_DETAIL_ID },
    update: { title: "Noun-Adjective Agreement", subtitle: "Matching gender and number for perfect sentences.", category: "Grammar Mastery" },
    create: { id: GRAMMAR_DETAIL_ID, title: "Noun-Adjective Agreement", subtitle: "Matching gender and number for perfect sentences.", category: "Grammar Mastery" },
  });

  for (const rule of GRAMMAR_RULES) {
    await prisma.grammarRule.upsert({
      where: { id: rule.id },
      update: { ...rule, grammarDetailId: GRAMMAR_DETAIL_ID },
      create: { ...rule, grammarDetailId: GRAMMAR_DETAIL_ID },
    });
  }
  console.log(`  ✓ ${GRAMMAR_RULES.length} grammar rules`);

  for (const ex of EXAMPLES) {
    await prisma.example.upsert({
      where: { id: ex.id },
      update: { ...ex, grammarDetailId: GRAMMAR_DETAIL_ID },
      create: { ...ex, grammarDetailId: GRAMMAR_DETAIL_ID },
    });
  }
  console.log(`  ✓ ${EXAMPLES.length} grammar examples`);

  await prisma.grammarQuiz.upsert({
    where: { grammarDetailId: GRAMMAR_DETAIL_ID },
    update: { prompt: "Los libros ___ (pequeño)", options: ["pequeño", "pequeños", "pequeña", "pequeñas"], correctAnswer: "pequeños", grammarDetailId: GRAMMAR_DETAIL_ID },
    create: { id: "gq-001", prompt: "Los libros ___ (pequeño)", options: ["pequeño", "pequeños", "pequeña", "pequeñas"], correctAnswer: "pequeños", grammarDetailId: GRAMMAR_DETAIL_ID },
  });
  console.log(`  ✓ 1 grammar quiz`);

  for (const sg of STUDY_GROUPS) {
    await prisma.studyGroup.upsert({ where: { id: sg.id }, update: sg, create: sg });
  }
  console.log(`  ✓ ${STUDY_GROUPS.length} study groups`);

  await prisma.globalChallenge.upsert({
    where: { id: GLOBAL_CHALLENGE_ID },
    update: { title: "7-Day Vocabulary Sprint", description: "Master 100 new words in a week.", isActive: true, participantCount: 2400 },
    create: { id: GLOBAL_CHALLENGE_ID, title: "7-Day Vocabulary Sprint", description: "Master 100 new words in a week.", isActive: true, participantCount: 2400 },
  });
  console.log(`  ✓ 1 global challenge`);
}

// ── Seed user data ───────────────────────────────

async function seedUserData(user: SeedUserConfig, idx: number) {
  const { name, email, password } = user;
  console.log(`\n👤  Seeding user [${idx + 1}]: ${name} <${email}>`);

  const activityColors = Array.from({ length: 28 }, () => randomHeatmapColor());

  const userId = `user-${idx + 1}-${crypto.randomUUID()}`;

  const passwordHash = await hashPassword(password);

  // 1. User
  await prisma.user.create({
    data: {
      id: userId,
      email,
      name,
      password: passwordHash,
      avatarUrl: null,
      nativeLanguage: "English",
      learningLanguage: "Spanish",
      dailyGoalMinutes: 15,
      streakDays: 12,
      badge: idx === 0 ? "Master Polyglot" : "Rising Star",
      xpPoints: 2400 - idx * 500,
      globalRank: 12 + idx * 5,
      level: 24 - idx * 3,
      levelLabel: "Polyglot in Training",
      levelProgressPercent: 72 - idx * 10,
      isPro: idx === 0,
      pronunciationAccuracyPercent: 94 - idx * 5,
      pronunciationTrendPercent: 2 + idx,
    },
  });

  // 2. UserSettings
  await prisma.userSettings.create({
    data: { userId, name, email, avatarUrl: null },
  });

  // 3. LearningSettings
  await prisma.learningSettings.create({
    data: { userId, dailyGoalMinutes: 20, targetLanguage: "Spanish", tutorVoice: "Mateo (Natural)" },
  });

  // 4. NotificationSettings
  await prisma.notificationSettings.create({
    data: { userId, lessonReminders: true, streakAlerts: true, communityMessages: false },
  });

  // 5. AppSettings
  await prisma.appSettings.create({
    data: { userId, darkMode: false, appLanguage: "English (US)" },
  });

  // 6. UserActivity (28-day heatmap)
  await prisma.userActivity.createMany({
    data: activityColors.map((color, i) => ({
      userId,
      date: daysAgo(27 - i),
      color,
    })),
  });

  // 7. UserAchievement
  for (const ach of ACHIEVEMENTS) {
    await prisma.userAchievement.create({
      data: { userId, achievementId: ach.id, unlockedAt: daysAgo(randomInt(1, 90)) },
    });
  }

  // 8. UserFluency
  const fluencies = [
    { language: "Spanish", percent: 72 - idx * 8 },
    { language: "Japanese", percent: 45 - idx * 5 },
  ];
  for (const f of fluencies) {
    await prisma.userFluency.create({
      data: { ...f, userId },
    });
  }

  // 9. UserExerciseProgress
  await prisma.userExerciseProgress.create({
    data: { userId, progressPercent: 65, hearts: 5, xpEarned: 420 + idx * 50 },
  });

  // 10. LessonResult + Mistakes
  const lessonId = `lesson-${idx + 1}`;
  const lessonResultId = `lr-${idx + 1}`;
  await prisma.lessonResult.create({
    data: {
      id: lessonResultId,
      lessonId,
      userId,
      userName: name,
      accuracyPercent: 92 - idx * 3,
      xpEarned: 25,
      timeTakenSeconds: 342,
      streakDays: 12,
      outperformedPercent: 88 - idx * 4,
      expertTip: "You're getting better at past-tense verbs! Focus on 'ir' irregulars next time.",
    },
  });

  const MISTAKES = [
    { id: `m-${idx + 1}-001`, type: "Verb Conjugation", prompt: "Yo ___ (comer) pan.", yourAnswer: "comemos", correctAnswer: "como", tipTitle: `The "Yo" Rule`, tipBody: "'Yo' uses the -o ending for -er verbs in the present tense." },
    { id: `m-${idx + 1}-002`, type: "Gender Agreement", prompt: "The black cat", yourAnswer: "El gato negra", correctAnswer: "El gato negro", tipTitle: "Noun-Adjective Harmony", tipBody: "Adjectives must match the gender of the noun." },
    { id: `m-${idx + 1}-003`, type: "Ser vs. Estar", prompt: "She ___ (to be) a doctor.", yourAnswer: "está médica", correctAnswer: "es médica", tipTitle: "Permanent States Use Ser", tipBody: "Professions are permanent traits — use 'ser', not 'estar'." },
  ];
  for (const m of MISTAKES) {
    await prisma.mistake.create({
      data: { ...m, lessonResultId },
    });
  }

  // 11. UserGrammarHistory + ReviewItems + TimelineEntries
  const grammarHistoryId = `ugh-${idx + 1}`;
  await prisma.userGrammarHistory.create({
    data: {
      id: grammarHistoryId,
      userId,
      masteryPercent: 68 - idx * 5,
      outperformedPercent: 74 - idx * 4,
    },
  });

  const REVIEW_ITEMS = [
    { id: `nr-${idx + 1}-001`, icon: "alert", title: "Ser vs. Estar", description: "Confused in 12/20 recent exercises. Review temporary vs. permanent states.", isUrgent: true },
    { id: `nr-${idx + 1}-002`, icon: "book-education", title: "Noun-Adjective Agreement", description: "Gender matching errors detected in complex sentences.", isUrgent: false },
  ];
  for (const ri of REVIEW_ITEMS) {
    await prisma.reviewItem.create({
      data: { ...ri, userGrammarHistoryId: grammarHistoryId },
    });
  }

  const TIMELINE_ENTRIES = [
    { id: `tl-${idx + 1}-001`, score: 92, title: "Present Tense", date: "Oct 24, 2023", description: "Mastered regular -ar, -er, and -ir verb conjugations.", status: "Completed", level: "Advanced Level" },
    { id: `tl-${idx + 1}-002`, score: 45, title: "Irregular Verbs", date: "Oct 21, 2023", description: "Significant struggle with stem-changing verbs like 'querer' and 'poder'.", status: "Incomplete", level: "Intermediate Level" },
    { id: `tl-${idx + 1}-003`, score: 78, title: "Direct Object Pronouns", date: "Oct 18, 2023", description: "Understanding the placement of 'lo', 'la', 'los', 'las'.", status: "Completed", level: "Beginner II" },
  ];
  for (const te of TIMELINE_ENTRIES) {
    await prisma.timelineEntry.create({
      data: { ...te, userGrammarHistoryId: grammarHistoryId },
    });
  }

  // 12. GroupMember — join first study group
  await prisma.groupMember.create({
    data: { groupId: "sg-001", userId },
  });

  // 13. UserChallengeProgress
  await prisma.userChallengeProgress.create({
    data: { userId, challengeId: GLOBAL_CHALLENGE_ID, progressPercent: 64 - idx * 10 },
  });

  // 14. TutorSession + TutorMessages
  const sessionId = `session-${idx + 1}-${Date.now()}`;
  await prisma.tutorSession.create({
    data: {
      id: sessionId,
      userId,
      title: "Practice: Ordering Coffee",
      language: "Spanish",
      tutorName: "Lingo AI",
    },
  });

  const MESSAGES = [
    { id: `msg-${idx + 1}-1`, role: "ai", text: "¡Hola! ¿Qué te gustaría ordenar hoy? Tenemos café recién hecho y pastelería deliciosa.", translation: "Hi! What would you like to order today?", grammarTip: null, createdAt: hoursAgo(3) },
    { id: `msg-${idx + 1}-2`, role: "user", text: "Quisiera un café con leche y un croissant, por favor.", translation: null, grammarTip: "Perfect sentence! You used \"quisiera\" (I would like) which is very polite for ordering.", createdAt: hoursAgo(2.9) },
    { id: `msg-${idx + 1}-3`, role: "ai", text: "Excelente elección. ¿Deseas el café grande o mediano?", translation: "Excellent choice. Do you want the coffee large or medium?", grammarTip: null, createdAt: hoursAgo(2.8) },
  ];
  for (const msg of MESSAGES) {
    await prisma.tutorMessage.create({
      data: { ...msg, sessionId },
    });
  }

  console.log(`  ✓ User + settings + activities + achievements + fluencies`);
  console.log(`  ✓ Exercise progress + lesson result + mistakes`);
  console.log(`  ✓ Grammar history + review items + timeline`);
  console.log(`  ✓ Group member + challenge progress`);
  console.log(`  ✓ Tutor session + ${MESSAGES.length} messages`);
}

// ── Main ─────────────────────────────────────────

async function main() {
  console.log("========================================");
  console.log("  Lango — Database Seeder");
  console.log("========================================\n");

  // ── Read dynamic users ──────────────────────────
  const users = getUsers();
  console.log(`📋  ${users.length} user(s) to seed:\n${users.map((u, i) => `    ${i + 1}. ${u.name} <${u.email}>`).join("\n")}\n`);

  // ── Clear existing user data (keep reference) ──
  console.log("🧹  Clearing existing user data...");
  await prisma.tutorMessage.deleteMany();
  await prisma.tutorSession.deleteMany();
  await prisma.userChallengeProgress.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.timelineEntry.deleteMany();
  await prisma.reviewItem.deleteMany();
  await prisma.userGrammarHistory.deleteMany();
  await prisma.mistake.deleteMany();
  await prisma.lessonResult.deleteMany();
  await prisma.userExerciseProgress.deleteMany();
  await prisma.userFluency.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.userActivity.deleteMany();
  await prisma.appSettings.deleteMany();
  await prisma.notificationSettings.deleteMany();
  await prisma.learningSettings.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.user.deleteMany();
  console.log("  ✓ Done\n");

  // ── Seed reference data ─────────────────────────
  await seedReferenceData();

  // ── Seed user data ──────────────────────────────
  for (let i = 0; i < users.length; i++) {
    await seedUserData(users[i], i);
  }

  console.log("\n========================================");
  console.log("✅  Seed complete");
  console.log(`   ${users.length} user(s) seeded`);
  console.log("========================================");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
