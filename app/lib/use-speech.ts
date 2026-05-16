"use client"

import { useCallback, useEffect, useRef } from "react"

export function useSpeech() {
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return

    synthRef.current = window.speechSynthesis

    const loadVoices = () => {
      voicesRef.current = synthRef.current?.getVoices() ?? []
    }

    loadVoices()
    synthRef.current?.addEventListener("voiceschanged", loadVoices)

    return () => {
      synthRef.current?.removeEventListener("voiceschanged", loadVoices)
      synthRef.current?.cancel()
    }
  }, [])

  const speak = useCallback((text: string, lang = "en-US") => {
    const synth = synthRef.current
    if (!synth || !text) return

    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9

    const voice = voicesRef.current.find((v) => v.lang.startsWith(lang.split("-")[0]))
    if (voice) utterance.voice = voice

    synth.speak(utterance)
  }, [])

  return speak
}
