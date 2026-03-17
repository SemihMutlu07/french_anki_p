"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useAudioPlayer() {
  const [slowMode, setSlowMode] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioHintShown, setAudioHintShown] = useState(true);
  const [firstAudioAttempted, setFirstAudioAttempted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastTextRef = useRef<string>("");
  const slowModeRef = useRef(false);
  const voicesLoadedRef = useRef(false);
  const retryCountRef = useRef(0);

  // Load voices with retry for Chrome
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesLoadedRef.current = true;
      }
    };

    loadVoices();
    
    // Chrome loads voices asynchronously
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      // Retry a few times for Chrome
      const intervals = [100, 500, 1000];
      intervals.forEach((delay) => {
        setTimeout(loadVoices, delay);
      });
    }

    if (localStorage.getItem("fr-tutor-sound") === "0") setSoundEnabled(false);
    setAudioHintShown(localStorage.getItem("fr-tutor-audio-hint") === "1");
  }, []);

  const dismissHint = useCallback(() => {
    localStorage.setItem("fr-tutor-audio-hint", "1");
    setAudioHintShown(true);
  }, []);

  const play = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setAudioError("Tarayıcın ses özelliğini desteklemiyor.");
      return;
    }
    
    lastTextRef.current = text;
    setFirstAudioAttempted(true);
    setAudioError(null);
    setIsPlaying(true);
    retryCountRef.current = 0;

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = slowModeRef.current ? 0.5 : 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Find French voice
    const voices = synth.getVoices();
    const frVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith("fr") && 
      (v.name.toLowerCase().includes("french") || v.name.toLowerCase().includes("fr"))
    ) || voices.find((v) => v.lang.toLowerCase().startsWith("fr"));
    
    if (frVoice) utterance.voice = frVoice;

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (e) => {
      setIsPlaying(false);
      console.error("Speech synthesis error:", e);
      
      // Auto-retry once
      if (retryCountRef.current === 0) {
        retryCountRef.current = 1;
        setTimeout(() => {
          synth.cancel();
          synth.speak(utterance);
        }, 100);
        return;
      }
      
      setAudioError("Ses oynatılamadı. Tekrar dene.");
    };

    // Speak with timeout fallback
    synth.speak(utterance);

    // Timeout in case onerror doesn't fire
    setTimeout(() => {
      if (isPlaying) {
        setIsPlaying(false);
      }
    }, 5000);
  }, [isPlaying]);

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
    isPlaying,
    play,
    retry,
    toggleSlow,
    toggleSound,
    dismissHint,
  };
}
