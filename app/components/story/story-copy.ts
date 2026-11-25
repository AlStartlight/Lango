export interface StoryCopy {
  stories: string;
  learn: string;
  passport: string;
  profile: string;
  continueReading: string;
  start: string;
  dailyDrop: string;
  progress: string;
  levels: string;
  characters: string;
  cultureNotes: string;
  episodes: string;
  scenes: string;
  minutes: string;
  completed: string;
  notStarted: string;
  checkpoint: string;
  nextScene: string;
  finish: string;
  backToEpisode: string;
  romanization: string;
  furigana: string;
  translation: string;
  focusMode: string;
  audio: string;
  addToReview: string;
  close: string;
  correct: string;
  incorrect: string;
  answer: string;
  choose: string;
  continueStory: string;
  restToday: string;
  noStories: string;
  language: string;
  sources: string;
  reflection: string;
  vocabulary: string;
  grammar: string;
  culture: string;
  review: string;
  openMaterial: string;
  scene: string;
  of: string;
  readAloud: string;
  stop: string;
  storyProgress: string;
  next: string;
  previous: string;
  save: string;
}

const EN: StoryCopy = {
  stories: "Stories",
  learn: "Learn",
  passport: "Passport",
  profile: "Profile",
  continueReading: "Continue reading",
  start: "Start",
  dailyDrop: "Today's drop",
  progress: "Progress",
  levels: "Levels",
  characters: "Characters",
  cultureNotes: "Culture notes",
  episodes: "Episodes",
  scenes: "Scenes",
  minutes: "min",
  completed: "Completed",
  notStarted: "Not started",
  checkpoint: "Checkpoint",
  nextScene: "Next scene",
  finish: "Finish scene",
  backToEpisode: "Back to episode",
  romanization: "Romanization",
  furigana: "Furigana",
  translation: "Translation",
  focusMode: "Focus mode",
  audio: "Audio",
  addToReview: "Add to review",
  close: "Close",
  correct: "Correct",
  incorrect: "Not quite",
  answer: "Answer",
  choose: "Choose an answer",
  continueStory: "Continue the story",
  restToday: "Continue tomorrow",
  noStories: "Stories are not available for this language yet.",
  language: "Language",
  sources: "Sources",
  reflection: "Reflection",
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  culture: "Culture",
  review: "Review",
  openMaterial: "Open material",
  scene: "Scene",
  of: "of",
  readAloud: "Read aloud",
  stop: "Stop",
  storyProgress: "Story progress",
  next: "Next",
  previous: "Previous",
  save: "Save",
};

const ID: StoryCopy = {
  ...EN,
  stories: "Cerita",
  learn: "Belajar",
  passport: "Paspor",
  profile: "Profil",
  continueReading: "Lanjutkan membaca",
  start: "Mulai",
  dailyDrop: "Drop hari ini",
  progress: "Progres",
  levels: "Level",
  characters: "Tokoh",
  cultureNotes: "Catatan budaya",
  episodes: "Episode",
  scenes: "Scene",
  minutes: "menit",
  completed: "Selesai",
  notStarted: "Belum dimulai",
  checkpoint: "Checkpoint",
  nextScene: "Scene berikutnya",
  finish: "Selesaikan scene",
  backToEpisode: "Kembali ke episode",
  romanization: "Romanisasi",
  furigana: "Furigana",
  translation: "Terjemahan",
  focusMode: "Mode fokus",
  audio: "Audio",
  addToReview: "Tambah ke review",
  close: "Tutup",
  correct: "Benar",
  incorrect: "Belum tepat",
  answer: "Jawaban",
  choose: "Pilih jawaban",
  continueStory: "Lanjutkan cerita",
  restToday: "Lanjut besok",
  noStories: "Cerita untuk bahasa ini belum tersedia.",
  language: "Bahasa",
  sources: "Sumber",
  reflection: "Refleksi",
  vocabulary: "Kosakata",
  grammar: "Tata bahasa",
  culture: "Budaya",
  review: "Ulasan",
  openMaterial: "Buka materi",
  scene: "Scene",
  of: "dari",
  readAloud: "Bacakan",
  stop: "Berhenti",
  storyProgress: "Progres cerita",
  next: "Berikutnya",
  previous: "Sebelumnya",
  save: "Simpan",
};

const JA: StoryCopy = {
  ...EN,
  stories: "物語",
  learn: "学習",
  passport: "パスポート",
  profile: "プロフィール",
  continueReading: "続きを読む",
  start: "開始",
  dailyDrop: "今日のドロップ",
  progress: "進捗",
  levels: "レベル",
  characters: "登場人物",
  cultureNotes: "文化ノート",
  episodes: "エピソード",
  scenes: "シーン",
  minutes: "分",
  completed: "完了",
  notStarted: "未開始",
  checkpoint: "チェックポイント",
  nextScene: "次のシーン",
  finish: "シーンを終える",
  backToEpisode: "エピソードに戻る",
  romanization: "ローマ字",
  furigana: "ふりがな",
  translation: "翻訳",
  focusMode: "集中モード",
  audio: "音声",
  addToReview: "復習に追加",
  close: "閉じる",
  correct: "正解",
  incorrect: "おしい",
  answer: "答え",
  choose: "答えを選ぶ",
  continueStory: "物語を続ける",
  restToday: "また明日",
  noStories: "この言語の物語はまだありません。",
  language: "言語",
  sources: "出典",
  reflection: "振り返り",
  vocabulary: "語彙",
  grammar: "文法",
  culture: "文化",
  review: "復習",
  openMaterial: "教材を開く",
  scene: "シーン",
  of: "/",
  readAloud: "読み上げ",
  stop: "停止",
  storyProgress: "物語の進捗",
  next: "次へ",
  previous: "前へ",
  save: "保存",
};

export function storyCopy(locale: string): StoryCopy {
  if (locale === "id") return ID;
  if (locale === "ja" || locale === "jp") return JA;
  return EN;
}
