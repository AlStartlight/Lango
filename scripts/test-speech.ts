import assert from "node:assert/strict";
import {
  getVoiceAvailability,
  pickVoice,
  VOICE_SAMPLES,
  voiceGenderLabel,
  type VoiceLike,
} from "../app/lib/speech/voice-catalog";
import { toSpeechLocale } from "../app/lib/i18n/locales";

function voice(
  name: string,
  lang: string,
  extra: Partial<VoiceLike> = {},
): VoiceLike {
  return { name, lang, voiceURI: `${lang}:${name}`, ...extra };
}

const macOSJapanese = [
  voice("Kyoko", "ja-JP", { localService: true }),
  voice("Otoya", "ja-JP", { localService: true }),
  voice("Samantha", "en-US", { localService: true }),
  voice("Daniel", "en-GB", { localService: true }),
];

const windowsJapanese = [
  voice("Microsoft Haruka - Japanese (Japan)", "ja-JP"),
  voice("Microsoft Ichiro - Japanese (Japan)", "ja-JP"),
];

const edgeJapanese = [
  voice("Microsoft Nanami Online (Natural) - Japanese (Japan)", "ja-JP"),
  voice("Microsoft Keita Online (Natural) - Japanese (Japan)", "ja-JP"),
  voice("Google 日本語", "ja-JP"),
];

// Japanese must use Japanese voices, with both female and male actors.
assert.equal(pickVoice(macOSJapanese, "ja-JP", "female").voice?.name, "Kyoko");
assert.equal(pickVoice(macOSJapanese, "ja-JP", "male").voice?.name, "Otoya");
assert.equal(
  pickVoice(windowsJapanese, "ja-JP", "female").voice?.name,
  "Microsoft Haruka - Japanese (Japan)",
);
assert.equal(
  pickVoice(windowsJapanese, "ja-JP", "male").voice?.name,
  "Microsoft Ichiro - Japanese (Japan)",
);
assert.equal(
  pickVoice(edgeJapanese, "ja-JP", "female").voice?.name,
  "Microsoft Nanami Online (Natural) - Japanese (Japan)",
);
assert.equal(
  pickVoice(edgeJapanese, "ja-JP", "male").voice?.name,
  "Microsoft Keita Online (Natural) - Japanese (Japan)",
);

const availability = getVoiceAvailability(macOSJapanese, "ja-JP");
assert.equal(availability.total, 2);
assert.equal(availability.female?.name, "Kyoko");
assert.equal(availability.male?.name, "Otoya");
assert.equal(availability.singleVoice, false);

// Gender is more important than region (no en-US male, but en-GB Daniel exists).
assert.equal(pickVoice(macOSJapanese, "en-US", "male").voice?.name, "Daniel");

// Never read Japanese with an English voice when no Japanese voice is installed.
const noJapanese = pickVoice([voice("Samantha", "en-US")], "ja-JP", "female");
assert.equal(noJapanese.voice, null);
assert.equal(noJapanese.languageMatched, false);

// The canonical content code drives the BCP-47 locale (route alias `jp` → `ja`).
assert.equal(toSpeechLocale("ja"), "ja-JP");
assert.equal(
  pickVoice(macOSJapanese, toSpeechLocale("ja"), "female").voice?.name,
  "Kyoko",
);

// Gender names must not leak across voice-name/URI boundaries (Minsu vs sumi).
const koreanVoices = [
  voice("Yuna", "ko-KR"),
  voice("Minsu", "ko-KR"),
];
assert.equal(pickVoice(koreanVoices, "ko-KR", "female").voice?.name, "Yuna");
assert.equal(pickVoice(koreanVoices, "ko-KR", "male").voice?.name, "Minsu");

// Unknown voice names stay usable but are reported as unclassified.
assert.equal(voiceGenderLabel(voice("Mystery Voice", "ja-JP")), null);
assert.equal(
  pickVoice([voice("Mystery Voice", "ja-JP")], "ja-JP", "male").voice?.name,
  "Mystery Voice",
);

// Every supported content language needs a preview phrase.
for (const code of ["en", "es", "id", "ja", "hi", "de", "ar", "fr", "pt", "it", "nl", "ko", "zh"]) {
  assert.ok(VOICE_SAMPLES[code], `missing voice sample for ${code}`);
}

console.log("✓ speech voice selection: Japanese female/male, region, language guard");
