"use client";

import { useEffect, useState } from "react";
import { SpeechVoicePicker } from "@/components/shared/speech-voice-picker";

interface ReadingPrefs {
  romanization: boolean;
  furigana: boolean;
  translation: boolean;
  fontScale: "sm" | "md" | "lg";
}

const DEFAULTS: ReadingPrefs = {
  romanization: true,
  furigana: true,
  translation: true,
  fontScale: "md",
};

export function ReadingSettings({ language, locale }: { language: string; locale: string }) {
  const key = `lango:reading:${language}`;
  const [prefs, setPrefs] = useState<ReadingPrefs>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setPrefs({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<ReadingPrefs>) });
    } catch {
      // Corrupt local preference: keep defaults.
    }
  }, [key]);

  const update = (next: Partial<ReadingPrefs>) => {
    const value = { ...prefs, ...next };
    setPrefs(value);
    setSaved(false);
  };

  const save = () => {
    try {
      localStorage.setItem(key, JSON.stringify(prefs));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaved(false);
    }
  };

  const isCjk = language === "ja" || language === "zh";
  const label = (en: string, id: string) => (locale === "id" ? id : en);

  return (
    <div className="space-y-4">
      <SpeechVoicePicker language={language} variant="full" />
      <div className="rounded-2xl border border-border-default bg-surface p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">{label("Romanization", "Romanisasi")}</p>
            <p className="text-xs text-muted-text">{label("Show romaji/pinyin under each line.", "Tampilkan romaji/pinyin di bawah setiap baris.")}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.romanization}
            onClick={() => update({ romanization: !prefs.romanization })}
            disabled={!isCjk}
            className={`relative h-7 w-12 rounded-full transition-colors disabled:opacity-40 ${prefs.romanization ? "bg-accent-primary" : "bg-subtle"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${prefs.romanization ? "left-6" : "left-1"}`} />
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-border-default bg-surface p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">{label("Furigana", "Furigana")}</p>
            <p className="text-xs text-muted-text">{label("Show kana readings above kanji (Japanese).", "Tampilkan bacaan kana di atas kanji (Jepang).")}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.furigana}
            onClick={() => update({ furigana: !prefs.furigana })}
            disabled={language !== "ja"}
            className={`relative h-7 w-12 rounded-full transition-colors disabled:opacity-40 ${prefs.furigana ? "bg-accent-primary" : "bg-subtle"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${prefs.furigana ? "left-6" : "left-1"}`} />
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-border-default bg-surface p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">{label("Translation", "Terjemahan")}</p>
            <p className="text-xs text-muted-text">{label("Show the meaning under each line by default.", "Tampilkan arti di bawah setiap baris secara default.")}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.translation}
            onClick={() => update({ translation: !prefs.translation })}
            className={`relative h-7 w-12 rounded-full transition-colors ${prefs.translation ? "bg-accent-primary" : "bg-subtle"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${prefs.translation ? "left-6" : "left-1"}`} />
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-border-default bg-surface p-4">
        <p className="text-sm font-medium">{label("Reading size", "Ukuran bacaan")}</p>
        <div className="mt-3 flex gap-2">
          {(["sm", "md", "lg"] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => update({ fontScale: size })}
              className={`min-h-11 rounded-xl border px-4 text-sm ${prefs.fontScale === size ? "border-accent-primary bg-accent-primary/10 text-accent-primary" : "border-border-default text-secondary-text"}`}
            >
              {size.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} className="min-h-11 rounded-xl bg-accent-primary px-5 text-sm font-semibold text-white">
          {label("Save preferences", "Simpan preferensi")}
        </button>
        {saved && <span className="text-xs text-state-success">{label("Saved", "Tersimpan")}</span>}
      </div>
      <p className="text-xs text-muted-text">
        {label("Preferences are stored on this device for this language.", "Preferensi disimpan di perangkat ini untuk bahasa ini.")}
      </p>
    </div>
  );
}
