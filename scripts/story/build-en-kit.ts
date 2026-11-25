import { writeFileSync } from "node:fs";
import { MASTER_FRAMES } from "./master-frames";
import type { FrameSegment, LanguageKit, Lexeme, Lexicon } from "./types";

function parseTemplate(template: string): FrameSegment[] {
  const segments: FrameSegment[] = [];
  const re = /\{([A-Za-z0-9_]+)\}/g;
  let last = 0;
  for (const match of template.matchAll(re)) {
    if (match.index > last) segments.push({ text: template.slice(last, match.index) });
    segments.push({ slot: match[1] });
    last = match.index + match[0].length;
  }
  if (last < template.length) segments.push({ text: template.slice(last) });
  return segments;
}

const lex = (id: string, native: string, idGloss: string, enGloss: string, tags: string[] = []): Lexeme => ({
  id,
  native,
  gloss: { id: idGloss, en: enGloss },
  tags,
});

const lexicon: Lexicon = {
  person: [
    lex("en-person-owner", "the owner", "pemilik", "the owner", ["role"]),
    lex("en-person-visitor", "the visitor", "pengunjung", "the visitor", ["role"]),
    lex("en-person-neighbor", "the neighbor", "tetangga", "the neighbor", ["role"]),
    lex("en-person-child", "the child", "anak", "the child", ["role"]),
    lex("en-person-friend", "the friend", "teman", "the friend", ["role"]),
  ],
  place: [
    lex("en-place-shop", "the shop", "toko", "the shop"),
    lex("en-place-station", "the station", "stasiun", "the station"),
    lex("en-place-kitchen", "the kitchen", "dapur", "the kitchen"),
    lex("en-place-street", "the street", "jalan", "the street"),
    lex("en-place-harbor", "the harbor", "pelabuhan", "the harbor"),
  ],
  object: [
    lex("en-object-notebook", "the notebook", "buku catatan", "the notebook"),
    lex("en-object-cup", "the cup", "cangkir", "the cup"),
    lex("en-object-key", "the key", "kunci", "the key"),
    lex("en-object-photo", "the photograph", "foto", "the photograph"),
    lex("en-object-letter", "the letter", "surat", "the letter"),
  ],
  food: [
    lex("en-food-bread", "the bread", "roti", "the bread"),
    lex("en-food-cake", "the cake", "kue", "the cake"),
    lex("en-food-rice", "the rice", "nasi", "the rice"),
  ],
  drink: [
    lex("en-drink-coffee", "the coffee", "kopi", "the coffee"),
    lex("en-drink-tea", "the tea", "teh", "the tea"),
    lex("en-drink-water", "the water", "air", "the water"),
  ],
  time: [
    lex("en-time-morning", "morning", "pagi", "morning"),
    lex("en-time-afternoon", "afternoon", "siang", "afternoon"),
    lex("en-time-evening", "evening", "malam", "evening"),
    lex("en-time-dawn", "dawn", "subuh", "dawn"),
  ],
  weather: [
    lex("en-weather-warm", "The morning is warm.", "Pagi itu hangat.", "The morning is warm.", ["warm"]),
    lex("en-weather-rain", "It is raining.", "Hari sedang hujan.", "It is raining.", ["rain"]),
    lex("en-weather-cold", "The air is cold.", "Udaranya dingin.", "The air is cold.", ["cold"]),
    lex("en-weather-clear", "The sky is clear.", "Langitnya cerah.", "The sky is clear.", ["clear"]),
  ],
  action: [
    lex("en-action-brewed", "made coffee", "membuat kopi", "made coffee"),
    lex("en-action-opened", "opened the shop", "membuka toko", "opened the shop"),
    lex("en-action-cleaned", "cleaned the counter", "membersihkan meja", "cleaned the counter"),
    lex("en-action-waited", "waited by the window", "menunggu di dekat jendela", "waited by the window"),
    lex("en-action-wrote", "wrote a note", "menulis catatan", "wrote a note"),
  ],
  quote: [
    lex("en-quote-welcome", "Welcome.", "Selamat datang.", "Welcome."),
    lex("en-quote-itsumo", "The usual, please.", "Yang biasa, ya.", "The usual, please."),
    lex("en-quote-long-time", "It's been a long time.", "Sudah lama tidak bertemu.", "It's been a long time."),
    lex("en-quote-same", "It tastes the same.", "Rasanya sama.", "It tastes the same."),
    lex("en-quote-thankyou", "Thank you.", "Terima kasih.", "Thank you."),
  ],
  question: [
    lex("en-question-what", "What is this?", "Apa ini?", "What is this?"),
    lex("en-question-who", "Who wrote this?", "Siapa yang menulis ini?", "Who wrote this?"),
    lex("en-question-where", "Where is the notebook?", "Di mana buku catatan itu?", "Where is the notebook?"),
    lex("en-question-why", "Why did you come back?", "Mengapa kamu kembali?", "Why did you come back?"),
  ],
  greeting: [
    lex("en-greeting-morning", "Good morning", "Selamat pagi", "Good morning"),
    lex("en-greeting-hello", "Hello", "Halo", "Hello"),
    lex("en-greeting-evening", "Good evening", "Selamat malam", "Good evening"),
    lex("en-greeting-welcome", "Welcome", "Selamat datang", "Welcome"),
  ],
  emotion: [
    lex("en-emotion-relief", "relieved", "lega", "relieved"),
    lex("en-emotion-happy", "happy", "senang", "happy"),
    lex("en-emotion-sad", "sad", "sedih", "sad"),
    lex("en-emotion-nostalgic", "nostalgic", "rindu", "nostalgic"),
  ],
};

