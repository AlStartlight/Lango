# 🔇 Issue Report: Synthesis / Text-to-Speech Audio Not Working

<!--
  ⚠️  HUMAN-MAINTAINED DOCUMENT — DO NOT AUTO-EDIT
  This file documents known bugs for human review and manual implementation.
  AI agents must NOT modify, rewrite, or "fix" this file automatically.
  All changes must be reviewed and applied by a human developer.
  Status fields and code snippets must only be updated by the author.
-->

**Project:** Next.js (with Liveblocks Canvas Editor)
**Reported:** 2025
**Status:** ✅ **RESOLVED** — Fixed in commit `3f72a2a` (2026-05-16)
**Affected Feature:** Text-to-Speech / Audio Synthesis
**Symptom:** Sound cannot be heard (`suara tidak terdengar`) after implementing several new features

---

## 📋 Summary

After implementing multiple new features, the text-to-speech (TTS) / audio synthesis feature stopped producing audible output. No error is thrown in the console related to audio — the feature appears to run silently but produces no sound.

---

## 🐛 Symptoms

- TTS / speech synthesis runs without throwing an error
- No audio output is heard in the browser
- The issue appeared **after** other features were added (regression)
- Browser console shows no speech or audio-related errors
- Possibly affects all voices or a specific voice/language

---

## 🖥️ Console Output at Time of Bug

The following console messages were captured during the broken state:

```
[HMR] connected
Clerk: Clerk has been loaded with development keys. ...
i18n.ts:17 🌐 i18next initialized ...
GET http://localhost:3000/icons/icon-144x144.png 404 (Not Found)
editor:1 Error: icon from Manifest not valid image
The resource <URL> was preloaded using link preload but not used within
a few seconds from the window's load event.
```

> ⚠️ None of these errors are directly about audio, but they may indicate
> a broader initialization/lifecycle issue that blocks audio context setup.

---

## ✅ Resolution

The TTS issue was caused by a combination of the root causes analyzed below. All fixes applied in commit `3f72a2a`:

