#!/usr/bin/env node
/**
 * Deterministic pilot authoring generator (offline, no AI at runtime).
 * Produces real N5/A1 unit files from curated banks so the content platform,
 * import pipeline, and UI can be exercised end-to-end before the full banks
 * are authored. Output is committed JSON under content/curricula/**.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const VERSION = "2026.11.0";

function q(lesson, index) {
  return `${lesson.id}-q${String(index).padStart(4, "0")}`;
}

function uniqueChoices(correct, pool, count = 4) {
  const labels = [correct];
  for (const value of pool) {
    if (labels.length >= count) break;
    if (!labels.includes(value)) labels.push(value);
  }
  if (labels.length < count) throw new Error(`Not enough distractors for ${correct}`);
  return labels;
}

function shuffleDeterministic(values, seedText) {
  const result = [...values];
  let seed = [...seedText].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  for (let i = result.length - 1; i > 0; i -= 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildQuestions(lesson, language) {
  const questions = [];
  const words = lesson.words;
  let position = 0;

  const push = (question) => {
    position += 1;
    const id = q(lesson, position);
    questions.push({
      id,
      position,
      skill: question.skill ?? "vocabulary",
      type: question.type,
      prompt: question.prompt,
      ...(question.choices ? { choices: question.choices.map((label, index) => ({ id: `c${index + 1}`, label })) } : {}),
      answerKey: question.answerKey,
      explanations: question.explanations,
      conceptKey: question.conceptKey ?? `${language}:${lesson.levelCode}:${lesson.skill}:${position}`,
      difficulty: 1,
      tags: question.tags ?? [lesson.skill, language],
      source: "Lango curriculum team",
      license: "original",
      status: "published",
      generation: { method: "deterministic-pilot-v1", authoredAt: "2026-11-25" },
    });
  };

  // 1) 10 term → meaning questions.
  for (const word of words) {
    const prompt =
      language === "ja"
        ? `「${word.term}」の いみは どれですか。`
        : `What does “${word.term}” mean?`;
    push({
      type: "multiple_choice",
      prompt,
      choices: uniqueChoices(
        word.meaning,
        words.map((entry) => entry.meaning),
      ),
      answerKey: { choiceId: "c1" },
      explanations: {
        en: `“${word.term}” means “${word.meaning}”.`,
        id: `“${word.term}” berarti “${word.meaningId}”.`,
        ...(language === "ja" ? { ja: `「${word.term}」は「${word.meaningId}」という意味です。` } : {}),
      },
      conceptKey: `${language}:${lesson.levelCode}:${lesson.skill}:word:${word.term}`,
    });
  }

  // 2) 5 meaning → term questions.
  for (const word of words.slice(0, 5)) {
    const prompt =
      language === "ja"
        ? `「${word.meaningId}」に あう ことばは どれですか。`
        : `Which word means “${word.meaning}”?`;
    push({
      type: "multiple_choice",
      prompt,
      choices: uniqueChoices(
        word.term,
        words.map((entry) => entry.term),
      ),
      answerKey: { choiceId: "c1" },
      explanations: {
        en: `“${word.meaning}” is “${word.term}”.`,
        id: `“${word.meaningId}” adalah “${word.term}”.`,
        ...(language === "ja" ? { ja: `「${word.meaningId}」は「${word.term}」です。` } : {}),
      },
      conceptKey: `${language}:${lesson.levelCode}:${lesson.skill}:reverse:${word.term}`,
    });
  }

  // 3) 5 curated extras (kanji reading, situational use, collocations).
  for (const extra of lesson.extras) {
    push({
      type: "multiple_choice",
      prompt: extra.prompt,
      choices: extra.choices,
      answerKey: { choiceId: "c1" },
      explanations: extra.explanations,
      conceptKey: extra.conceptKey,
      skill: extra.skill ?? lesson.skill,
    });
  }

  // 4) 5 sentence-level questions.
  for (const sentence of lesson.sentences) {
    if (language === "ja") {
      const shuffled = shuffleDeterministic(sentence.tokens, sentence.text);
      push({
        type: "ordering",
        skill: "grammar",
        prompt: `${sentence.text}`,
        choices: shuffled,
        answerKey: { order: sentence.tokens },
        explanations: {
          en: `The correct order is: ${sentence.text}`,
          id: `Urutan yang benar: ${sentence.text}`,
          ja: `正しい語順は「${sentence.text}」です。`,
        },
        conceptKey: `${language}:${lesson.levelCode}:grammar:order:${sentence.id}`,
        tags: ["ordering", "grammar"],
      });
    } else {
      const pool = lesson.sentences.map((entry) => entry.paraphrase);
      push({
        type: "multiple_choice",
        skill: "reading",
        prompt: `Which sentence has the same meaning as “${sentence.text}”?`,
        choices: uniqueChoices(sentence.paraphrase, pool),
        answerKey: { choiceId: "c1" },
        explanations: {
          en: `“${sentence.text}” means “${sentence.paraphrase}”.`,
          id: `“${sentence.text}” berarti “${sentence.paraphrase}”.`,
        },
        conceptKey: `${language}:${lesson.levelCode}:reading:meaning:${sentence.id}`,
        tags: ["reading", "meaning"],
      });
    }
  }

  // 5) 5 fill-in-the-blank questions.
  for (const sentence of lesson.sentences) {
    push({
      type: "fill_blank",
      skill: "grammar",
      prompt: sentence.blank.prompt,
      choices: sentence.blank.choices,
      answerKey: { accepted: [sentence.blank.answer] },
      explanations: sentence.blank.explanations,
      conceptKey: `${language}:${lesson.levelCode}:grammar:blank:${sentence.id}`,
      tags: ["fill-blank", "grammar"],
    });
  }

  // 6) 5 grammar questions.
  for (const grammar of lesson.grammar) {
    push({
      type: "multiple_choice",
      skill: "grammar",
      prompt: grammar.prompt,
      choices: grammar.choices,
      answerKey: { choiceId: "c1" },
      explanations: grammar.explanations,
      conceptKey: grammar.conceptKey,
      tags: ["grammar"],
    });
  }

  return questions;
}

function materials(lesson) {
  const vocab = lesson.words
    .slice(0, 6)
    .map((word) => `${word.term} — ${word.meaning}`);
  const examples = lesson.sentences.map((sentence) => ({
    correct: sentence.text,
    annotation: sentence.en,
  }));

  return {
    en: {
      title: lesson.titleEn,
      objective: lesson.objectiveEn,
      blocks: [
        { type: "explanation", text: lesson.explanationEn },
        { type: "rules", items: vocab },
        { type: "examples", items: examples },
        { type: "tips", items: [lesson.tipEn] },
      ],
    },
    id: {
      title: lesson.titleId,
      objective: lesson.objectiveId,
      blocks: [
        { type: "explanation", text: lesson.explanationId },
        { type: "rules", items: lesson.words.slice(0, 6).map((word) => `${word.term} — ${word.meaningId}`) },
        { type: "examples", items: examples },
        { type: "tips", items: [lesson.tipId] },
      ],
    },
  };
}

function buildUnit({ language, framework, level, unit, lessons }) {
  return {
    schemaVersion: "1.0.0",
    contentVersion: VERSION,
    language,
    framework,
    level,
    status: "published",
    unit,
    lessons: lessons.map((lesson, index) => {
      const prepared = { ...lesson, levelCode: level, skill: lesson.skill, id: lesson.id };
      return {
        id: prepared.id,
        position: index + 1,
        slug: prepared.slug,
        title: prepared.title,
        objective: prepared.objective,
        skill: prepared.skill,
        kind: "lesson",
        estimatedMinutes: 8,
        status: "published",
        materials: materials(prepared),
        passages: [],
        questions: buildQuestions(prepared, language),
      };
    }),
  };
}

// ───────────────────────── Japanese N5, Unit 1 ─────────────────────────

const jaGreetings = {
  id: "ja-jlpt-n5-u01-l01",
  slug: "greetings",
  title: "あいさつ",
  titleEn: "Greetings",
  titleId: "Sapaan",
  objective: "Menyapa dan berpamitan pada waktu yang tepat.",
  objectiveEn: "Greet and say goodbye at the right time of day.",
  objectiveId: "Menyapa dan berpamitan sesuai waktu.",
  skill: "vocabulary",
  explanationEn: "Japanese greetings change with the time of day. おはよう in the morning, こんにちは during the day, こんばんは in the evening.",
  explanationId: "Sapaan Jepang berubah menurut waktu. おはよう pada pagi hari, こんにちは pada siang hari, こんばんは pada malam hari.",
  tipEn: "Bow slightly and say the greeting clearly. ありがとう is for gratitude, すみません for apology or attention.",
  tipId: "Bungkukkan badan sedikit dan ucapkan sapaan dengan jelas. ありがとう untuk terima kasih, すみません untuk maaf atau memanggil.",
  words: [
    { term: "おはよう", reading: "おはよう", meaning: "good morning", meaningId: "selamat pagi" },
    { term: "こんにちは", reading: "こんにちは", meaning: "good afternoon / hello", meaningId: "selamat siang" },
    { term: "こんばんは", reading: "こんばんは", meaning: "good evening", meaningId: "selamat malam" },
    { term: "さようなら", reading: "さようなら", meaning: "goodbye", meaningId: "selamat tinggal" },
    { term: "ありがとう", reading: "ありがとう", meaning: "thank you", meaningId: "terima kasih" },
    { term: "すみません", reading: "すみません", meaning: "excuse me / sorry", meaningId: "permisi / maaf" },
    { term: "はい", reading: "はい", meaning: "yes", meaningId: "ya" },
    { term: "いいえ", reading: "いいえ", meaning: "no", meaningId: "tidak" },
    { term: "おやすみなさい", reading: "おやすみなさい", meaning: "good night", meaningId: "selamat tidur" },
    { term: "はじめまして", reading: "はじめまして", meaning: "nice to meet you", meaningId: "senang berjumpa" },
  ],
  extras: [
    { prompt: "朝、人に会ったとき、何と言いますか。", choices: ["おはよう", "こんばんは", "おやすみなさい", "さようなら"], explanations: { en: "In the morning, say おはよう.", id: "Pada pagi hari, ucapkan おはよう." }, conceptKey: "ja:jlpt:n5:vocab:greeting-morning" },
    { prompt: "別れるとき、何と言いますか。", choices: ["さようなら", "こんにちは", "ありがとう", "はい"], explanations: { en: "When leaving, say さようなら.", id: "Saat berpisah, ucapkan さようなら." }, conceptKey: "ja:jlpt:n5:vocab:greeting-leave" },
    { prompt: "何かをお願いして、感謝するとき、何と言いますか。", choices: ["ありがとう", "いいえ", "こんばんは", "はじめまして"], explanations: { en: "ありがとう expresses gratitude.", id: "ありがとう menyatakan rasa terima kasih." }, conceptKey: "ja:jlpt:n5:vocab:greeting-thanks" },
    { prompt: "初めて会ったとき、何と言いますか。", choices: ["はじめまして", "さようなら", "おやすみなさい", "いいえ"], explanations: { en: "はじめまして is used when meeting someone for the first time.", id: "はじめまして dipakai saat berjumpa pertama kali." }, conceptKey: "ja:jlpt:n5:vocab:greeting-first" },
    { prompt: "人に話しかけるとき、何と言いますか。", choices: ["すみません", "ありがとう", "はい", "こんばんは"], explanations: { en: "すみません gets someone's attention politely.", id: "すみません dipakai untuk memanggil orang dengan sopan." }, conceptKey: "ja:jlpt:n5:vocab:greeting-attention" },
  ],
  sentences: [
    { id: "s1", text: "おはようございます。", en: "Good morning.", tokens: ["おはよう", "ございます", "。"], blank: { prompt: "おはよう ___。", answer: "ございます", choices: ["ございます", "です", "ます", "ください"], explanations: { en: "The polite form is おはようございます.", id: "Bentuk sopannya adalah おはようございます." } } },
    { id: "s2", text: "こんにちは、田中です。", en: "Hello, I am Tanaka.", tokens: ["こんにちは", "、", "田中", "です", "。"], blank: { prompt: "こんにちは、田中 ___。", answer: "です", choices: ["です", "ます", "を", "に"], explanations: { en: "です links a name and a polite statement.", id: "です menghubungkan nama dengan pernyataan sopan." } } },
    { id: "s3", text: "ありがとうございます。", en: "Thank you very much.", tokens: ["ありがとう", "ございます", "。"], blank: { prompt: "ありがとう ___。", answer: "ございます", choices: ["ございます", "です", "ます", "ですか"], explanations: { en: "ありがとうございます is the polite thank-you.", id: "ありがとうございます adalah ucapan terima kasih sopan." } } },
    { id: "s4", text: "さようなら、またあした。", en: "Goodbye, see you tomorrow.", tokens: ["さようなら", "、", "また", "あした", "。"], blank: { prompt: "さようなら、また ___。", answer: "あした", choices: ["あした", "きょう", "きのう", "いま"], explanations: { en: "またあした means 'see you tomorrow'.", id: "またあした berarti 'sampai jumpa besok'." } } },
    { id: "s5", text: "はじめまして、田中です。", en: "Nice to meet you, I am Tanaka.", tokens: ["はじめまして", "、", "田中", "です", "。"], blank: { prompt: "はじめまして、田中 ___。", answer: "です", choices: ["です", "ます", "から", "まで"], explanations: { en: "です closes a polite self-introduction.", id: "です menutup perkenalan diri yang sopan." } } },
  ],
  grammar: [
    { prompt: "わたしは 学生 ___。", choices: ["です", "ます", "を", "に"], explanations: { en: "です is the polite copula after a noun.", id: "です adalah kopula sopan setelah kata benda." }, conceptKey: "ja:jlpt:n5:grammar:desu" },
    { prompt: "おはよう ___。", choices: ["ございます", "です", "ます", "か"], explanations: { en: "おはようございます is a fixed polite greeting.", id: "おはようございます adalah sapaan sopan yang tetap." }, conceptKey: "ja:jlpt:n5:grammar:ohayou" },
    { prompt: "「さようなら」は 別れる ときの ___ です。", choices: ["あいさつ", "なまえ", "すうじ", "かぞく"], explanations: { en: "さようなら is a greeting used when parting.", id: "さようなら adalah sapaan saat berpisah." }, conceptKey: "ja:jlpt:n5:grammar:aisatsu" },
    { prompt: "「ありがとう」は ___ を 表します。", choices: ["感謝", "名前", "数字", "家族"], explanations: { en: "ありがとう expresses gratitude.", id: "ありがとう menyatakan rasa syukur." }, conceptKey: "ja:jlpt:n5:grammar:kansha" },
    { prompt: "「すみません」は 人に ___ とき 使います。", choices: ["話しかける", "食べる", "寝る", "買う"], explanations: { en: "すみません is used when addressing someone.", id: "すみません dipakai saat menyapa orang." }, conceptKey: "ja:jlpt:n5:grammar:sumimasen" },
  ],
};

const jaNames = {
  id: "ja-jlpt-n5-u01-l02",
  slug: "names",
  title: "なまえと じこしょうかい",
  titleEn: "Names and self-introduction",
  titleId: "Nama dan perkenalan diri",
  objective: "Memperkenalkan nama, pekerjaan, dan asal.",
  objectiveEn: "Introduce your name, occupation, and origin.",
  objectiveId: "Memperkenalkan nama, pekerjaan, dan asal.",
  skill: "grammar",
  explanationEn: "Use わたしは … です for 'I am …', and 〜から来ました for 'I came from …'.",
  explanationId: "Gunakan わたしは … です untuk 'saya adalah …', dan 〜から来ました untuk 'saya datang dari …'.",
  tipEn: "The particle は is read わ when it marks the topic.",
  tipId: "Partikel は dibaca わ ketika menandai topik.",
  words: [
    { term: "わたし", reading: "わたし", meaning: "I / me", meaningId: "saya" },
    { term: "あなた", reading: "あなた", meaning: "you", meaningId: "kamu" },
    { term: "なまえ", reading: "なまえ", meaning: "name", meaningId: "nama" },
    { term: "学生", reading: "がくせい", meaning: "student", meaningId: "pelajar" },
    { term: "先生", reading: "せんせい", meaning: "teacher", meaningId: "guru" },
    { term: "友達", reading: "ともだち", meaning: "friend", meaningId: "teman" },
    { term: "人", reading: "ひと", meaning: "person", meaningId: "orang" },
    { term: "会社員", reading: "かいしゃいん", meaning: "office worker", meaningId: "karyawan" },
    { term: "日本人", reading: "にほんじん", meaning: "Japanese person", meaningId: "orang Jepang" },
    { term: "インドネシア人", reading: "インドネシアじん", meaning: "Indonesian person", meaningId: "orang Indonesia" },
  ],
  extras: [
    { prompt: "「学生」の よみかたは どれですか。", choices: ["がくせい", "がくしょう", "まなぶ", "せいと"], explanations: { en: "学生 is read がくせい.", id: "学生 dibaca がくせい." }, conceptKey: "ja:jlpt:n5:kanji:gakusei", skill: "kanji" },
    { prompt: "「先生」の よみかたは どれですか。", choices: ["せんせい", "せんしょう", "さき", "きょうし"], explanations: { en: "先生 is read せんせい.", id: "先生 dibaca せんせい." }, conceptKey: "ja:jlpt:n5:kanji:sensei", skill: "kanji" },
    { prompt: "「友達」の よみかたは どれですか。", choices: ["ともだち", "ゆうだち", "ともたち", "ゆうじん"], explanations: { en: "友達 is read ともだち.", id: "友達 dibaca ともだち." }, conceptKey: "ja:jlpt:n5:kanji:tomodachi", skill: "kanji" },
    { prompt: "「会社員」の よみかたは どれですか。", choices: ["かいしゃいん", "かいしゃにん", "がいしゃいん", "かいしゃい"], explanations: { en: "会社員 is read かいしゃいん.", id: "会社員 dibaca かいしゃいん." }, conceptKey: "ja:jlpt:n5:kanji:kaishain", skill: "kanji" },
    { prompt: "「日本人」の よみかたは どれですか。", choices: ["にほんじん", "にっぽんじん", "にほんひと", "じんほん"], explanations: { en: "日本人 is read にほんじん.", id: "日本人 dibaca にほんじん." }, conceptKey: "ja:jlpt:n5:kanji:nihonjin", skill: "kanji" },
  ],
  sentences: [
    { id: "s1", text: "わたしは 田中です。", en: "I am Tanaka.", tokens: ["わたし", "は", "田中", "です", "。"], blank: { prompt: "わたし ___ 田中です。", answer: "は", choices: ["は", "を", "に", "で"], explanations: { en: "は marks わたし as the topic.", id: "は menandai わたし sebagai topik." } } },
    { id: "s2", text: "あなたは 学生ですか。", en: "Are you a student?", tokens: ["あなた", "は", "学生", "です", "か", "。"], blank: { prompt: "あなたは 学生 ___。", answer: "ですか", choices: ["ですか", "です", "ます", "だ"], explanations: { en: "ですか forms a polite question.", id: "ですか membentuk pertanyaan sopan." } } },
    { id: "s3", text: "田中さんは 先生です。", en: "Tanaka-san is a teacher.", tokens: ["田中", "さん", "は", "先生", "です", "。"], blank: { prompt: "田中さんは 先生 ___。", answer: "です", choices: ["です", "ます", "だ", "な"], explanations: { en: "です is the polite copula.", id: "です adalah kopula sopan." } } },
    { id: "s4", text: "わたしは インドネシアから 来ました。", en: "I came from Indonesia.", tokens: ["わたし", "は", "インドネシア", "から", "来ました", "。"], blank: { prompt: "わたしは インドネシア ___ 来ました。", answer: "から", choices: ["から", "まで", "より", "ほど"], explanations: { en: "から marks the origin of 来ました.", id: "から menandai asal dari 来ました." } } },
    { id: "s5", text: "どうぞ よろしく。", en: "Nice to meet you / please treat me well.", tokens: ["どうぞ", "よろしく", "。"], blank: { prompt: "どうぞ ___。", answer: "よろしく", choices: ["よろしく", "ありがとう", "さようなら", "すみません"], explanations: { en: "どうぞよろしく is a set phrase after an introduction.", id: "どうぞよろしく adalah frasa tetap setelah perkenalan." } } },
  ],
  grammar: [
    { prompt: "わたし ___ 田中です。", choices: ["は", "を", "に", "で"], explanations: { en: "は marks the topic of the sentence.", id: "は menandai topik kalimat." }, conceptKey: "ja:jlpt:n5:grammar:wa-topic" },
    { prompt: "あなた ___ 学生ですか。", choices: ["は", "が", "を", "も"], explanations: { en: "は marks あなた as the topic of the question.", id: "は menandai あなた sebagai topik pertanyaan." }, conceptKey: "ja:jlpt:n5:grammar:wa-question" },
    { prompt: "田中さんは 先生 ___。", choices: ["です", "ます", "だ", "な"], explanations: { en: "です is the polite form after a noun.", id: "です adalah bentuk sopan setelah kata benda." }, conceptKey: "ja:jlpt:n5:grammar:desu-noun" },
    { prompt: "わたしは インドネシア ___ 来ました。", choices: ["から", "まで", "より", "ほど"], explanations: { en: "から marks where you came from.", id: "から menandai tempat asal." }, conceptKey: "ja:jlpt:n5:grammar:kara-origin" },
    { prompt: "お名前 ___ 何ですか。", choices: ["は", "を", "が", "に"], explanations: { en: "は marks お名前 as the topic.", id: "は menandai お名前 sebagai topik." }, conceptKey: "ja:jlpt:n5:grammar:onamae" },
  ],
};

const jaNumbers = {
  id: "ja-jlpt-n5-u01-l03",
  slug: "numbers",
  title: "すうじと じかん",
  titleEn: "Numbers and time",
  titleId: "Angka dan waktu",
  objective: "Menyebut angka 1–10 dan memahami angka dalam konteks.",
  objectiveEn: "Say numbers 1–10 and understand them in context.",
  objectiveId: "Menyebut angka 1–10 dan memahaminya dalam konteks.",
  skill: "vocabulary",
  explanationEn: "Japanese numbers have several readings. Learn いち、に、さん… first, then notice counters later.",
  explanationId: "Angka Jepang punya beberapa cara baca. Pelajari いち、に、さん… dulu, lalu perhatikan counter nanti.",
  tipEn: "When counting objects, the counter changes the reading (みっつ, にだい).",
  tipId: "Saat menghitung benda, counter mengubah cara baca (みっつ, にだい).",
  words: [
    { term: "いち", reading: "いち", meaning: "one", meaningId: "satu" },
    { term: "に", reading: "に", meaning: "two", meaningId: "dua" },
    { term: "さん", reading: "さん", meaning: "three", meaningId: "tiga" },
    { term: "よん", reading: "よん", meaning: "four", meaningId: "empat" },
    { term: "ご", reading: "ご", meaning: "five", meaningId: "lima" },
    { term: "ろく", reading: "ろく", meaning: "six", meaningId: "enam" },
    { term: "なな", reading: "なな", meaning: "seven", meaningId: "tujuh" },
    { term: "はち", reading: "はち", meaning: "eight", meaningId: "delapan" },
    { term: "きゅう", reading: "きゅう", meaning: "nine", meaningId: "sembilan" },
    { term: "じゅう", reading: "じゅう", meaning: "ten", meaningId: "sepuluh" },
  ],
  extras: [
    { prompt: "さん + に は 何ですか。", choices: ["ご", "よん", "ろく", "しち"], explanations: { en: "3 + 2 = 5 (ご).", id: "3 + 2 = 5 (ご)." }, conceptKey: "ja:jlpt:n5:number:add-3-2", skill: "reading" },
    { prompt: "じゅう − よん は 何ですか。", choices: ["ろく", "ご", "なな", "はち"], explanations: { en: "10 − 4 = 6 (ろく).", id: "10 − 4 = 6 (ろく)." }, conceptKey: "ja:jlpt:n5:number:sub-10-4", skill: "reading" },
    { prompt: "いち + はち は 何ですか。", choices: ["きゅう", "じゅう", "なな", "ろく"], explanations: { en: "1 + 8 = 9 (きゅう).", id: "1 + 8 = 9 (きゅう)." }, conceptKey: "ja:jlpt:n5:number:add-1-8", skill: "reading" },
    { prompt: "ご + ご は 何ですか。", choices: ["じゅう", "きゅう", "はち", "なな"], explanations: { en: "5 + 5 = 10 (じゅう).", id: "5 + 5 = 10 (じゅう)." }, conceptKey: "ja:jlpt:n5:number:add-5-5", skill: "reading" },
    { prompt: "に + ろく は 何ですか。", choices: ["はち", "なな", "きゅう", "じゅう"], explanations: { en: "2 + 6 = 8 (はち).", id: "2 + 6 = 8 (はち)." }, conceptKey: "ja:jlpt:n5:number:add-2-6", skill: "reading" },
  ],
  sentences: [
    { id: "s1", text: "りんごが みっつ あります。", en: "There are three apples.", tokens: ["りんご", "が", "みっつ", "あります", "。"], blank: { prompt: "りんごが ___ あります。", answer: "みっつ", choices: ["みっつ", "ふたつ", "よっつ", "いつつ"], explanations: { en: "みっつ is the native counter for three things.", id: "みっつ adalah counter asli untuk tiga benda." } } },
    { id: "s2", text: "わたしは じゅうはち さいです。", en: "I am eighteen years old.", tokens: ["わたし", "は", "じゅうはち", "さい", "です", "。"], blank: { prompt: "わたしは ___ さいです。", answer: "じゅうはち", choices: ["じゅうはち", "じゅうろく", "じゅうなな", "じゅうきゅう"], explanations: { en: "じゅうはち is 18.", id: "じゅうはち adalah 18." } } },
    { id: "s3", text: "いま くじ です。", en: "It is nine o'clock now.", tokens: ["いま", "くじ", "です", "。"], blank: { prompt: "いま ___ です。", answer: "くじ", choices: ["くじ", "はちじ", "じゅうじ", "ろくじ"], explanations: { en: "くじ is nine o'clock.", id: "くじ adalah jam sembilan." } } },
    { id: "s4", text: "じてんしゃが にだい あります。", en: "There are two bicycles.", tokens: ["じてんしゃ", "が", "にだい", "あります", "。"], blank: { prompt: "じてんしゃが ___ あります。", answer: "にだい", choices: ["にだい", "さんだい", "いちだい", "よんだい"], explanations: { en: "にだい counts two machines or vehicles.", id: "にだい menghitung dua mesin atau kendaraan." } } },
    { id: "s5", text: "きょうは はつか です。", en: "Today is the twentieth.", tokens: ["きょう", "は", "はつか", "です", "。"], blank: { prompt: "きょうは ___ です。", answer: "はつか", choices: ["はつか", "ふつか", "みっか", "よっか"], explanations: { en: "はつか is the 20th day of the month.", id: "はつか adalah tanggal 20." } } },
  ],
  grammar: [
    { prompt: "「1」は 日本語で ___ です。", choices: ["いち", "に", "さん", "よん"], explanations: { en: "1 is いち.", id: "1 adalah いち." }, conceptKey: "ja:jlpt:n5:number:1" },
    { prompt: "「10」は ___ です。", choices: ["じゅう", "きゅう", "はち", "なな"], explanations: { en: "10 is じゅう.", id: "10 adalah じゅう." }, conceptKey: "ja:jlpt:n5:number:10" },
    { prompt: "「5」は ___ です。", choices: ["ご", "ろく", "よん", "さん"], explanations: { en: "5 is ご.", id: "5 adalah ご." }, conceptKey: "ja:jlpt:n5:number:5" },
    { prompt: "「8」は ___ です。", choices: ["はち", "なな", "きゅう", "ろく"], explanations: { en: "8 is はち.", id: "8 adalah はち." }, conceptKey: "ja:jlpt:n5:number:8" },
    { prompt: "「3」は ___ です。", choices: ["さん", "に", "いち", "よん"], explanations: { en: "3 is さん.", id: "3 adalah さん." }, conceptKey: "ja:jlpt:n5:number:3" },
  ],
};

const jaFamily = {
  id: "ja-jlpt-n5-u01-l04",
  slug: "family",
  title: "かぞく",
  titleEn: "Family",
  titleId: "Keluarga",
  objective: "Menyebut anggota keluarga dan menyatakan kepemilikan.",
  objectiveEn: "Name family members and express possession.",
  objectiveId: "Menyebut anggota keluarga dan menyatakan kepemilikan.",
  skill: "vocabulary",
  explanationEn: "Use の to link two nouns: わたしの家族 = my family. Use がいます for people/animals.",
  explanationId: "Gunakan の untuk menghubungkan dua kata benda: わたしの家族 = keluarga saya. Gunakan がいます untuk orang/hewan.",
  tipEn: "For your own family in formal speech, use 母/父; for someone else's, use お母さん/お父さん.",
  tipId: "Untuk keluarga sendiri dalam bahasa sopan, gunakan 母/父; untuk keluarga orang lain, gunakan お母さん/お父さん.",
  words: [
    { term: "家族", reading: "かぞく", meaning: "family", meaningId: "keluarga" },
    { term: "お母さん", reading: "おかあさん", meaning: "mother", meaningId: "ibu" },
    { term: "お父さん", reading: "おとうさん", meaning: "father", meaningId: "ayah" },
    { term: "姉", reading: "あね", meaning: "older sister", meaningId: "kakak perempuan" },
    { term: "兄", reading: "あに", meaning: "older brother", meaningId: "kakak laki-laki" },
    { term: "妹", reading: "いもうと", meaning: "younger sister", meaningId: "adik perempuan" },
    { term: "弟", reading: "おとうと", meaning: "younger brother", meaningId: "adik laki-laki" },
    { term: "子供", reading: "こども", meaning: "child", meaningId: "anak" },
    { term: "祖父", reading: "そふ", meaning: "grandfather", meaningId: "kakek" },
    { term: "祖母", reading: "そぼ", meaning: "grandmother", meaningId: "nenek" },
  ],
  extras: [
    { prompt: "「母」の よみかたは どれですか。", choices: ["はは", "ぼ", "まま", "おかあ"], explanations: { en: "母 is read はは.", id: "母 dibaca はは." }, conceptKey: "ja:jlpt:n5:kanji:haha", skill: "kanji" },
    { prompt: "「父」の よみかたは どれですか。", choices: ["ちち", "とと", "ぱぱ", "おとう"], explanations: { en: "父 is read ちち.", id: "父 dibaca ちち." }, conceptKey: "ja:jlpt:n5:kanji:chichi", skill: "kanji" },
    { prompt: "「子供」の よみかたは どれですか。", choices: ["こども", "しども", "こどもん", "こどもたち"], explanations: { en: "子供 is read こども.", id: "子供 dibaca こども." }, conceptKey: "ja:jlpt:n5:kanji:kodomo", skill: "kanji" },
    { prompt: "「兄弟」の よみかたは どれですか。", choices: ["きょうだい", "けいだい", "あにいもうと", "きょうてい"], explanations: { en: "兄弟 is read きょうだい.", id: "兄弟 dibaca きょうだい." }, conceptKey: "ja:jlpt:n5:kanji:kyoudai", skill: "kanji" },
    { prompt: "「家族」の よみかたは どれですか。", choices: ["かぞく", "いえぞく", "けぞく", "かぞくん"], explanations: { en: "家族 is read かぞく.", id: "家族 dibaca かぞく." }, conceptKey: "ja:jlpt:n5:kanji:kazoku", skill: "kanji" },
  ],
  sentences: [
    { id: "s1", text: "これは わたしの 家族です。", en: "This is my family.", tokens: ["これ", "は", "わたし", "の", "家族", "です", "。"], blank: { prompt: "これは わたし ___ 家族です。", answer: "の", choices: ["の", "は", "を", "に"], explanations: { en: "の links わたし and 家族.", id: "の menghubungkan わたし dan 家族." } } },
    { id: "s2", text: "母は 先生です。", en: "My mother is a teacher.", tokens: ["母", "は", "先生", "です", "。"], blank: { prompt: "母は 先生 ___。", answer: "です", choices: ["です", "ます", "だ", "な"], explanations: { en: "です is the polite copula.", id: "です adalah kopula sopan." } } },
    { id: "s3", text: "父と 母が います。", en: "I have a father and a mother.", tokens: ["父", "と", "母", "が", "います", "。"], blank: { prompt: "父 ___ 母が います。", answer: "と", choices: ["と", "や", "か", "も"], explanations: { en: "と joins two nouns completely.", id: "と menggabungkan dua kata benda secara lengkap." } } },
    { id: "s4", text: "わたしには 妹が います。", en: "I have a younger sister.", tokens: ["わたし", "に", "は", "妹", "が", "います", "。"], blank: { prompt: "わたしには 妹 ___ います。", answer: "が", choices: ["が", "を", "は", "に"], explanations: { en: "が marks the person who exists (います).", id: "が menandai orang yang ada (います)." } } },
    { id: "s5", text: "家族は 四人です。", en: "There are four people in my family.", tokens: ["家族", "は", "四人", "です", "。"], blank: { prompt: "家族は 四人 ___。", answer: "です", choices: ["です", "あります", "います", "ます"], explanations: { en: "です is used with a number of people here.", id: "です dipakai dengan jumlah orang di sini." } } },
  ],
  grammar: [
    { prompt: "これは わたし ___ 家族です。", choices: ["の", "は", "を", "に"], explanations: { en: "の shows possession.", id: "の menunjukkan kepemilikan." }, conceptKey: "ja:jlpt:n5:grammar:no-possession" },
    { prompt: "母は 先生 ___。", choices: ["です", "ます", "だ", "な"], explanations: { en: "です is the polite copula.", id: "です adalah kopula sopan." }, conceptKey: "ja:jlpt:n5:grammar:desu-family" },
    { prompt: "父 ___ 母が います。", choices: ["と", "や", "か", "も"], explanations: { en: "と joins both parents.", id: "と menggabungkan kedua orang tua." }, conceptKey: "ja:jlpt:n5:grammar:to-and" },
    { prompt: "わたしには 妹 ___ います。", choices: ["が", "を", "は", "に"], explanations: { en: "が marks the subject of います.", id: "が menandai subjek dari います." }, conceptKey: "ja:jlpt:n5:grammar:ga-imasu" },
    { prompt: "家族は 四人 ___。", choices: ["です", "あります", "います", "ます"], explanations: { en: "です completes the polite statement.", id: "です melengkapi pernyataan sopan." }, conceptKey: "ja:jlpt:n5:grammar:yonin-desu" },
  ],
};

const jaParticles = {
  id: "ja-jlpt-n5-u01-l05",
  slug: "particles",
  title: "じょしと しつもん",
  titleEn: "Particles and questions",
  titleId: "Partikel dan pertanyaan",
  objective: "Menggunakan partikel dasar dan membentuk pertanyaan dengan か.",
  objectiveEn: "Use basic particles and form questions with か.",
  objectiveId: "Menggunakan partikel dasar dan membentuk pertanyaan dengan か.",
  skill: "grammar",
  explanationEn: "Particles mark grammatical roles: は topic, を object, に destination/time, で place/means, から origin.",
  explanationId: "Partikel menandai peran gramatikal: は topik, を objek, に tujuan/waktu, で tempat/alat, から asal.",
  tipEn: "Add か at the end of a polite sentence to make a question; do not add a question mark in formal writing.",
  tipId: "Tambahkan か di akhir kalimat sopan untuk membentuk pertanyaan; tanda tanya tidak wajib dalam tulisan formal.",
  words: [
    { term: "は", reading: "は", meaning: "topic marker", meaningId: "penanda topik" },
    { term: "が", reading: "が", meaning: "subject marker", meaningId: "penanda subjek" },
    { term: "を", reading: "を", meaning: "object marker", meaningId: "penanda objek" },
    { term: "に", reading: "に", meaning: "target / time marker", meaningId: "penanda tujuan/waktu" },
    { term: "で", reading: "で", meaning: "place / means marker", meaningId: "penanda tempat/alat" },
    { term: "も", reading: "も", meaning: "also / too", meaningId: "juga" },
    { term: "の", reading: "の", meaning: "possession marker", meaningId: "penanda kepemilikan" },
    { term: "か", reading: "か", meaning: "question particle", meaningId: "partikel tanya" },
    { term: "から", reading: "から", meaning: "from", meaningId: "dari" },
    { term: "まで", reading: "まで", meaning: "until / to", meaningId: "sampai" },
  ],
  extras: [
    { prompt: "わたし ___ 学生です。", choices: ["は", "を", "に", "で"], explanations: { en: "は marks the topic.", id: "は menandai topik." }, conceptKey: "ja:jlpt:n5:particle:wa" },
    { prompt: "水 ___ 飲みます。", choices: ["を", "は", "が", "に"], explanations: { en: "を marks the direct object 水.", id: "を menandai objek langsung 水." }, conceptKey: "ja:jlpt:n5:particle:wo" },
    { prompt: "学校 ___ 行きます。", choices: ["に", "を", "で", "も"], explanations: { en: "に marks the destination of 行きます.", id: "に menandai tujuan 行きます." }, conceptKey: "ja:jlpt:n5:particle:ni" },
    { prompt: "日本 ___ 来ました。", choices: ["から", "まで", "を", "に"], explanations: { en: "から marks the origin.", id: "から menandai asal." }, conceptKey: "ja:jlpt:n5:particle:kara" },
    { prompt: "わたし ___ 学生です。(also)", choices: ["も", "は", "が", "を"], explanations: { en: "も means 'also'.", id: "も berarti 'juga'." }, conceptKey: "ja:jlpt:n5:particle:mo" },
  ],
  sentences: [
    { id: "s1", text: "わたしは 学生です。", en: "I am a student.", tokens: ["わたし", "は", "学生", "です", "。"], blank: { prompt: "わたし ___ 学生です。", answer: "は", choices: ["は", "を", "に", "で"], explanations: { en: "は marks わたし as the topic.", id: "は menandai わたし sebagai topik." } } },
    { id: "s2", text: "水を 飲みます。", en: "I drink water.", tokens: ["水", "を", "飲みます", "。"], blank: { prompt: "水 ___ 飲みます。", answer: "を", choices: ["を", "は", "が", "に"], explanations: { en: "を marks the object of 飲みます.", id: "を menandai objek dari 飲みます." } } },
    { id: "s3", text: "学校に 行きます。", en: "I go to school.", tokens: ["学校", "に", "行きます", "。"], blank: { prompt: "学校 ___ 行きます。", answer: "に", choices: ["に", "を", "で", "も"], explanations: { en: "に marks the destination.", id: "に menandai tujuan." } } },
    { id: "s4", text: "日本から 来ました。", en: "I came from Japan.", tokens: ["日本", "から", "来ました", "。"], blank: { prompt: "日本 ___ 来ました。", answer: "から", choices: ["から", "まで", "を", "に"], explanations: { en: "から marks the origin.", id: "から menandai asal." } } },
    { id: "s5", text: "これは わたしの 本です。", en: "This is my book.", tokens: ["これ", "は", "わたし", "の", "本", "です", "。"], blank: { prompt: "これは わたし ___ 本です。", answer: "の", choices: ["の", "は", "を", "が"], explanations: { en: "の shows possession.", id: "の menunjukkan kepemilikan." } } },
  ],
  grammar: [
    { prompt: "これは 何 ___。", choices: ["ですか", "です", "ます", "かです"], explanations: { en: "ですか forms a polite question.", id: "ですか membentuk pertanyaan sopan." }, conceptKey: "ja:jlpt:n5:grammar:nan-desu-ka" },
    { prompt: "あなたは 学生 ___。", choices: ["ですか", "です", "ます", "だ"], explanations: { en: "ですか makes a polite yes/no question.", id: "ですか membuat pertanyaan ya/tidak yang sopan." }, conceptKey: "ja:jlpt:n5:grammar:gakusei-desu-ka" },
    { prompt: "どこ ___ 来ましたか。", choices: ["から", "まで", "に", "を"], explanations: { en: "から marks the origin in どこから.", id: "から menandai asal pada どこから." }, conceptKey: "ja:jlpt:n5:grammar:doko-kara" },
    { prompt: "これは わたし ___ 本です。", choices: ["の", "は", "を", "が"], explanations: { en: "の links わたし and 本.", id: "の menghubungkan わたし dan 本." }, conceptKey: "ja:jlpt:n5:grammar:no-hon" },
    { prompt: "コーヒー ___ 水も あります。", choices: ["と", "や", "か", "の"], explanations: { en: "と lists both items completely.", id: "と mendaftar kedua benda secara lengkap." }, conceptKey: "ja:jlpt:n5:grammar:to-list" },
  ],
};

const jaUnit = {
  language: "ja",
  framework: "JLPT",
  level: "N5",
  unit: {
    id: "ja-jlpt-n5-u01",
    position: 1,
    title: "はじめまして",
    goal: "Menyapa, memperkenalkan diri, menyebut angka, dan menyebut anggota keluarga.",
    checkpointQuestionCount: 20,
  },
  lessons: [jaGreetings, jaNames, jaNumbers, jaFamily, jaParticles],
};

// ───────────────────────── English A1, Unit 1 ─────────────────────────

const enGreetings = {
  id: "en-cefr-a1-u01-l01",
  slug: "greetings",
  title: "Greetings and politeness",
  titleEn: "Greetings and politeness",
  titleId: "Sapaan dan kesopanan",
  objective: "Greet people and use polite words in everyday situations.",
  objectiveEn: "Greet people and use polite words in everyday situations.",
  objectiveId: "Menyapa orang dan menggunakan kata sopan dalam situasi sehari-hari.",
  skill: "vocabulary",
  explanationEn: "Use “Good morning” before noon, “Good afternoon” in the day, and “Good evening” after sunset.",
  explanationId: "Gunakan “Good morning” sebelum tengah hari, “Good afternoon” pada siang, dan “Good evening” setelah matahari terbenam.",
  tipEn: "“Please” and “thank you” make requests sound natural and polite.",
  tipId: "“Please” dan “thank you” membuat permintaan terdengar natural dan sopan.",
  words: [
    { term: "hello", meaning: "a greeting when you meet someone", meaningId: "halo" },
    { term: "good morning", meaning: "a greeting before noon", meaningId: "selamat pagi" },
    { term: "good evening", meaning: "a greeting after sunset", meaningId: "selamat malam" },
    { term: "goodbye", meaning: "a word said when leaving", meaningId: "selamat tinggal" },
    { term: "please", meaning: "a polite word when asking", meaningId: "tolong" },
    { term: "thank you", meaning: "words to show gratitude", meaningId: "terima kasih" },
    { term: "sorry", meaning: "a word to apologize", meaningId: "maaf" },
    { term: "yes", meaning: "a positive answer", meaningId: "ya" },
    { term: "no", meaning: "a negative answer", meaningId: "tidak" },
    { term: "excuse me", meaning: "polite words to get attention", meaningId: "permisi" },
  ],
  extras: [
    { prompt: "You meet someone at 9 a.m. What do you say?", choices: ["Good morning", "Good evening", "Good night", "Goodbye"], explanations: { en: "9 a.m. is morning, so say “Good morning”.", id: "Pukul 9 pagi adalah pagi, jadi ucapkan “Good morning”." }, conceptKey: "en:cefr:a1:vocab:morning" },
    { prompt: "Someone helps you. What do you say?", choices: ["Thank you", "Sorry", "Hello", "Please"], explanations: { en: "“Thank you” shows gratitude.", id: "“Thank you” menunjukkan rasa terima kasih." }, conceptKey: "en:cefr:a1:vocab:thanks" },
    { prompt: "You want someone's attention. What do you say?", choices: ["Excuse me", "Goodbye", "No", "Please"], explanations: { en: "“Excuse me” politely gets attention.", id: "“Excuse me” meminta perhatian dengan sopan." }, conceptKey: "en:cefr:a1:vocab:attention" },
    { prompt: "You leave a room. What do you say?", choices: ["Goodbye", "Hello", "Good morning", "Sorry"], explanations: { en: "“Goodbye” is said when leaving.", id: "“Goodbye” diucapkan saat pergi." }, conceptKey: "en:cefr:a1:vocab:leaving" },
    { prompt: "You make a mistake. What do you say?", choices: ["Sorry", "Thank you", "Yes", "Please"], explanations: { en: "“Sorry” is used to apologize.", id: "“Sorry” dipakai untuk meminta maaf." }, conceptKey: "en:cefr:a1:vocab:apology" },
  ],
  sentences: [
    { id: "s1", text: "Good morning, class!", paraphrase: "You greet the class in the morning.", blank: { prompt: "___ morning, class!", answer: "Good", choices: ["Good", "Nice", "Please", "Thank"], explanations: { en: "“Good morning” is the fixed morning greeting.", id: "“Good morning” adalah sapaan pagi yang tetap." } } },
    { id: "s2", text: "Thank you, teacher.", paraphrase: "You thank the teacher.", blank: { prompt: "Thank ___, teacher.", answer: "you", choices: ["you", "your", "yours", "yourself"], explanations: { en: "The fixed phrase is “Thank you”.", id: "Frasa tetapnya adalah “Thank you”." } } },
    { id: "s3", text: "Excuse me, can I ask a question?", paraphrase: "You politely ask for attention.", blank: { prompt: "___ me, can I ask a question?", answer: "Excuse", choices: ["Excuse", "Sorry", "Please", "Thank"], explanations: { en: "“Excuse me” gets attention politely.", id: "“Excuse me” meminta perhatian dengan sopan." } } },
    { id: "s4", text: "Goodbye, see you tomorrow.", paraphrase: "You say goodbye and will meet again tomorrow.", blank: { prompt: "___ , see you tomorrow.", answer: "Goodbye", choices: ["Goodbye", "Hello", "Please", "Sorry"], explanations: { en: "“Goodbye” is used when leaving.", id: "“Goodbye” dipakai saat pergi." } } },
    { id: "s5", text: "Hello, my name is Ana.", paraphrase: "You greet someone and introduce yourself.", blank: { prompt: "___ , my name is Ana.", answer: "Hello", choices: ["Hello", "Goodbye", "Sorry", "No"], explanations: { en: "“Hello” is a general greeting.", id: "“Hello” adalah sapaan umum." } } },
  ],
  grammar: [
    { prompt: "___ morning!", choices: ["Good", "Hello", "Please", "Sorry"], explanations: { en: "“Good morning” is the correct collocation.", id: "“Good morning” adalah kolokasi yang benar." }, conceptKey: "en:cefr:a1:grammar:good-morning" },
    { prompt: "___ evening!", choices: ["Good", "Nice", "Thank", "Please"], explanations: { en: "“Good evening” is the evening greeting.", id: "“Good evening” adalah sapaan malam." }, conceptKey: "en:cefr:a1:grammar:good-evening" },
    { prompt: "Thank ___.", choices: ["you", "your", "yes", "please"], explanations: { en: "The fixed phrase is “Thank you”.", id: "Frasa tetapnya “Thank you”." }, conceptKey: "en:cefr:a1:grammar:thank-you" },
    { prompt: "Excuse ___.", choices: ["me", "I", "my", "you"], explanations: { en: "The fixed phrase is “Excuse me”.", id: "Frasa tetapnya “Excuse me”." }, conceptKey: "en:cefr:a1:grammar:excuse-me" },
    { prompt: "Good ___! (said when leaving late)", choices: ["night", "hello", "please", "thanks"], explanations: { en: "“Good night” is said when leaving at night.", id: "“Good night” diucapkan saat pergi pada malam hari." }, conceptKey: "en:cefr:a1:grammar:good-night" },
  ],
};

const enNames = {
  id: "en-cefr-a1-u01-l02",
  slug: "names-and-countries",
  title: "Names, countries, and nationalities",
  titleEn: "Names, countries, and nationalities",
  titleId: "Nama, negara, dan kewarganegaraan",
  objective: "Introduce your name, country, and nationality with am/is/are.",
  objectiveEn: "Introduce your name, country, and nationality with am/is/are.",
  objectiveId: "Memperkenalkan nama, negara, dan kewarganegaraan dengan am/is/are.",
  skill: "grammar",
  explanationEn: "Use am with I, is with he/she/it, and are with you/we/they.",
  explanationId: "Gunakan am dengan I, is dengan he/she/it, dan are dengan you/we/they.",
  tipEn: "“I am from Indonesia” uses from for origin; “I live in Jakarta” uses in for place.",
  tipId: "“I am from Indonesia” memakai from untuk asal; “I live in Jakarta” memakai in untuk tempat.",
  words: [
    { term: "name", meaning: "the word people call you", meaningId: "nama" },
    { term: "country", meaning: "a nation such as Indonesia", meaningId: "negara" },
    { term: "nationality", meaning: "the country you belong to", meaningId: "kewarganegaraan" },
    { term: "student", meaning: "a person who studies", meaningId: "pelajar" },
    { term: "teacher", meaning: "a person who teaches", meaningId: "guru" },
    { term: "friend", meaning: "a person you like and know", meaningId: "teman" },
    { term: "from", meaning: "showing origin", meaningId: "dari" },
    { term: "live", meaning: "to have a home in a place", meaningId: "tinggal" },
    { term: "city", meaning: "a large town", meaningId: "kota" },
    { term: "language", meaning: "a system of words people speak", meaningId: "bahasa" },
  ],
  extras: [
    { prompt: "Where are you ___?", choices: ["from", "in", "at", "of"], explanations: { en: "“Where are you from?” asks about origin.", id: "“Where are you from?” menanyakan asal." }, conceptKey: "en:cefr:a1:vocab:where-from" },
    { prompt: "I ___ from Indonesia.", choices: ["am", "is", "are", "be"], explanations: { en: "Use am with I.", id: "Gunakan am dengan I." }, conceptKey: "en:cefr:a1:grammar:am-from" },
    { prompt: "She is ___ Japan.", choices: ["from", "of", "at", "to"], explanations: { en: "from marks origin.", id: "from menandai asal." }, conceptKey: "en:cefr:a1:grammar:from-japan" },
    { prompt: "My ___ is Budi.", choices: ["name", "named", "country", "language"], explanations: { en: "“My name is Budi” introduces a name.", id: "“My name is Budi” memperkenalkan nama." }, conceptKey: "en:cefr:a1:vocab:my-name" },
    { prompt: "What is your ___? I am Indonesian.", choices: ["nationality", "name", "city", "language"], explanations: { en: "Indonesian is a nationality.", id: "Indonesian adalah kewarganegaraan." }, conceptKey: "en:cefr:a1:vocab:nationality" },
  ],
  sentences: [
    { id: "s1", text: "I am from Indonesia.", paraphrase: "My country is Indonesia.", blank: { prompt: "I ___ from Indonesia.", answer: "am", choices: ["am", "is", "are", "be"], explanations: { en: "Use am with I.", id: "Gunakan am dengan I." } } },
    { id: "s2", text: "She is a teacher.", paraphrase: "Her job is teaching.", blank: { prompt: "She ___ a teacher.", answer: "is", choices: ["is", "am", "are", "be"], explanations: { en: "Use is with she.", id: "Gunakan is dengan she." } } },
    { id: "s3", text: "We are students.", paraphrase: "We study at a school.", blank: { prompt: "We ___ students.", answer: "are", choices: ["are", "is", "am", "be"], explanations: { en: "Use are with we.", id: "Gunakan are dengan we." } } },
    { id: "s4", text: "Where are you from?", paraphrase: "What is your origin?", blank: { prompt: "___ are you from?", answer: "Where", choices: ["Where", "What", "Who", "How"], explanations: { en: "Where asks about origin.", id: "Where menanyakan asal." } } },
    { id: "s5", text: "My name is Budi.", paraphrase: "People call me Budi.", blank: { prompt: "My ___ is Budi.", answer: "name", choices: ["name", "country", "language", "city"], explanations: { en: "The sentence introduces a name.", id: "Kalimat ini memperkenalkan nama." } } },
  ],
  grammar: [
    { prompt: "I ___ Ana.", choices: ["am", "is", "are", "be"], explanations: { en: "Use am with I.", id: "Gunakan am dengan I." }, conceptKey: "en:cefr:a1:grammar:am-ana" },
    { prompt: "He ___ from Japan.", choices: ["is", "am", "are", "be"], explanations: { en: "Use is with he.", id: "Gunakan is dengan he." }, conceptKey: "en:cefr:a1:grammar:is-he" },
    { prompt: "They ___ students.", choices: ["are", "is", "am", "be"], explanations: { en: "Use are with they.", id: "Gunakan are dengan they." }, conceptKey: "en:cefr:a1:grammar:are-they" },
    { prompt: "___ are you from?", choices: ["Where", "What", "Who", "How"], explanations: { en: "Where asks about place/origin.", id: "Where menanyakan tempat/asal." }, conceptKey: "en:cefr:a1:grammar:where-question" },
    { prompt: "I live ___ Jakarta.", choices: ["in", "at", "on", "from"], explanations: { en: "Use in with a city.", id: "Gunakan in dengan nama kota." }, conceptKey: "en:cefr:a1:grammar:live-in" },
  ],
};

const enNumbers = {
  id: "en-cefr-a1-u01-l03",
  slug: "numbers-and-age",
  title: "Numbers, age, and time",
  titleEn: "Numbers, age, and time",
  titleId: "Angka, usia, dan waktu",
  objective: "Count to ten and talk about age, quantity, and time.",
  objectiveEn: "Count to ten and talk about age, quantity, and time.",
  objectiveId: "Berhitung sampai sepuluh dan membicarakan usia, jumlah, dan waktu.",
  skill: "vocabulary",
  explanationEn: "Use “I am … years old” for age and “It is … o'clock” for time.",
  explanationId: "Gunakan “I am … years old” untuk usia dan “It is … o'clock” untuk waktu.",
  tipEn: "Numbers 13–19 end in -teen; multiples of ten end in -ty (thirteen, thirty).",
  tipId: "Angka 13–19 berakhiran -teen; kelipatan sepuluh berakhiran -ty (thirteen, thirty).",
  words: [
    { term: "one", meaning: "the number 1", meaningId: "satu" },
    { term: "two", meaning: "the number 2", meaningId: "dua" },
    { term: "three", meaning: "the number 3", meaningId: "tiga" },
    { term: "four", meaning: "the number 4", meaningId: "empat" },
    { term: "five", meaning: "the number 5", meaningId: "lima" },
    { term: "six", meaning: "the number 6", meaningId: "enam" },
    { term: "seven", meaning: "the number 7", meaningId: "tujuh" },
    { term: "eight", meaning: "the number 8", meaningId: "delapan" },
    { term: "nine", meaning: "the number 9", meaningId: "sembilan" },
    { term: "ten", meaning: "the number 10", meaningId: "sepuluh" },
  ],
  extras: [
    { prompt: "3 + 4 = ?", choices: ["seven", "five", "six", "eight"], explanations: { en: "3 + 4 = 7 (seven).", id: "3 + 4 = 7 (seven)." }, conceptKey: "en:cefr:a1:number:3-4" },
    { prompt: "10 − 2 = ?", choices: ["eight", "nine", "seven", "six"], explanations: { en: "10 − 2 = 8 (eight).", id: "10 − 2 = 8 (eight)." }, conceptKey: "en:cefr:a1:number:10-2" },
    { prompt: "2 + 6 = ?", choices: ["eight", "seven", "nine", "ten"], explanations: { en: "2 + 6 = 8 (eight).", id: "2 + 6 = 8 (eight)." }, conceptKey: "en:cefr:a1:number:2-6" },
    { prompt: "5 + 5 = ?", choices: ["ten", "nine", "eight", "seven"], explanations: { en: "5 + 5 = 10 (ten).", id: "5 + 5 = 10 (ten)." }, conceptKey: "en:cefr:a1:number:5-5" },
    { prompt: "9 − 4 = ?", choices: ["five", "four", "six", "seven"], explanations: { en: "9 − 4 = 5 (five).", id: "9 − 4 = 5 (five)." }, conceptKey: "en:cefr:a1:number:9-4" },
  ],
  sentences: [
    { id: "s1", text: "I am eighteen years old.", paraphrase: "My age is 18.", blank: { prompt: "I ___ eighteen years old.", answer: "am", choices: ["am", "is", "are", "be"], explanations: { en: "Use am with I.", id: "Gunakan am dengan I." } } },
    { id: "s2", text: "She is twenty.", paraphrase: "Her age is 20.", blank: { prompt: "She ___ twenty.", answer: "is", choices: ["is", "am", "are", "be"], explanations: { en: "Use is with she.", id: "Gunakan is dengan she." } } },
    { id: "s3", text: "There are three books.", paraphrase: "The number of books is 3.", blank: { prompt: "There ___ three books.", answer: "are", choices: ["are", "is", "am", "be"], explanations: { en: "Use are with plural books.", id: "Gunakan are dengan books jamak." } } },
    { id: "s4", text: "It is nine o'clock.", paraphrase: "The time is 9:00.", blank: { prompt: "It is ___ o'clock.", answer: "nine", choices: ["nine", "ninth", "ninety", "niner"], explanations: { en: "Use the cardinal number nine for time.", id: "Gunakan angka pokok nine untuk waktu." } } },
    { id: "s5", text: "I have two cats.", paraphrase: "I have 2 cats.", blank: { prompt: "I have ___ cats.", answer: "two", choices: ["two", "second", "twice", "twelve"], explanations: { en: "two is the number 2.", id: "two adalah angka 2." } } },
  ],
  grammar: [
    { prompt: "I ___ 18 years old.", choices: ["am", "is", "are", "be"], explanations: { en: "Use am with I.", id: "Gunakan am dengan I." }, conceptKey: "en:cefr:a1:grammar:age-am" },
    { prompt: "She ___ 20 years old.", choices: ["is", "am", "are", "be"], explanations: { en: "Use is with she.", id: "Gunakan is dengan she." }, conceptKey: "en:cefr:a1:grammar:age-is" },
    { prompt: "How ___ are you?", choices: ["old", "many", "much", "age"], explanations: { en: "“How old are you?” asks age.", id: "“How old are you?” menanyakan usia." }, conceptKey: "en:cefr:a1:grammar:how-old" },
    { prompt: "There are ___ apples.", choices: ["three", "third", "triple", "thirty"], explanations: { en: "Use the cardinal number three.", id: "Gunakan angka pokok three." }, conceptKey: "en:cefr:a1:grammar:three-apples" },
    { prompt: "It is ___ o'clock.", choices: ["nine", "ninth", "ninety", "niner"], explanations: { en: "Use the cardinal number nine.", id: "Gunakan angka pokok nine." }, conceptKey: "en:cefr:a1:grammar:nine-oclock" },
  ],
};

const enFamily = {
  id: "en-cefr-a1-u01-l04",
  slug: "family",
  title: "Family",
  titleEn: "Family",
  titleId: "Keluarga",
  objective: "Talk about family members and possession.",
  objectiveEn: "Talk about family members and possession.",
  objectiveId: "Membicarakan anggota keluarga dan kepemilikan.",
  skill: "vocabulary",
  explanationEn: "Add -'s to a person to show possession: my mother's name. Plural nouns take an apostrophe after the s: my parents' house.",
  explanationId: "Tambahkan -'s pada orang untuk menunjukkan kepemilikan: my mother's name. Kata benda jamak memakai apostrof setelah s: my parents' house.",
  tipEn: "Use “have/has” for family members: I have one sister. She has two brothers.",
  tipId: "Gunakan “have/has” untuk anggota keluarga: I have one sister. She has two brothers.",
  words: [
    { term: "family", meaning: "a group of related people", meaningId: "keluarga" },
    { term: "mother", meaning: "a female parent", meaningId: "ibu" },
    { term: "father", meaning: "a male parent", meaningId: "ayah" },
    { term: "sister", meaning: "a female sibling", meaningId: "saudara perempuan" },
    { term: "brother", meaning: "a male sibling", meaningId: "saudara laki-laki" },
    { term: "grandmother", meaning: "your parent's mother", meaningId: "nenek" },
    { term: "grandfather", meaning: "your parent's father", meaningId: "kakek" },
    { term: "child", meaning: "a young person", meaningId: "anak" },
    { term: "son", meaning: "a male child", meaningId: "anak laki-laki" },
    { term: "daughter", meaning: "a female child", meaningId: "anak perempuan" },
  ],
  extras: [
    { prompt: "My ___ is a teacher.", choices: ["mother", "mothers", "mother's", "motherly"], explanations: { en: "A singular family member is “mother”.", id: "Anggota keluarga tunggal adalah “mother”." }, conceptKey: "en:cefr:a1:vocab:mother" },
    { prompt: "I have two ___.", choices: ["brothers", "brother", "brother's", "brotherly"], explanations: { en: "Use the plural brothers after two.", id: "Gunakan bentuk jamak brothers setelah two." }, conceptKey: "en:cefr:a1:vocab:brothers" },
    { prompt: "She is my ___.", choices: ["sister", "sisters", "sister's", "sisterly"], explanations: { en: "One female sibling is “sister”.", id: "Satu saudara perempuan adalah “sister”." }, conceptKey: "en:cefr:a1:vocab:sister" },
    { prompt: "My ___ are here.", choices: ["parents", "parent", "parent's", "parenting"], explanations: { en: "“Parents” is plural with are.", id: "“Parents” jamak dan memakai are." }, conceptKey: "en:cefr:a1:vocab:parents" },
    { prompt: "This is my ___.", choices: ["family", "families", "family's", "familial"], explanations: { en: "One group is “family”.", id: "Satu kelompok adalah “family”." }, conceptKey: "en:cefr:a1:vocab:family" },
  ],
  sentences: [
    { id: "s1", text: "This is my family.", paraphrase: "These people are my relatives.", blank: { prompt: "This is my ___.", answer: "family", choices: ["family", "families", "family's", "familial"], explanations: { en: "One group is “family”.", id: "Satu kelompok adalah “family”." } } },
    { id: "s2", text: "My mother is a teacher.", paraphrase: "My female parent teaches.", blank: { prompt: "My ___ is a teacher.", answer: "mother", choices: ["mother", "mothers", "mother's", "motherly"], explanations: { en: "A singular female parent is “mother”.", id: "Ibu tunggal adalah “mother”." } } },
    { id: "s3", text: "I have two brothers.", paraphrase: "I have 2 male siblings.", blank: { prompt: "I have two ___.", answer: "brothers", choices: ["brothers", "brother", "brother's", "brotherly"], explanations: { en: "two takes the plural brothers.", id: "two diikuti bentuk jamak brothers." } } },
    { id: "s4", text: "She is my sister.", paraphrase: "She is my female sibling.", blank: { prompt: "She is my ___.", answer: "sister", choices: ["sister", "sisters", "sister's", "sisterly"], explanations: { en: "One female sibling is “sister”.", id: "Satu saudara perempuan adalah “sister”." } } },
    { id: "s5", text: "My father is a doctor.", paraphrase: "My male parent works as a doctor.", blank: { prompt: "My father is a ___.", answer: "doctor", choices: ["doctor", "teacher", "driver", "farmer"], explanations: { en: "The sentence says father is a doctor.", id: "Kalimat menyebut ayah adalah dokter." } } },
  ],
  grammar: [
    { prompt: "This ___ my mother.", choices: ["is", "am", "are", "be"], explanations: { en: "Use is with this singular noun.", id: "Gunakan is dengan kata benda tunggal this." }, conceptKey: "en:cefr:a1:grammar:this-is" },
    { prompt: "They ___ my parents.", choices: ["are", "is", "am", "be"], explanations: { en: "Use are with they.", id: "Gunakan are dengan they." }, conceptKey: "en:cefr:a1:grammar:they-are" },
    { prompt: "I have one ___.", choices: ["sister", "sisters", "sister's", "sisterly"], explanations: { en: "one takes the singular sister.", id: "one diikuti bentuk tunggal sister." }, conceptKey: "en:cefr:a1:grammar:one-sister" },
    { prompt: "My father ___ a doctor.", choices: ["is", "am", "are", "be"], explanations: { en: "Use is with he/my father.", id: "Gunakan is dengan he/my father." }, conceptKey: "en:cefr:a1:grammar:father-is" },
    { prompt: "___ is your brother?", choices: ["Who", "What", "Where", "How"], explanations: { en: "Who asks about a person.", id: "Who menanyakan orang." }, conceptKey: "en:cefr:a1:grammar:who-brother" },
  ],
};

const enRoutines = {
  id: "en-cefr-a1-u01-l05",
  slug: "daily-routines",
  title: "Daily routines",
  titleEn: "Daily routines",
  titleId: "Rutinitas harian",
  objective: "Describe daily routines in the present simple.",
  objectiveEn: "Describe daily routines in the present simple.",
  objectiveId: "Mendeskripsikan rutinitas harian dengan present simple.",
  skill: "grammar",
  explanationEn: "Use the present simple for habits. Add -s or -es for he/she/it: she eats, he goes.",
  explanationId: "Gunakan present simple untuk kebiasaan. Tambahkan -s atau -es untuk he/she/it: she eats, he goes.",
  tipEn: "Use “do/does” for questions: Do you study? Does she work?",
  tipId: "Gunakan “do/does” untuk pertanyaan: Do you study? Does she work?",
  words: [
    { term: "wake up", meaning: "to stop sleeping", meaningId: "bangun" },
    { term: "eat", meaning: "to have food", meaningId: "makan" },
    { term: "drink", meaning: "to take in liquid", meaningId: "minum" },
    { term: "go", meaning: "to move to a place", meaningId: "pergi" },
    { term: "study", meaning: "to learn about a subject", meaningId: "belajar" },
    { term: "work", meaning: "to do a job", meaningId: "bekerja" },
    { term: "sleep", meaning: "to rest with your eyes closed", meaningId: "tidur" },
    { term: "read", meaning: "to look at and understand words", meaningId: "membaca" },
    { term: "write", meaning: "to make words on paper or screen", meaningId: "menulis" },
    { term: "play", meaning: "to do something for fun", meaningId: "bermain" },
  ],
  extras: [
    { prompt: "I ___ up at six.", choices: ["wake", "wakes", "waking", "woke"], explanations: { en: "Use wake with I in the present simple.", id: "Gunakan wake dengan I pada present simple." }, conceptKey: "en:cefr:a1:grammar:wake-up-i" },
    { prompt: "She ___ to school.", choices: ["goes", "go", "going", "gone"], explanations: { en: "Add -es for she: goes.", id: "Tambahkan -es untuk she: goes." }, conceptKey: "en:cefr:a1:grammar:goes-she" },
    { prompt: "We ___ English every day.", choices: ["study", "studies", "studying", "studied"], explanations: { en: "Use the base form with we.", id: "Gunakan bentuk dasar dengan we." }, conceptKey: "en:cefr:a1:grammar:study-we" },
    { prompt: "He ___ at a bank.", choices: ["works", "work", "working", "worked"], explanations: { en: "Add -s for he: works.", id: "Tambahkan -s untuk he: works." }, conceptKey: "en:cefr:a1:grammar:works-he" },
    { prompt: "They ___ dinner at seven.", choices: ["eat", "eats", "eating", "ate"], explanations: { en: "Use the base form with they.", id: "Gunakan bentuk dasar dengan they." }, conceptKey: "en:cefr:a1:grammar:eat-they" },
  ],
  sentences: [
    { id: "s1", text: "I wake up at six.", paraphrase: "I get up at 6:00.", blank: { prompt: "I ___ up at six.", answer: "wake", choices: ["wake", "wakes", "waking", "woke"], explanations: { en: "Use wake with I.", id: "Gunakan wake dengan I." } } },
    { id: "s2", text: "She eats breakfast at seven.", paraphrase: "She has breakfast at 7:00.", blank: { prompt: "She ___ breakfast at seven.", answer: "eats", choices: ["eats", "eat", "eating", "ate"], explanations: { en: "Add -s for she: eats.", id: "Tambahkan -s untuk she: eats." } } },
    { id: "s3", text: "We study English every day.", paraphrase: "We learn English daily.", blank: { prompt: "We ___ English every day.", answer: "study", choices: ["study", "studies", "studying", "studied"], explanations: { en: "Use the base form with we.", id: "Gunakan bentuk dasar dengan we." } } },
    { id: "s4", text: "He works at a bank.", paraphrase: "His job is at a bank.", blank: { prompt: "He ___ at a bank.", answer: "works", choices: ["works", "work", "working", "worked"], explanations: { en: "Add -s for he: works.", id: "Tambahkan -s untuk he: works." } } },
    { id: "s5", text: "They go to bed at ten.", paraphrase: "They sleep at 10:00.", blank: { prompt: "They ___ to bed at ten.", answer: "go", choices: ["go", "goes", "going", "gone"], explanations: { en: "Use the base form with they.", id: "Gunakan bentuk dasar dengan they." } } },
  ],
  grammar: [
    { prompt: "I ___ breakfast at seven.", choices: ["eat", "eats", "eating", "ate"], explanations: { en: "Use the base form with I.", id: "Gunakan bentuk dasar dengan I." }, conceptKey: "en:cefr:a1:grammar:i-eat" },
    { prompt: "She ___ to bed at ten.", choices: ["goes", "go", "going", "gone"], explanations: { en: "Add -es for she: goes.", id: "Tambahkan -es untuk she: goes." }, conceptKey: "en:cefr:a1:grammar:she-goes" },
    { prompt: "Do you ___ English?", choices: ["study", "studies", "studying", "studied"], explanations: { en: "After do, use the base form.", id: "Setelah do, gunakan bentuk dasar." }, conceptKey: "en:cefr:a1:grammar:do-study" },
    { prompt: "He ___ TV every night.", choices: ["watches", "watch", "watching", "watched"], explanations: { en: "Add -es for he: watches.", id: "Tambahkan -es untuk he: watches." }, conceptKey: "en:cefr:a1:grammar:he-watches" },
    { prompt: "We ___ at 6 a.m.", choices: ["wake up", "wakes up", "waking up", "woke up"], explanations: { en: "Use the base form with we.", id: "Gunakan bentuk dasar dengan we." }, conceptKey: "en:cefr:a1:grammar:we-wake" },
  ],
};

const enUnit = {
  language: "en",
  framework: "CEFR",
  level: "A1",
  unit: {
    id: "en-cefr-a1-u01",
    position: 1,
    title: "Introductions",
    goal: "Introduce yourself, talk about family, numbers, and daily routines.",
    checkpointQuestionCount: 20,
  },
  lessons: [enGreetings, enNames, enNumbers, enFamily, enRoutines],
};

function writeUnit(unit) {
  const output = buildUnit(unit);
  const path = join(
    "content",
    "curricula",
    unit.language,
    unit.framework.toLowerCase(),
    unit.level.toLowerCase(),
    "u01.json",
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(output, null, 2)}\n`);
  const questions = output.lessons.reduce(
    (total, lesson) => total + lesson.questions.length,
    0,
  );
  console.log(`✓ ${path} — ${output.lessons.length} lessons, ${questions} questions`);
}

writeUnit(jaUnit);
writeUnit(enUnit);
