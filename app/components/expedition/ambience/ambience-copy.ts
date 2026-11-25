export interface AmbienceCopy {
  title: string;
  subtitle: string;
  livePreview: string;
  masterTitle: string;
  masterBody: string;
  presetsTitle: string;
  presetsHint: string;
  sceneTitle: string;
  sceneSakura: string;
  sceneSnow: string;
  sceneRain: string;
  sceneNone: string;
  phaseTitle: string;
  phaseAuto: string;
  phaseDay: string;
  phaseNight: string;
  phaseCycle: string;
  phaseHintAuto: string;
  phaseHintCycle: string;
  soundTitle: string;
  soundAuto: string;
  soundOff: string;
  soundBirds: string;
  soundCrickets: string;
  soundRain: string;
  soundWind: string;
  soundHint: string;
  soundBlocked: string;
  soundPlaying: string;
  volume: string;
  motionTitle: string;
  motionAuto: string;
  motionFull: string;
  motionCalm: string;
  motionOff: string;
  motionHint: string;
  storedNote: string;
  reset: string;
  dockLabel: string;
  dockOpen: string;
  dockClose: string;
  dockSoundOn: string;
  dockSoundOff: string;
  dockSettings: string;
  phaseLabelDawn: string;
  phaseLabelDay: string;
  phaseLabelDusk: string;
  phaseLabelNight: string;
  presetSakuraMorning: string;
  presetSakuraMorningBody: string;
  presetSnowCalm: string;
  presetSnowCalmBody: string;
  presetDrizzleFocus: string;
  presetDrizzleFocusBody: string;
  presetNightCrickets: string;
  presetNightCricketsBody: string;
  presetRotation: string;
  presetRotationBody: string;
  presetMinimal: string;
  presetMinimalBody: string;
}

const EN: AmbienceCopy = {
  title: "Learning ambience",
  subtitle:
    "Turn your study window into a calm place: falling sakura, snow, drizzle, birdsong, crickets at night, and a day–night cycle.",
  livePreview: "Live preview",
  masterTitle: "Ambience background",
  masterBody: "Show the animated scenery behind your lessons.",
  presetsTitle: "Study moods",
  presetsHint: "One tap sets scenery, sky and sound together.",
  sceneTitle: "Scenery",
  sceneSakura: "Sakura petals",
  sceneSnow: "Snowfall",
  sceneRain: "Drizzle",
  sceneNone: "Clear sky",
  phaseTitle: "Time of day",
  phaseAuto: "Follow clock",
  phaseDay: "Always day",
  phaseNight: "Always night",
  phaseCycle: "Rotate day/night",
  phaseHintAuto: "The sky follows your local time — birds in the morning, crickets at night.",
  phaseHintCycle: "The scenery rotates between day and night every two minutes.",
  soundTitle: "Ambient sound",
  soundAuto: "Match the scene",
  soundOff: "Muted",
  soundBirds: "Birdsong",
  soundCrickets: "Crickets",
  soundRain: "Rain",
  soundWind: "Wind",
  soundHint: "Sound is generated in your browser and is off by default.",
  soundBlocked: "Tap anywhere to start the sound.",
  soundPlaying: "Sound on",
  volume: "Volume",
  motionTitle: "Motion",
  motionAuto: "Match device",
  motionFull: "Lively",
  motionCalm: "Calm",
  motionOff: "Still",
  motionHint: "Calm keeps the scenery but slows the movement. Reducing motion is respected automatically.",
  storedNote: "Saved on this device. No account data is changed.",
  reset: "Reset to default",
  dockLabel: "Learning ambience",
  dockOpen: "Open ambience",
  dockClose: "Close ambience",
  dockSoundOn: "Mute ambience sound",
  dockSoundOff: "Play ambience sound",
  dockSettings: "All ambience settings",
  phaseLabelDawn: "Dawn",
  phaseLabelDay: "Day",
  phaseLabelDusk: "Dusk",
  phaseLabelNight: "Night",
  presetSakuraMorning: "Sakura morning",
  presetSakuraMorningBody: "Petals in a soft day sky with birdsong.",
  presetSnowCalm: "Quiet snowfall",
  presetSnowCalmBody: "Slow snow and gentle wind for deep focus.",
  presetDrizzleFocus: "Drizzle focus",
  presetDrizzleFocusBody: "Light rain and a muted sky for reading.",
  presetNightCrickets: "Night crickets",
  presetNightCricketsBody: "A moonlit sky with crickets at work.",
  presetRotation: "Day–night rotation",
  presetRotationBody: "The sky drifts from day to night on its own.",
  presetMinimal: "Minimal",
  presetMinimalBody: "No scenery and no sound, just a clean canvas.",
};

