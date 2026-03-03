"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useAudioPlayer() {
  const [slowMode, setSlowMode] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioHintShown, setAudioHintShown] = useState(true); // default true avoids flash
  const [firstAudioAttempted, setFirstAudioAttempted] = useState(false);
  const lastTextRef = useRef<string>("");
  const slowModeRef = useRef(false);

  useEffect(() => {
    if (localStorage.getItem("fr-tutor-sound") === "0") setSoundEnabled(false);
    setAudioHintShown(localStorage.getItem("fr-tutor-audio-hint") === "1");
  }, []);

  const dismissHint = useCallback(() => {
    localStorage.setItem("fr-tutor-audio-hint", "1");
    setAudioHintShown(true);
  }, []);

  const play = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    lastTextRef.current = text;
    setFirstAudioAttempted(true);
    setAudioError(null);
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = slowModeRef.current ? 0.5 : 0.85;
    const voices = synth.getVoices();
    const frVoice = voices.find((v) => v.lang.toLowerCase().startsWith("fr"));
    if (frVoice) utterance.voice = frVoice;
    utterance.onerror = () => {
      setAudioError("Ses başlatılamadı. Ekrana dokunup tekrar dene.");
    };
    synth.speak(utterance);
  }, []);

  const retry = useCallback(() => {
    if (lastTextRef.current) play(lastTextRef.current);
  }, [play]);

  const toggleSlow = useCallback(() => {
    setSlowMode((v) => {
      slowModeRef.current = !v;
      return !v;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((v) => {
      const next = !v;
      localStorage.setItem("fr-tutor-sound", next ? "1" : "0");
      return next;
    });
  }, []);

  return {
    slowMode,
    soundEnabled,
    audioError,
    audioHintShown,
    firstAudioAttempted,
    play,
    retry,
    toggleSlow,
    toggleSound,
    dismissHint,
  };
}
