import type { InterviewFeedbackCode } from "@/lib/interview/types";

export type InterviewLocale = "id" | "en" | "ja";

export interface InterviewCopy {
  kicker: string;
  title: string;
  intro: string;
  language: string;
  questionsCount: string;
  availability: string;
  draftNote: string;
  readiness: string;
  noReadiness: string;
  deltaUp: string;
  deltaDown: string;
  sessions: string;
  turns: string;
  modeDrill: string;
  modeDrillDesc: string;
  modeSimulation: string;
  modeSimulationDesc: string;
  minutes: string;
  startDrill: string;
  startSimulation: string;
  tracks: string;
  guide: string;
  practice: string;
  recent: string;
  emptyRecent: string;
  inProgress: string;
  report: string;
  hubDisclaimer: string;
  sessionTitle: string;
  questionOf: string;
  drillLabel: string;
  simulationLabel: string;
  yourAnswer: string;
  answerPlaceholder: string;
  words: string;
  estimatedDuration: string;
  seconds: string;
  recordStart: string;
  recordStop: string;
  micDenied: string;
  micUnsupported: string;
  listening: string;
  questionAudio: string;
  submit: string;
  submitting: string;
  submitFailed: string;
  retry: string;
  next: string;
  finish: string;
  feedbackHidden: string;
  resumeNote: string;
  allAnswered: string;
  backToHub: string;
  translationHint: string;
  scoreLabel: string;
  strength: string;
  improvement: string;
  feedbackStrength: string;
  feedbackImprove: string;
  reportTitle: string;
  reportSubtitle: string;
  overall: string;
  dimensions: string;
  strengths: string;
  improvements: string;
  transcript: string;
  modelAnswer: string;
  skeleton: string;
  keyPhrases: string;
  redFlags: string;
  culturalNote: string;
  nextStep: string;
  retryWeak: string;
  startNew: string;
  backToSessions: string;
  noTurns: string;
  aggregateNote: string;
  guideTitle: string;
  guideIntro: string;
  guideEmpty: string;
  practiceThis: string;
  showAnswer: string;
  hideAnswer: string;
  missingLanguageTitle: string;
  missingLanguageBody: string;
  band: Record<
    "not_ready" | "foundation" | "interview_ready" | "strong" | "excellent",
    string
  >;
  dimension: Record<
    "content" | "structure" | "evidence" | "language" | "delivery",
    string
  >;
  feedback: Record<InterviewFeedbackCode, string>;
}