const ID: AmbienceCopy = {
  title: "Suasana belajar",
  subtitle:
    "Ubah jendela belajarmu jadi tempat yang tenang: bung sakura berguguran, salju, hujan rintik, suara burung, jangkrik malam, dan rotasi siang–malam.",
  livePreview: "Pratinjau langsung",
  masterTitle: "Latar suasana",
  masterBody: "Tampilkan pemandangan bergerak di belakang pelajaranmu.",
  presetsTitle: "Mode suasana",
  presetsHint: "Satu ketukan mengatur pemandangan, langit, dan suara sekaligus.",
  sceneTitle: "Pemandangan",
  sceneSakura: "Bunga sakura",
  sceneSnow: "Hujan salju",
  sceneRain: "Hujan rintik",
  sceneNone: "Langit cerah",
  phaseTitle: "Waktu",
  phaseAuto: "Ikut jam",
  phaseDay: "Selalu siang",
  phaseNight: "Selalu malam",
  phaseCycle: "Rotasi siang/malam",
  phaseHintAuto: "Langit mengikuti waktu lokalmu — burung saat pagi, jangkrik saat malam.",
  phaseHintCycle: "Pemandangan berganti siang dan malam tiap dua menit.",
  soundTitle: "Suara suasana",
  soundAuto: "Ikut pemandangan",
  soundOff: "Senyap",
  soundBirds: "Suara burung",
  soundCrickets: "Suara jangkrik",
  soundRain: "Hujan",
  soundWind: "Angin",
  soundHint: "Suara dibuat langsung di browser dan mati secara default.",
  soundBlocked: "Ketuk di mana saja untuk memulai suara.",
  soundPlaying: "Suara aktif",
  volume: "Volume",
  motionTitle: "Gerakan",
  motionAuto: "Ikut perangkat",
  motionFull: "Lincah",
  motionCalm: "Tenang",
  motionOff: "Diam",
  motionHint: "Mode tenang tetap menampilkan pemandangan dengan gerakan lebih lambat. Pengurangan gerak di perangkat dihormati otomatis.",
  storedNote: "Disimpan di perangkat ini. Tidak ada data akun yang diubah.",
  reset: "Kembalikan default",
  dockLabel: "Suasana belajar",
  dockOpen: "Buka suasana",
  dockClose: "Tutup suasana",
  dockSoundOn: "Matikan suara suasana",
  dockSoundOff: "Putar suara suasana",
  dockSettings: "Semua pengaturan suasana",
  phaseLabelDawn: "Subuh",
  phaseLabelDay: "Siang",
  phaseLabelDusk: "Senja",
  phaseLabelNight: "Malam",
  presetSakuraMorning: "Pagi sakura",
  presetSakuraMorningBody: "Kelopak sakura di langit pagi dengan suara burung.",
  presetSnowCalm: "Salju tenang",
  presetSnowCalmBody: "Salju pelan dan angin lembut untuk fokus.",
  presetDrizzleFocus: "Hujan rintik",
  presetDrizzleFocusBody: "Gerimis ringan dan langit redup untuk membaca.",
  presetNightCrickets: "Malam jangkrik",
  presetNightCricketsBody: "Langit rembulan dengan jangkrik yang bernyanyi.",
  presetRotation: "Rotasi siang–malam",
  presetRotationBody: "Langit bergeser dari siang ke malam dengan sendirinya.",
  presetMinimal: "Minimal",
  presetMinimalBody: "Tanpa pemandangan dan suara, kanvas bersih.",
};

