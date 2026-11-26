import {
  INTERVIEW_WEIGHTS,
  type InterviewEvaluation,
  type InterviewFeedbackCode,
  type InterviewLanguage,
  type InterviewMetrics,
  type InterviewQuestion,
  type InterviewScores,
  type InterviewTrackId,
} from "./types";

/**
 * Deterministic v1 evaluator.
 *
 * There is no LLM key in this deployment yet, so scoring is rule-based and
 * deliberately conservative: evidence cannot exceed 3 without a number, very
 * short answers cannot score well, and the Japanese register dimension caps
 * casual speech. This matches the PRD's "pre-checks before LLM" contract; the
 * same shape can later be produced by the AI evaluator.
 */

const FILLERS: Record<InterviewLanguage, string[]> = {
  en: ["um", "uh", "you know", "sort of", "kind of", "basically", "i mean"],
  id: ["eee", "emm", "anu", "apa ya", "gitu", "kayak", "pokoknya"],
  ja: ["えーと", "えっと", "あのー", "そのー", "まあ", "なんか"],
};

const CASUAL_MARKERS: Record<InterviewLanguage, string[]> = {
  en: ["gonna", "wanna", "kinda", "yeah", "stuff", "sorta"],
  id: ["gue", "aku", "banget", "nggak", "gak", "kayak", "bikin"],
  ja: ["だよ", "だね", "じゃん", "っす", "だった", "する。"],
};

const FORMAL_MARKERS: Record<InterviewLanguage, string[]> = {
  en: ["thank you", "i would", "i have", "my experience", "i am"],
  id: [
    "terima kasih",
    "bapak",
    "ibu",
    "saya",
    "mohon",
    "demikian",
    "berdasarkan",
  ],
  ja: [
    "です",
    "ます",
    "ました",
    "ません",
    "ございます",
    "いたします",
    "申します",
    "お願い",
  ],
};

const KEIGO_MARKERS = [
  "いただ",
  "ござ",
  "申し",
  "御社",
  "弊社",
  "お伺い",
  "恐縮",
  "よろしく",
];

/** Four marker groups per track; hitting 3-4 groups is a complete answer. */
const STRUCTURE_MARKERS: Record<
  InterviewTrackId,
  Record<InterviewLanguage, string[][]>