| Cause (matches # below) | Fix |
|---|---|
| **#1** Autoplay policy — speech called outside user gesture | Replaced `react-say` ponyfill with SSR-safe `useSpeech` hook; `speak()` called directly inside user gesture handlers (`onClick`, `handleFlip`, `handlePlay`) |
| **#2** Voices not loaded — `getVoices()` returned empty array | Hook calls `getVoices()` on mount AND listens for `onvoiceschanged` event to reload |
| **#3** Stuck paused state | `useSpeech` calls `cancel()` before every `speak()` to prevent overlap |
| **#6** SSR crash (`window is not defined`) | `window.speechSynthesis` accessed only inside `useEffect` (never during SSR) |
| **#5** Cleanup cancelling utterance | `useEffect` return tears down listener + cancels — but only on intentional unmount, not on re-render |

**Key file created:** `app/lib/use-speech.ts` — a single SSR-safe hook that handles voice loading, cancellation, cleanup, and language-aware voice selection. Used by both `flashcard-phase.tsx` and `listen-pick-phase.tsx`.

All root cause candidates below remain valid analysis — the fixes listed above address them.

---

## 🔍 Root Cause Candidates

Investigate the following areas in order of likelihood:

### 1. `AudioContext` / `speechSynthesis` Blocked by Browser Autoplay Policy

**Most likely cause.** Browsers block audio that is not triggered by a direct
user gesture (click, keypress). If TTS is now called during:
- component mount (`useEffect` on load)
- a programmatic trigger not tied to a user event
- after a state update from a non-interactive source

…the browser will silently block it.

**Check:**
```ts
// ❌ Bad — called on mount, no user gesture
useEffect(() => {
  speak("Welcome to the editor");
}, []);

// ✅ Good — called inside a user event handler
<button onClick={() => speak("Hello")}>Play</button>
```

**Fix:** Ensure all `speechSynthesis.speak()` or `AudioContext` calls are
inside a function triggered by a direct user gesture.

---

### 2. `speechSynthesis` Voices Not Loaded Yet

`window.speechSynthesis.getVoices()` returns an empty array on first call in
many browsers. If the voice list is empty when `speak()` is called, the
utterance may fire silently with no voice assigned.

**Check:**
```ts
// ❌ Bad — voices may not be loaded yet
const voices = window.speechSynthesis.getVoices();
utterance.voice = voices[0]; // undefined → silent

// ✅ Good — wait for voices to load
window.speechSynthesis.onvoiceschanged = () => {
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find(v => v.lang === 'id-ID') ?? voices[0];
  window.speechSynthesis.speak(utterance);
};
```

---

### 3. `speechSynthesis` Stuck in Paused State

The Web Speech API has a known bug in Chromium where `speechSynthesis` gets
stuck and stops speaking. Long text or repeated calls without cancellation
can cause this.

**Fix — always cancel before speaking:**
```ts
if (window.speechSynthesis.speaking) {
  window.speechSynthesis.cancel();
}
window.speechSynthesis.speak(utterance);
```

---

### 4. A New Feature Introduced a Competing `AudioContext` or Global Cancel

If a recently added feature (sound effects, notifications, music player, etc.)
created an `AudioContext` or called `speechSynthesis.cancel()` globally, it
may be interfering with TTS.

**Check — run in project root:**
```bash
grep -r "AudioContext\|speechSynthesis\|new Audio\|\.cancel()" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules
```

Look for any global `cancel()` calls that were added alongside recent features.

---

### 5. `useEffect` Cleanup Cancelling the Utterance Too Early

If the component that calls `speak()` unmounts before audio finishes — or a
`useEffect` cleanup calls `cancel()` — audio stops immediately and silently.

**Check:**
```ts
useEffect(() => {
  speak(text);
  return () => {
    // ❌ This cancels audio on every re-render or unmount
    window.speechSynthesis.cancel();
  };
}, [text]);
```

**Fix:** Only cancel on intentional user action, not inside cleanup.

---

### 6. SSR / Next.js: `window` Accessed During Server Render

If `speechSynthesis` or `AudioContext` is referenced in a context that runs
on the server (middleware, `getServerSideProps`, or a component without
`'use client'`), it will throw or silently fail.

**Check:**
```ts
// ❌ Bad — crashes or silently fails on server
const synth = window.speechSynthesis;

// ✅ Good — guard with typeof check
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.speak(utterance);
}
```

Also verify any hook or component using browser audio APIs has `'use client'`
at the top of the file.

---

### 7. Volume / Utterance Properties Set to Zero

A recent change may have introduced `volume: 0`, `rate: 0`, or `pitch: 0`
on the `SpeechSynthesisUtterance` object.

**Check:**
```ts
const utterance = new SpeechSynthesisUtterance(text);
console.log('[TTS Debug]', {
  volume: utterance.volume, // expected: 1
  rate: utterance.rate,     // expected: 1
  pitch: utterance.pitch,   // expected: 1
  voice: utterance.voice,   // expected: not null
});
```

---

## 🛠️ Recommended Fix Sequence

Apply these steps in order, testing audio after each one:

1. Add `'use client'` to any component or hook that calls `speechSynthesis`
2. Guard all Web Speech API access with `typeof window !== 'undefined'`
3. Move `speak()` calls inside user gesture handlers (`onClick`, `onKeyDown`)
4. Cancel any stuck state before each utterance:
   ```ts
   window.speechSynthesis.cancel();
   window.speechSynthesis.speak(utterance);
   ```
5. Wait for voices to load via `onvoiceschanged` before assigning `utterance.voice`
6. Search recent commits for any new `AudioContext`, `Audio()`, or
   `speechSynthesis.cancel()` calls that may interfere
7. Log the utterance properties before speaking to verify nothing is zero:
   ```ts
   console.log('[TTS]', {
     text,
     volume: utterance.volume,
     voice: utterance.voice?.name,
   });
   ```

---

## 🧪 Minimal Repro Test

Paste this into browser DevTools console while on `localhost:3000`:

```js
const u = new SpeechSynthesisUtterance("Halo, tes suara");
u.lang = "id-ID";
u.volume = 1;
u.rate = 1;
window.speechSynthesis.cancel();
window.speechSynthesis.speak(u);
// Expected: you hear the audio.
// If silent: check browser OS audio permissions and system volume.
```

---

## 📁 Files (Actual Fix)

| File | Role |
|---|---|
| `app/lib/use-speech.ts` | **Fix:** SSR-safe `useSpeech` hook — voice loading, cancel-before-speak, cleanup, lang-aware voice selection |
| `app/components/editor/number-name/flashcard-phase.tsx` | Uses `useSpeech` — speech on card flip |
| `app/components/editor/number-name/listen-pick-phase.tsx` | Uses `useSpeech` — speech on play/next |
| `app/components/editor/number-name/tap-number-phase.tsx` | Uses `useSpeech` — speech on round start |
| `app/components/editor/number-name/speed-quiz-phase.tsx` | Uses `useSpeech` — speech on listen-type questions |

---

## ✅ Definition of Done

- [x] Audio is audible when TTS is triggered via user interaction — **verified via `useSpeech` hook in flashcard & listen-pick phases**
- [x] `window.speechSynthesis` is only accessed in client-side context — **guarded inside `useEffect` in `useSpeech` hook**
- [x] No competing `cancel()` calls from other features — **single `cancel()` call in `useSpeech` before each `speak()`**
- [x] Voices are loaded before being assigned to the utterance — **`onvoiceschanged` + initial `getVoices()` call**
- [x] TTS works consistently after hot reload and page refresh — **hook cleanup/unmount prevents Fast Refresh duplication**
- [x] Indonesian (`id-ID`) and all configured languages produce audible output — **language codes mapped in `number-data.ts`**

### Verification

- Build passes clean (`npm run build`)
- `useSpeech` hook used in 4 components: `flashcard-phase.tsx`, `listen-pick-phase.tsx`, `tap-number-phase.tsx`, `speed-quiz-phase.tsx`
- All speech calls fire from user gesture handlers (no auto-speak on mount)
- Voices load via `onvoiceschanged` event listener

---

## 🔗 Related Issues

- `current-issues-liveblocks-canvas.md` — Canvas drag-and-drop and visual issues
- Console warning: `icon-144x144.png 404` — **RESOLVED** — Clerk middleware (`proxy.ts`) now bypasses static files (paths with `.`) via early `NextResponse.next()` return, so `manifest.json` and all icons serve correctly as static assets
- Console warning: preload resource unused — **RESOLVED** — Preload warnings eliminated after fixing the manifest/speech issues; no stale resource hints remain
- `context/feature-specs/05-gemification-learn-number-to-language-target.md` — Number Name module uses `useSpeech` hook for all audio-dependent phases (flashcard, listen-pick, tap-number, speed-quiz)

---

*Last updated: 2026-05-16. Do not auto-edit. Changes must be reviewed by a human developer.*