const EN: InterviewCopy = {
  kicker: "Work visa · interview practice",
  title: "VISA KERJA",
  intro:
    "Practise the interview that decides your work visa and your offer. Choose a track, answer out loud or by typing, and get a readiness score with concrete next steps.",
  language: "Interview language",
  questionsCount: "{count} questions",
  availability: "Content status",
  draftNote:
    "Beta content. Examples are skeletons for practice, not official answers.",
  readiness: "Readiness",
  noReadiness: "No score yet",
  deltaUp: "+{delta} since last session",
  deltaDown: "{delta} since last session",
  sessions: "{count} sessions",
  turns: "{count} answers",
  modeDrill: "Quick drill",
  modeDrillDesc: "3 questions, about 5 minutes, with feedback after each answer.",
  modeSimulation: "Full simulation",
  modeSimulationDesc:
    "8 questions, 25–35 minutes, score hidden until the final report.",
  minutes: "{count} min",
  startDrill: "Start 5-minute drill",
  startSimulation: "Start simulation",
  tracks: "Interview tracks",
  guide: "Study the model answers",
  practice: "Practise",
  recent: "Recent sessions",
  emptyRecent: "No practice yet. Start with screening and tell me about yourself.",
  inProgress: "In progress",
  report: "Open report",
  hubDisclaimer:
    "The readiness score is a practice signal, not a prediction of whether you will be hired.",
  sessionTitle: "Interview practice",
  questionOf: "Question {current} of {total}",
  drillLabel: "Drill",
  simulationLabel: "Simulation",
  yourAnswer: "Your answer",
  answerPlaceholder:
    "Type your answer as you would say it out loud. One concrete example and one number make the strongest answer.",
  words: "{count} words",
  estimatedDuration: "about {seconds}s spoken",
  seconds: "{count}s",
  recordStart: "Dictate with microphone",
  recordStop: "Stop dictation",
  micDenied: "Microphone permission was denied. You can type the answer instead.",
  micUnsupported:
    "This browser does not support dictation. Type your answer instead.",
  listening: "Listening…",
  questionAudio: "Play question",
  submit: "Submit answer",
  submitting: "Saving…",
  submitFailed: "Could not save the answer. Please try again.",
  retry: "Try again",
  next: "Next question",
  finish: "Finish and see report",
  feedbackHidden:
    "Feedback is hidden during the simulation. You will see every score in the report.",
  resumeNote: "You are continuing this session.",
  allAnswered: "All questions are answered. Finish the session to see your report.",
  backToHub: "Back to Visa Kerja",
  translationHint: "Translation",
  scoreLabel: "Readiness",
  strength: "Strength",
  improvement: "Improve",
  feedbackStrength: "What worked",
  feedbackImprove: "What to change",
  reportTitle: "Interview report",
  reportSubtitle: "{track} · {mode} · {date}",
  overall: "Overall readiness",
  dimensions: "Five dimensions",
  strengths: "Strengths",
  improvements: "Priorities",
  transcript: "Transcript",
  modelAnswer: "Model answer",
  skeleton: "Answer skeleton",
  keyPhrases: "Key phrases",
  redFlags: "Avoid",
  culturalNote: "Cultural note",
  nextStep: "Next step",
  retryWeak: "Practise the weakest question again",
  startNew: "Start a new session",
  backToSessions: "Back to Visa Kerja",
  noTurns: "This session has no answers yet.",
  aggregateNote:
    "A session score needs at least three answers. This is a practice signal, not a hiring prediction.",
  guideTitle: "Model answers & structures",
  guideIntro:
    "Read the structure, then practise the same question. The examples are skeletons: replace the numbers and details with your own experience.",
  guideEmpty: "No questions for this track yet.",
  practiceThis: "Practise this question",
  showAnswer: "Show structure and example",
  hideAnswer: "Hide",
  missingLanguageTitle: "This language is not available yet",
  missingLanguageBody:
    "Visa Kerja currently has interview banks for English, Indonesian and Japanese. Switch language to start practising.",
  band: {
    not_ready: "Not ready yet",
    foundation: "Foundation built",
    interview_ready: "Interview ready",
    strong: "Strong",
    excellent: "Excellent",
  },
  dimension: {
    content: "Content & relevance",
    structure: "Structure",
    evidence: "Evidence",
    language: "Language & register",
    delivery: "Delivery",
  },
  feedback: {
    clear_structure: "You used a recognisable answer structure.",
    has_metric: "You backed the answer with a number.",
    good_length: "The answer length fits the target.",
    formal_register: "Register and tone fit an interview.",
    personal_contribution: "Your own contribution is visible.",
    specific_example: "The answer is specific, not generic.",
    add_metric: "Add one measurable result (time, users, cost, percent).",
    add_structure: "Use a clear path: situation → task → action → result.",
    add_result: "Close with the outcome, not only the activity.",
    too_short: "This is shorter than a spoken answer should be.",
    too_long: "Tighten it; the interviewer needs the point sooner.",
    reduce_filler: "Reduce filler words and restart the sentence cleanly.",
    use_formal_register: "Use the formal register expected in an interview.",
    use_first_person: 'Say "I", not only "we", when describing your work.',
    add_specifics: "Name the project, tool, or constraint instead of general claims.",
  },
};

