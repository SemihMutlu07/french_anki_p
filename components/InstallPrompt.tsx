"use client";

import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const VISIT_COUNT_KEY = "fr-tutor-visit-count";
const DISMISS_KEY = "fr-tutor-install-dismissed";
const DISMISS_DAYS = 7;
const MIN_VISITS = 3;
const AUTO_DISMISS_MS = 10_000;

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Track visits and check if we should show
  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Check dismiss timestamp
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    // Increment visit count
    const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10) + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(count));

    if (count < MIN_VISITS) return;

    // iOS: show manual instructions
    if (isIOS()) {
      setShowIOSInstructions(true);
      setShowBanner(true);
      return;
    }

    // Android/desktop: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (!showBanner) return;
    const timer = setTimeout(() => setShowBanner(false), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [showBanner]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShowBanner(false);
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-[60] md:bottom-6 md:left-auto md:right-6 md:max-w-sm rounded-2xl p-4"
      style={{
        background: "linear-gradient(135deg, #0B1220 0%, rgba(0, 0, 145, 0.9) 100%)",
        border: "1px solid rgba(227, 181, 5, 0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(12px)",
        animation: "slideUpIn 0.3s ease-out",
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">🇫🇷</span>
        <div className="flex-1 min-w-0">
          {showIOSInstructions ? (
            <>
              <p className="text-sm font-semibold" style={{ color: "#ffffff" }}>
                FR Tutor&apos;u ana ekranına ekle
              </p>
              <p className="text-xs mt-1" style={{ color: "#93C5FD" }}>
                Paylaş{" "}
                <span style={{ color: "#e3b505" }}>⬆️</span> → &quot;Ana
                Ekrana Ekle&quot;
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold" style={{ color: "#ffffff" }}>
                FR Tutor&apos;u ana ekranına ekle
              </p>
              <p className="text-xs mt-1" style={{ color: "#71717A" }}>
                Daha hızlı erişim
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        {!showIOSInstructions && (
          <button
            onClick={handleInstall}
            className="flex-1 rounded-xl py-2 text-sm font-semibold min-h-[44px]"
            style={{
              background: "linear-gradient(135deg, #e3b505, #FFD700)",
              color: "#0B1220",
              border: "none",
            }}
          >
            Ekle
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="rounded-xl py-2 px-4 text-sm font-medium min-h-[44px]"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            color: "#71717A",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          Sonra
        </button>
      </div>
    </div>
  );
}