const JA: AmbienceCopy = {
  title: "学習の雰囲気",
  subtitle:
    "学びの窓を穏やかな場所に。舞い散る桜、雪、小雨、鳥の声、夜の虫の音、昼と夜の切り替えができます。",
  livePreview: "ライブプレビュー",
  masterTitle: "背景の演出",
  masterBody: "レッスンの後ろに動く風景を表示します。",
  presetsTitle: "学習ムード",
  presetsHint: "ワンタップで風景・空・音をまとめて設定します。",
  sceneTitle: "風景",
  sceneSakura: "桜の花びら",
  sceneSnow: "雪",
  sceneRain: "小雨",
  sceneNone: "晴れた空",
  phaseTitle: "時間帯",
  phaseAuto: "時計に合わせる",
  phaseDay: "いつも昼",
  phaseNight: "いつも夜",
  phaseCycle: "昼と夜を切り替え",
  phaseHintAuto: "空は端末の現地時刻に合わせます。朝は鳥、夜は虫の音。",
  phaseHintCycle: "2分ごとに昼と夜の風景が切り替わります。",
  soundTitle: "環境音",
  soundAuto: "風景に合わせる",
  soundOff: "消音",
  soundBirds: "鳥の声",
  soundCrickets: "虫の声",
  soundRain: "雨",
  soundWind: "風",
  soundHint: "音はブラウザ内で生成され、初期状態はオフです。",
  soundBlocked: "どこかをタップすると音が始まります。",
  soundPlaying: "音オン",
  volume: "音量",
  motionTitle: "動き",
  motionAuto: "端末に合わせる",
  motionFull: "活発",
  motionCalm: "穏やか",
  motionOff: "静止",
  motionHint: "穏やかでは風景を保ちながら動きを遅くします。動きを減らす設定は自動で尊重されます。",
  storedNote: "この端末に保存されます。アカウントデータは変更されません。",
  reset: "初期設定に戻す",
  dockLabel: "学習の雰囲気",
  dockOpen: "雰囲気パネルを開く",
  dockClose: "雰囲気パネルを閉じる",
  dockSoundOn: "環境音を消す",
  dockSoundOff: "環境音を再生",
  dockSettings: "雰囲気の設定をすべて見る",
  phaseLabelDawn: "夜明け",
  phaseLabelDay: "昼",
  phaseLabelDusk: "夕暮れ",
  phaseLabelNight: "夜",
  presetSakuraMorning: "桜の朝",
  presetSakuraMorningBody: "鳥の声と朝の空に舞う花びら。",
  presetSnowCalm: "静かな雪",
  presetSnowCalmBody: "ゆっくりした雪と穏やかな風で集中。",
  presetDrizzleFocus: "小雨の集中",
  presetDrizzleFocusBody: "読書のための軽い雨と落ち着いた空。",
  presetNightCrickets: "夜の虫の音",
  presetNightCricketsBody: "月明かりの空と虫の声。",
  presetRotation: "昼と夜のローテーション",
  presetRotationBody: "空が自然に昼から夜へ移ります。",
  presetMinimal: "ミニマル",
  presetMinimalBody: "風景も音もなし、すっきりした画面。",
};

export function ambienceCopy(locale: string): AmbienceCopy {
  if (locale === "id") return ID;
  if (locale === "ja" || locale === "jp") return JA;
  return EN;
}

export function ambiencePresetCopy(
  copy: AmbienceCopy,
  id: string,
): { title: string; body: string } {
  switch (id) {
    case "sakura-morning":
      return { title: copy.presetSakuraMorning, body: copy.presetSakuraMorningBody };
    case "snow-calm":
      return { title: copy.presetSnowCalm, body: copy.presetSnowCalmBody };
    case "drizzle-focus":
      return { title: copy.presetDrizzleFocus, body: copy.presetDrizzleFocusBody };
    case "night-crickets":
      return { title: copy.presetNightCrickets, body: copy.presetNightCricketsBody };
    case "day-night-rotation":
      return { title: copy.presetRotation, body: copy.presetRotationBody };
    default:
      return { title: copy.presetMinimal, body: copy.presetMinimalBody };
  }
}

export function phaseLabel(
  copy: AmbienceCopy,
  phase: "dawn" | "day" | "dusk" | "night",
): string {
  if (phase === "dawn") return copy.phaseLabelDawn;
  if (phase === "dusk") return copy.phaseLabelDusk;
  if (phase === "night") return copy.phaseLabelNight;
  return copy.phaseLabelDay;
}