> = {
  screening: {
    en: [
      ["thank you", "thanks for", "good morning", "hello", "hi "],
      ["years of experience", "my background", "i've worked", "i have worked"],
      ["my strength", "i'm good at", "i specialise", "i specialize", "i focus"],
      ["because", "i'm interested", "i want to", "this role", "the role"],
    ],
    id: [
      ["terima kasih", "selamat pagi", "selamat siang", "bapak", "ibu"],
      ["pengalaman", "tahun", "latar belakang", "saya bekerja"],
      ["kelebihan", "kekuatan", "saya mampu", "saya terbiasa", "fokus saya"],
      ["karena", "tertarik", "ingin", "posisi ini", "peran ini"],
    ],
    ja: [
      ["ありがとうございます", "よろしくお願い", "はい"],
      ["と申します", "経験", "専攻", "携わって"],
      ["強み", "得意", "できます"],
      ["志望", "興味", "貢献", "と考えて"],
    ],
  },
  behavioral: {
    en: [
      ["when", "at the time", "last year", "in my previous", "we had", "once"],
      ["i was responsible", "my job", "i had to", "i needed", "my task"],
      [
        "i decided",
        "i built",
        "i led",
        "i asked",
        "i changed",
        "i implemented",
        "i suggested",
      ],
      [
        "as a result",
        "resulted",
        "we shipped",
        "we reduced",
        "outcome",
        "impact",
        "saved",
      ],
    ],
    id: [
      ["saat", "waktu itu", "ketika", "pada saat", "di proyek"],
      [
        "saya bertanggung jawab",
        "tugas saya",
        "saya harus",
        "target saya",
        "peran saya",
      ],
      [
        "saya memutuskan",
        "saya membangun",
        "saya mengajak",
        "saya memimpin",
        "saya membuat",
        "saya minta",
      ],
      [
        "hasilnya",
        "akhirnya",
        "sehingga",
        "dampak",
        "berhasil",
        "turun",
        "naik",
      ],
    ],
    ja: [
      ["時", "際", "以前", "前職では"],
      ["担当", "私の役割", "必要があり"],
      ["対応しました", "改善しました", "提案しました", "共有しました", "決めました"],
      ["その結果", "結果的に", "できました", "増えました", "減りました"],
    ],
  },
  technical: {
    en: [
      ["the system", "we built", "the requirements", "the constraint"],
      ["first", "then", "we used", "the approach", "i chose"],
      ["trade-off", "tradeoff", "because", "at the cost", "we decided"],
      ["as a result", "reduced", "latency", "performance", "would change"],
    ],
    id: [
      ["sistem", "kami membangun", "kebutuhan", "batasan"],
      ["pertama", "lalu", "kami memakai", "pendekatan", "saya memilih"],
      ["trade-off", "karena", "konsekuensi", "kami memutuskan", "biaya"],
      ["hasilnya", "turun", "latensi", "performa", "akan mengubah"],
    ],
    ja: [
      ["システム", "構成", "要件", "制約"],
      ["まず", "次に", "使いました", "方針", "選びました"],
      ["トレードオフ", "代わり", "コスト", "判断"],
      ["その結果", "短縮", "ミリ秒", "改善", "変えたい"],
    ],
  },
  case: {
    en: [
      ["first", "the scope", "check", "data", "logs"],
      ["hypothesis", "correlate", "common", "likely", "suspect"],
      ["roll back", "mitigate", "test", "fix", "flag", "reproduce"],
      ["measure", "metric", "success", "before", "after", "within"],
    ],
    id: [
      ["pertama", "cakupan", "cek", "data", "log"],
      ["hipotesis", "korelasi", "kemungkinan", "dugaan", "faktor"],
      ["rollback", "mitigasi", "uji", "perbaiki", "reproduksi"],
      ["ukur", "metrik", "keberhasilan", "sebelum", "sesudah", "dalam"],
    ],
    ja: [
      ["まず", "範囲", "データ", "ログ", "確認"],
      ["仮説", "相関", "可能性", "原因"],
      ["ロールバック", "緩和", "検証", "修正", "再現"],
      ["測定", "指標", "成功", "前", "後", "以内"],
    ],
  },
  closing: {
    en: [
      ["expect", "range", "target", "offer", "compensation"],
      ["based on", "market", "data", "benchmark"],
      ["open to", "flexible", "discuss", "package", "negotiate"],
      ["could you", "your band", "what is", "share", "question"],
    ],
    id: [
      ["ekspektasi", "rentang", "target", "tawaran", "kompensasi"],
      ["berdasarkan", "pasar", "data", "riset", "acuan"],
      ["terbuka", "fleksibel", "diskusi", "paket", "negosiasi"],
      ["boleh", "rentang", "anggaran", "bagaimana", "pertanyaan"],
    ],
    ja: [
      ["希望", "レンジ", "想定", "オファー", "待遇"],
      ["市場", "データ", "基準", "調査"],
      ["相談", "柔軟", "検討", "パッケージ"],
      ["教えていただけ", "レンジ", "いかが", "質問"],
    ],
  },
  panel: {
    en: [
      ["i understand", "that's fair", "good question", "the shared goal"],
      ["evidence", "data", "for example", "because", "in my experience"],
      ["i propose", "a test", "compromise", "we could", "suggest"],
      ["commit", "document", "revisit", "even if", "respect"],
    ],
    id: [
      ["saya paham", "pertanyaan bagus", "tujuan bersama", "masuk akal"],
      ["bukti", "data", "contohnya", "karena", "pengalaman saya"],
      ["saya usulkan", "uji", "kompromi", "kita bisa", "saran"],
      ["komitmen", "catat", "tinjau", "meskipun", "hormat"],
    ],
    ja: [
      ["おっしゃる通り", "共通の目的", "理解しました"],
      ["根拠", "データ", "例えば", "なぜなら", "経験"],
      ["提案", "検証", "妥協", "できます"],
      ["コミット", "記録", "見直", "たとえ", "尊重"],
    ],
  },
};

const METRIC_PATTERN =
  /(\d+(?:[.,]\d+)?)\s*(%|percent|persen|juta|million|ribu|thousand|orang|users?|pengguna|kali|hours?|jam|menit|minutes?|mins?|days?|hari|tahun|years?|bulan|months?|万|人|名|時間|分|日|年|か月|パーセント)/gi;

/** Japanese often writes numbers in kanji (五万人, 二日, 四時間). */
const JA_METRIC_PATTERN =
  /[一二三四五六七八九十百千万]+(?:人|名|日|時間|分|年|か月|ヶ月|%|パーセント|円|万)/g;

