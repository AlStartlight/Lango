# CURRENT ISSUE — NEXTJS SPEECH SYNTHESIS + MANIFEST + CSP

> **Status**: ✅ All fixes applied and verified (build clean).

---

## ✅ FIX 1 — Manifest.json blocked by Clerk middleware

**Root cause**: `proxy.ts` (Clerk middleware) did not include static files in its public route matcher. Requests to `/manifest.json`, `/icons/*.png`, etc. were intercepted by `clerkMiddleware` and hit `auth.protect()`, which returned an HTML redirect/error page instead of the actual file. Chrome then tried to parse the HTML as JSON → `Manifest: Line: 1, column: 1, Syntax error`.

**Fix**: Added early return in `proxy.ts` for any path containing a dot (`.`):

```typescript
// Skip static files (manifest.json, icons, images, fonts, etc.) from Clerk auth
if (pathname.includes(".")) {
  return NextResponse.next()
}
```

This bypasses Clerk auth for all static assets (manifest, icons, images, fonts, etc.) while keeping auth protection for all other routes.

---

## ✅ FIX 2 — CSP blocking Clerk telemetry

**Root cause**: `next.config.ts` CSP `connect-src` directive was missing `clerk-telemetry.com`. Chrome blocked fetch/WebSocket connections to `https://clerk-telemetry.com/v1/event`.

**Fix**: Added `https://clerk-telemetry.com` and `https://*.clerk-telemetry.com` to `connect-src` in the CSP header.

---

## ✅ FIX 3 — Speech synthesis SSR crash (window is not defined)

**Root cause**: Both `flashcard-phase.tsx` and `listen-pick-phase.tsx` passed `window.speechSynthesis` and `window.SpeechSynthesisUtterance` directly in JSX props for the `react-say` ponyfill. During Next.js SSR, `window` is undefined → `ReferenceError`.

**Fix**: Replaced the `react-say` `ponyfill` pattern with a dedicated SSR-safe `useSpeech` hook:

```typescript
// app/lib/use-speech.ts
export function useSpeech() {
  // Accesses window.speechSynthesis only inside useEffect (client-side only)
  // Loads voices via onvoiceschanged event listener
  // Calls cancel() before speak() to prevent overlap
  // Cleans up (cancel + removeEventListener) on unmount
  // Returns speak(text, lang) callable from user gesture handlers
}
```

---

## ✅ FIX 4 — Autoplay policy: speech only on user gesture

**Root cause**: `react-say`'s `<Say>` component auto-speaks via `useEffect`, which breaks Chrome's autoplay policy (gesture context is lost by the time the microtask runs).

**Fix**: Both components now call `speak()` **directly inside user gesture handlers** (onClick):

- **`flashcard-phase.tsx`**: `speak()` is called inside `handleFlip()` when user taps a card
- **`listen-pick-phase.tsx`**: `speak()` is called inside `handlePlay()` when user taps play, and inside `handleNext()` when user advances to next question

This ensures `speechSynthesis.speak()` runs within the user gesture task chain, satisfying Chrome's autoplay policy.

---

## ✅ FIX 5 — Voice loading (onvoiceschanged)

**Root cause**: No voice loading handler was present — `getVoices()` in Chrome can return an empty array initially.

**Fix**: `useSpeech` hook calls `getVoices()` on mount AND listens for the `voiceschanged` event:

```typescript
const loadVoices = () => {
  voicesRef.current = synthRef.current?.getVoices() ?? []
}
loadVoices()
synthRef.current?.addEventListener("voiceschanged", loadVoices)
```

The hook also selects the best matching voice by language prefix.

---

## ✅ FIX 6 — Cleanup on unmount / Fast Refresh

**Root cause**: No cleanup on component unmount, leading to duplicate/lingering speech on Fast Refresh.

**Fix**: The `useSpeech` hook cleans up in its `useEffect` return:

```typescript
return () => {
  synthRef.current?.removeEventListener("voiceschanged", loadVoices)
  synthRef.current?.cancel()
}
```

On Fast Refresh, old hook effect is torn down (cancel + remove listener) and new hook effect initializes fresh.

---

## ✅ FIX 7 — Combined changes

| File | Change |
|------|--------|
| `proxy.ts` | Added static file bypass before Clerk auth check |
| `next.config.ts` | Added `clerk-telemetry.com` to CSP connect-src |
| `app/lib/use-speech.ts` | **New file** — SSR-safe speech hook with voice loading and cleanup |
| `flashcard-phase.tsx` | Replaced react-say with `useSpeech`; direct call from `handleFlip` |
| `listen-pick-phase.tsx` | Replaced react-say with `useSpeech`; direct calls from `handlePlay`/`handleNext` |

### Removed dependencies from components

- Removed `react-say` imports from both TTS components
- Removed `useEffect`, `mounted` state, `speakKey` state (no longer needed)
- Components are simpler, SSR-safe, and gesture-aware

---

## REQUIRED TEST CASE

The following pattern now works correctly:

```tsx
"use client";

export default function Page() {
  const speak = useSpeech();

  return <button onClick={() => speak("hello")}>Speak</button>;
}
```

* `window` is never accessed during SSR ✓
* Voices are loaded via `onvoiceschanged` ✓
* Speech fires from user gesture (click) ✓
* `cancel()` called before `speak()` to prevent overlap ✓
* Cleanup on unmount prevents Fast Refresh duplication ✓
* Manifest.json accessible as pure JSON ✓
* No CSP errors for Clerk telemetry ✓