const ID: InterviewCopy = {
  kicker: "Visa kerja · latihan wawancara",
  title: "VISA KERJA",
  intro:
    "Latih wawancara yang menentukan visa kerja dan tawaran Anda. Pilih track, jawab dengan suara atau ketik, lalu lihat skor kesiapan beserta langkah perbaikannya.",
  language: "Bahasa wawancara",
  questionsCount: "{count} soal",
  availability: "Status konten",
  draftNote:
    "Konten beta. Contoh jawaban adalah kerangka latihan, bukan jawaban resmi.",
  readiness: "Kesiapan",
  noReadiness: "Belum ada skor",
  deltaUp: "+{delta} dari sesi sebelumnya",
  deltaDown: "{delta} dari sesi sebelumnya",
  sessions: "{count} sesi",
  turns: "{count} jawaban",
  modeDrill: "Drill cepat",
  modeDrillDesc: "3 soal, sekitar 5 menit, dengan umpan balik tiap jawaban.",
  modeSimulation: "Simulasi penuh",
  modeSimulationDesc:
    "8 soal, 25–35 menit, skor disembunyikan sampai laporan akhir.",
  minutes: "{count} menit",
  startDrill: "Mulai drill 5 menit",
  startSimulation: "Mulai simulasi",
  tracks: "Track wawancara",
  guide: "Pelajari contoh jawaban",
  practice: "Latih",
  recent: "Sesi terakhir",
  emptyRecent:
    "Belum ada latihan. Mulai dari screening dan ceritakan tentang diri Anda.",
  inProgress: "Sedang berjalan",
  report: "Buka laporan",
  hubDisclaimer:
    "Skor kesiapan adalah sinyal latihan, bukan prediksi apakah Anda akan diterima.",
  sessionTitle: "Latihan wawancara",
  questionOf: "Soal {current} dari {total}",
  drillLabel: "Drill",
  simulationLabel: "Simulasi",
  yourAnswer: "Jawaban Anda",
  answerPlaceholder:
    "Tulis jawaban seperti Anda akan mengucapkannya. Satu contoh konkret dan satu angka membuat jawaban jauh lebih kuat.",
  words: "{count} kata",
  estimatedDuration: "sekitar {seconds} detik diucapkan",
  seconds: "{count} detik",
  recordStart: "Dikte dengan mikrofon",
  recordStop: "Hentikan dikte",
  micDenied:
    "Izin mikrofon ditolak. Anda bisa menulis jawaban sebagai gantinya.",
  micUnsupported:
    "Browser ini tidak mendukung dikte. Silakan tulis jawaban Anda.",
  listening: "Mendengarkan…",
  questionAudio: "Putar pertanyaan",
  submit: "Kirim jawaban",
  submitting: "Menyimpan…",
  submitFailed: "Jawaban gagal disimpan. Silakan coba lagi.",
  retry: "Coba lagi",
  next: "Soal berikutnya",
  finish: "Selesai dan lihat laporan",
  feedbackHidden:
    "Umpan balik disembunyikan selama simulasi. Semua skor muncul di laporan.",
  resumeNote: "Anda melanjutkan sesi ini.",
  allAnswered: "Semua soal sudah dijawab. Selesaikan sesi untuk melihat laporan.",
  backToHub: "Kembali ke Visa Kerja",
  translationHint: "Terjemahan",
  scoreLabel: "Kesiapan",
  strength: "Kekuatan",
  improvement: "Perbaiki",
  feedbackStrength: "Yang sudah baik",
  feedbackImprove: "Yang perlu diubah",
  reportTitle: "Laporan wawancara",
  reportSubtitle: "{track} · {mode} · {date}",
  overall: "Kesiapan keseluruhan",
  dimensions: "Lima dimensi",
  strengths: "Kekuatan",
  improvements: "Prioritas",
  transcript: "Transkrip",
  modelAnswer: "Contoh jawaban",
  skeleton: "Kerangka jawaban",
  keyPhrases: "Frasa kunci",
  redFlags: "Hindari",
  culturalNote: "Catatan budaya",
  nextStep: "Langkah berikutnya",
  retryWeak: "Latih ulang soal terlemah",
  startNew: "Mulai sesi baru",
  backToSessions: "Kembali ke Visa Kerja",
  noTurns: "Sesi ini belum punya jawaban.",
  aggregateNote:
    "Skor sesi memerlukan minimal tiga jawaban. Ini sinyal latihan, bukan prediksi perekrutan.",
  guideTitle: "Contoh jawaban & struktur",
  guideIntro:
    "Baca strukturnya, lalu latih soal yang sama. Contoh ini kerangka: ganti angka dan detail dengan pengalaman Anda sendiri.",
  guideEmpty: "Belum ada soal untuk track ini.",
  practiceThis: "Latih soal ini",
  showAnswer: "Lihat struktur dan contoh",
  hideAnswer: "Sembunyikan",
  missingLanguageTitle: "Bahasa ini belum tersedia",
  missingLanguageBody:
    "Visa Kerja saat ini punya bank soal wawancara untuk Inggris, Indonesia, dan Jepang. Ganti bahasa untuk mulai latihan.",
  band: {
    not_ready: "Belum siap",
    foundation: "Fondasi terbentuk",
    interview_ready: "Siap wawancara",
    strong: "Kuat",
    excellent: "Sangat baik",
  },
  dimension: {
    content: "Konten & relevansi",
    structure: "Struktur",
    evidence: "Bukti",
    language: "Bahasa & register",
    delivery: "Penyampaian",
  },
  feedback: {
    clear_structure: "Struktur jawaban mudah dikenali.",
    has_metric: "Jawaban didukung angka.",
    good_length: "Panjang jawaban sesuai target.",
    formal_register: "Register dan nada sesuai wawancara.",
    personal_contribution: "Kontribusi pribadi Anda terlihat.",
    specific_example: "Jawaban spesifik, bukan umum.",
    add_metric:
      "Tambahkan satu hasil terukur (waktu, pengguna, biaya, persen).",
    add_structure:
      "Pakai alur jelas: situasi → tugas → aksi → hasil.",
    add_result: "Tutup dengan hasil, bukan hanya aktivitas.",
    too_short: "Jawaban ini lebih pendek dari jawaban lisan yang wajar.",
    too_long: "Ringkas; pewawancara perlu intinya lebih cepat.",
    reduce_filler: "Kurangi kata pengisi dan ulangi kalimat dengan bersih.",
    use_formal_register: "Gunakan register formal yang diharapkan.",
    use_first_person: 'Sebut "saya", bukan hanya "kami", saat menjelaskan pekerjaan Anda.',
    add_specifics:
      "Sebut proyek, alat, atau batasan konkret, bukan klaim umum.",
  },
};