const JA_CHAR = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]/gu;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[.,!?;:"'()[\]{}…、。！？「」『』（）]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countPhrase(haystack: string, phrase: string): number {
  const needle = normalize(phrase);
  if (!needle) return 0;
  if (/^[\x20-\x7e]+$/.test(needle)) {
    const matches = haystack.match(
      new RegExp(`(?:^|\\s)${escapeRegExp(needle)}(?=\\s|$)`, "g"),
    );
    return matches?.length ?? 0;
  }
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

function countAny(haystack: string, phrases: string[]): number {
  return phrases.filter((phrase) => haystack.includes(normalize(phrase))).length;
}

function wordsIn(text: string, language: InterviewLanguage): number {
  if (language === "ja") {
    return (text.match(JA_CHAR) ?? []).length;
  }
  return text.split(/\s+/).filter(Boolean).length;
}

function sentencesIn(text: string): number {
  return Math.max(
    1,
    text.split(/[.!?。！？]+/).map((part) => part.trim()).filter(Boolean).length,
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundScore(value: number): number {
  return clamp(Math.round(value), 1, 5);
}

function detectRegister(
  language: InterviewLanguage,
  text: string,
): {
  register: InterviewMetrics["register"];
  score: number;
} {
  const normalized = normalize(text);
  const formal = countAny(normalized, FORMAL_MARKERS[language]);
  const casual = countAny(normalized, CASUAL_MARKERS[language]);

  if (language === "ja") {
    const polite = (text.match(/です|ます|ました|ません|ございます/g) ?? [])
      .length;
    if (casual > 0 && polite > 0) {
      return { register: "neutral", score: 3 };
    }
    if (casual > 0 || polite === 0) {
      return { register: "casual", score: 2 };
    }
    const keigo = KEIGO_MARKERS.filter((marker) => text.includes(marker))
      .length;
    return {
      register: "formal",
      score: clamp(4 + (keigo > 1 ? 1 : 0), 1, 5),
    };
  }

  if (casual >= 2 && formal < 2) {
    return { register: "casual", score: 2 };
  }
  if (casual > 0 && formal > 0) {
    return { register: "neutral", score: 3 };
  }

  if (language === "en") {
    const firstPerson = (
      normalized.match(/(?:^|\s)i(?:'m|'ve|'d|\s)/g) ?? []
    ).length;
    const score = clamp(
      3 + (firstPerson >= 2 ? 1 : 0) + (formal >= 1 ? 1 : 0),
      1,
      5,
    );
    return {
      register: score >= 4 ? "formal" : "neutral",
      score,
    };
  }

  return {
    register: "formal",
    score: clamp(3 + (formal >= 2 ? 1 : 0) + (casual === 0 ? 1 : 0), 1, 5),
  };
}

export interface EvaluableAnswer {
  question: InterviewQuestion;
  transcript: string;
  durationMs: number;
  language: InterviewLanguage;
}

export function evaluateAnswer({
  question,
  transcript,
  durationMs,
  language,
}: EvaluableAnswer): InterviewEvaluation {
  const text = transcript.trim();
  const normalized = normalize(text);
  const words = wordsIn(text, language);
  const sentences = sentencesIn(text);
  const [minSec, maxSec] = question.expectedLengthSec;

  // Filler rate: count filler phrases, not raw words.
  const fillerCount = FILLERS[language].reduce(
    (total, filler) => total + countPhrase(` ${normalized} `, filler),
    0,
  );
  const fillerRatio = words > 0 ? fillerCount / words : 0;

  const metricMatches = text.match(METRIC_PATTERN) ?? [];
  const jaMetricMatches =
    language === "ja" ? (text.match(JA_METRIC_PATTERN) ?? []) : [];
  const metricCount = metricMatches.length + jaMetricMatches.length;

  const markerGroups = STRUCTURE_MARKERS[question.track][language];
  const structureGroups = markerGroups.filter(
    (group) => countAny(normalized, group) > 0,
  ).length;

  // Japanese characters carry more time than Latin words: chats include kanji
  // readings, particles, and pauses, so 4 chars/second is a conservative rate.
  const spokenSeconds = language === "ja" ? words / 4.0 : words / 2.4;
  const estimatedSeconds = spokenSeconds > 0.5 ? spokenSeconds : durationMs / 1000;

  const { register, score: registerScore } = detectRegister(language, text);

  // Content: relevance to the question keywords + a minimum substance bar.
  const matchedKeywords = question.keywords.filter((keyword) =>
    normalized.includes(normalize(keyword)),
  ).length;
  const keywordRatio =
    question.keywords.length > 0 ? matchedKeywords / question.keywords.length : 0;
  let content = 1 + keywordRatio * 2.5;
  if (words >= 25) content += 0.5;
  if (words >= 45) content += 0.5;
  if (structureGroups >= 2) content += 0.5;
  if (words < 12) content = Math.min(content, 2);
  if (words < 6) content = 1;
  const contentScore = roundScore(content);

  // Structure: 0-4 marker groups map to 1-5.
  const structureScore = roundScore(1 + structureGroups);
  const structureFinal =
    structureGroups >= 4 && estimatedSeconds < minSec * 0.4
      ? Math.min(structureScore, 3)
      : structureScore;

  // Evidence: numbers are required for a 5.
  let evidence = 2;
  if (metricCount === 1) evidence = 4;
  if (metricCount >= 2) evidence = 5;
  if (words < 20) evidence = Math.min(evidence, 2);
  if (metricCount === 0) evidence = Math.min(evidence, contentScore, 3);
  const evidenceScore = roundScore(evidence);

  // Delivery: length vs target and filler rate.
  const targetMid = (minSec + maxSec) / 2;
  const lengthRatio = estimatedSeconds / targetMid;
  let delivery = 5;
  if (lengthRatio < 0.25) delivery = 1;
  else if (lengthRatio < 0.4 || lengthRatio > 1.6) delivery = 2;
  else if (lengthRatio < 0.6 || lengthRatio > 1.4) delivery = 3;
  else if (lengthRatio < 0.8 || lengthRatio > 1.2) delivery = 4;

  if (fillerRatio > 0.12) delivery -= 2;
  else if (fillerRatio > 0.08) delivery -= 1.5;
  else if (fillerRatio > 0.04) delivery -= 0.75;
  const deliveryScore = roundScore(delivery);

  const scores: InterviewScores = {
    content: contentScore,
    structure: structureFinal,
    evidence: evidenceScore,
    language: roundScore(registerScore),
    delivery: deliveryScore,
  };

  const weighted = (
    Object.keys(INTERVIEW_WEIGHTS) as Array<keyof InterviewScores>
  ).reduce((total, key) => total + scores[key] * INTERVIEW_WEIGHTS[key], 0);
  const readiness = clamp(Math.round((weighted / 5) * 100), 20, 100);

  const strengths: InterviewFeedbackCode[] = [];
  const improvements: InterviewFeedbackCode[] = [];

  if (scores.structure >= 4) strengths.push("clear_structure");
  if (metricCount >= 1 && scores.evidence >= 4) strengths.push("has_metric");
  if (scores.delivery >= 4) strengths.push("good_length");
  if (scores.language >= 4) strengths.push("formal_register");
  if (scores.content >= 4) strengths.push("specific_example");
  if (scores.evidence >= 3 && metricCount >= 1)
    strengths.push("personal_contribution");

  if (metricCount === 0) improvements.push("add_metric");
  if (structureGroups <= 2) improvements.push("add_structure");
  if (estimatedSeconds < minSec * 0.6) improvements.push("too_short");
  if (estimatedSeconds > maxSec * 1.4) improvements.push("too_long");
  if (fillerRatio > 0.06) improvements.push("reduce_filler");
  if (register === "casual") improvements.push("use_formal_register");
  if (
    language === "en" &&
    (normalized.match(/(?:^|\s)i(?:'m|'ve|'d|\s)/g) ?? []).length < 2
  ) {
    improvements.push("use_first_person");
  }
  if (scores.content <= 3) improvements.push("add_specifics");
  if (structureGroups >= 2 && metricCount >= 1 && structureGroups < 4) {
    improvements.push("add_result");
  }

  const dedupe = <T,>(items: T[]): T[] => [...new Set(items)];

  const metrics: InterviewMetrics = {
    words,
    sentences,
    fillerCount,
    fillerRatio: Number(fillerRatio.toFixed(3)),
    metricCount,
    structureGroups,
    estimatedSeconds: Math.round(estimatedSeconds),
    register,
  };

  return {
    scores,
    readiness,
    feedback: {
      strengths: dedupe(strengths).slice(0, 3),
      improvements: dedupe(improvements).slice(0, 3),
    },
    metrics,
  };
}

/** Aggregate a session: duration-weighted mean of turn readiness values. */
export function aggregateReadiness(
  turns: Array<{ readiness: number; durationMs: number; metrics?: InterviewMetrics }>,
): number | null {
  if (turns.length < 3) return null;
  const totalWeight = turns.reduce(
    (total, turn) => total + Math.min(Math.max(turn.durationMs, 1), 150_000),
    0,
  );
  if (totalWeight <= 0) return null;
  const weighted = turns.reduce(
    (total, turn) =>
      total +
      turn.readiness * Math.min(Math.max(turn.durationMs, 1), 150_000),
    0,
  );
  return clamp(Math.round(weighted / totalWeight), 0, 100);
}