const kit: LanguageKit = {
  language: "en",
  script: "latn",
  romanization: "none",
  lexicon,
  frames: MASTER_FRAMES.map((frame) => ({
    id: frame.id,
    segments: parseTemplate(frame.translation.en),
  })),
  grammar: [
    { id: "en-g1", level: 1, pattern: "present simple", meaning: { id: "kebiasaan dan fakta", en: "habits and facts" }, example: "She opens the shop at six." },
    { id: "en-g2", level: 1, pattern: "past simple", meaning: { id: "kejadian yang selesai", en: "completed events" }, example: "He ordered the usual." },
    { id: "en-g3", level: 2, pattern: "because / so", meaning: { id: "sebab dan akibat", en: "cause and result" }, example: "She waits because the shop is quiet." },
    { id: "en-g4", level: 2, pattern: "while + -ing", meaning: { id: "dua aksi bersamaan", en: "two actions at once" }, example: "She waits while holding the notebook." },
    { id: "en-g5", level: 3, pattern: "relative clauses", meaning: { id: "menjelaskan benda/orang", en: "identifying people and things" }, example: "The notebook that she found was old." },
    { id: "en-g6", level: 3, pattern: "present perfect", meaning: { id: "menghubungkan masa lalu dan sekarang", en: "past linked to now" }, example: "Someone has moved the notebook." },
    { id: "en-g7", level: 4, pattern: "passive voice", meaning: { id: "fokus pada tindakan", en: "focus on the action" }, example: "The letter was kept in the drawer." },
    { id: "en-g8", level: 4, pattern: "past perfect", meaning: { id: "kejadian sebelum kejadian lain", en: "an earlier past event" }, example: "She had left before the shop opened." },
    { id: "en-g9", level: 5, pattern: "subjunctive / unreal past", meaning: { id: "kemungkinan dan penyesalan", en: "hypothesis and regret" }, example: "If she had known, she would have stayed." },
    { id: "en-g10", level: 5, pattern: "inversion for emphasis", meaning: { id: "penekanan gaya sastra", en: "literary emphasis" }, example: "Never had the shop felt so quiet." },
  ],
  questionPhrases: {
    meaning: "What does “{term}” mean?",
    who: "Who is mentioned in the scene?",
    where: "Where does the scene take place?",
    when: "When does the scene take place?",
    why: "Why does this happen?",
    detail: "Which detail is true in the scene?",
    next: "What will probably happen next?",
    culture: "Which cultural detail appears in the scene?",
    grammar: "Choose the correct form.",
  },
};

writeFileSync("content/stories/en/kit.json", `${JSON.stringify(kit, null, 2)}\n`);
console.log(`wrote en.json with ${kit.frames.length} frames`);