const JA: InterviewCopy = {
  kicker: "就労ビザ · 面接練習",
  title: "VISA KERJA",
  intro:
    "就労ビザと内定を左右する面接を練習しましょう。トラックを選び、音声または入力で答え、準備スコアと次の改善点を確認できます。",
  language: "面接の言語",
  questionsCount: "{count} 問",
  availability: "コンテンツ状況",
  draftNote:
    "ベータ版です。例文は練習用の骨組みであり、公式の回答ではありません。",
  readiness: "準備度",
  noReadiness: "スコアはまだありません",
  deltaUp: "前回より +{delta}",
  deltaDown: "前回より {delta}",
  sessions: "{count} セッション",
  turns: "{count} 回答",
  modeDrill: "クイックドリル",
  modeDrillDesc: "3問・約5分。各回答の後にフィードバックがあります。",
  modeSimulation: "フルシミュレーション",
  modeSimulationDesc:
    "8問・25〜35分。スコアは最後のレポートまで表示されません。",
  minutes: "{count} 分",
  startDrill: "5分ドリルを始める",
  startSimulation: "シミュレーションを始める",
  tracks: "面接トラック",
  guide: "模範解答を読む",
  practice: "練習する",
  recent: "最近のセッション",
  emptyRecent:
    "まだ練習がありません。まずはスクリーニングで自己紹介から始めましょう。",
  inProgress: "進行中",
  report: "レポートを開く",
  hubDisclaimer:
    "準備度は練習の目安であり、採用されるかどうかの予測ではありません。",
  sessionTitle: "面接練習",
  questionOf: "質問 {current} / {total}",
  drillLabel: "ドリル",
  simulationLabel: "シミュレーション",
  yourAnswer: "あなたの回答",
  answerPlaceholder:
    "声に出して話すつもりで入力してください。具体的な例を一つと数字を一つ入れると強くなります。",
  words: "{count} 語",
  estimatedDuration: "音声で約 {seconds} 秒",
  seconds: "{count} 秒",
  recordStart: "マイクで音声入力",
  recordStop: "音声入力を停止",
  micDenied: "マイクの許可が拒否されました。代わりに入力してください。",
  micUnsupported: "このブラウザは音声入力に対応していません。入力してください。",
  listening: "聞き取り中…",
  questionAudio: "質問を再生",
  submit: "回答を送信",
  submitting: "保存中…",
  submitFailed: "回答を保存できませんでした。もう一度お試しください。",
  retry: "再試行",
  next: "次の質問",
  finish: "終了してレポートを見る",
  feedbackHidden:
    "シミュレーション中はフィードバックを表示しません。レポートで全てのスコアを確認できます。",
  resumeNote: "このセッションを再開しています。",
  allAnswered: "すべての質問に回答しました。セッションを終了してレポートを見ましょう。",
  backToHub: "Visa Kerja に戻る",
  translationHint: "翻訳",
  scoreLabel: "準備度",
  strength: "強み",
  improvement: "改善点",
  feedbackStrength: "良かった点",
  feedbackImprove: "変える点",
  reportTitle: "面接レポート",
  reportSubtitle: "{track} · {mode} · {date}",
  overall: "総合準備度",
  dimensions: "5つの観点",
  strengths: "強み",
  improvements: "優先課題",
  transcript: "文字起こし",
  modelAnswer: "模範解答",
  skeleton: "回答の骨組み",
  keyPhrases: "キーフレーズ",
  redFlags: "避けたいこと",
  culturalNote: "文化メモ",
  nextStep: "次のステップ",
  retryWeak: "最も弱い質問を再練習",
  startNew: "新しいセッションを始める",
  backToSessions: "Visa Kerja に戻る",
  noTurns: "このセッションにはまだ回答がありません。",
  aggregateNote:
    "セッションスコアには3つ以上の回答が必要です。これは練習の目安であり、採用の予測ではありません。",
  guideTitle: "模範解答と構成",
  guideIntro:
    "構成を読んでから同じ質問を練習しましょう。例は骨組みです。数字と詳細は自分の経験に置き換えてください。",
  guideEmpty: "このトラックの質問はまだありません。",
  practiceThis: "この質問を練習",
  showAnswer: "構成と例を見る",
  hideAnswer: "閉じる",
  missingLanguageTitle: "この言語はまだ利用できません",
  missingLanguageBody:
    "Visa Kerja の面接バンクは現在、英語・インドネシア語・日本語です。言語を切り替えて練習してください。",
  band: {
    not_ready: "まだ準備不足",
    foundation: "基礎はできています",
    interview_ready: "面接の準備ができています",
    strong: "強い",
    excellent: "非常に良い",
  },
  dimension: {
    content: "内容と関連性",
    structure: "構成",
    evidence: "根拠",
    language: "言語と敬語",
    delivery: "話し方",
  },
  feedback: {
    clear_structure: "回答の構成が分かりやすいです。",
    has_metric: "数字で裏付けられています。",
    good_length: "長さが目標に合っています。",
    formal_register: "面接にふさわしい敬語と語調です。",
    personal_contribution: "あなた自身の貢献が伝わります。",
    specific_example: "具体的で、一般論ではありません。",
    add_metric: "測定できる成果を一つ入れてください（時間・人数・費用・割合）。",
    add_structure: "状況→課題→行動→結果の流れにしてください。",
    add_result: "活動だけでなく、結果で締めくくってください。",
    too_short: "話し言葉としては短すぎます。",
    too_long: "要点を早く伝え、短くしてください。",
    reduce_filler: "つなぎ言葉を減らし、文を立て直してください。",
    use_formal_register: "面接で期待される丁寧な表現を使ってください。",
    use_first_person: "仕事の説明では「私たち」だけでなく「私」を使ってください。",
    add_specifics: "一般的な主張ではなく、プロジェクト・道具・制約を具体的に。",
  },
};

export const interviewCopy = (locale: string): InterviewCopy => {
  if (locale === "id") return ID;
  if (locale === "ja" || locale === "jp") return JA;
  return EN;
};

export function interviewFill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export const INTERVIEW_LOCALE_TO_SPEECH: Record<string, string> = {
  en: "en-US",
  id: "id-ID",
  ja: "ja-JP",
};
