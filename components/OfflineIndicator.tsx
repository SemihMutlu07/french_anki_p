"use client";

import { useEffect, useState } from "react";
import { getQueueSize } from "@/lib/offlineQueue";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    const update = () => {
      setIsOffline(!navigator.onLine);
      setQueueSize(getQueueSize());
    };

    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    // Poll queue size periodically
    const interval = setInterval(() => setQueueSize(getQueueSize()), 5000);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      clearInterval(interval);
    };
  }, []);

  if (!isOffline && queueSize === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[70] flex items-center justify-center gap-2 py-1.5 px-4 text-xs font-medium"
      style={{
        background: isOffline
          ? "linear-gradient(90deg, var(--fr-red), #b8000c)"
          : "linear-gradient(90deg, var(--fr-gold), #d4a804)",
        color: isOffline ? "#ffffff" : "var(--bg-elevated)",
      }}
    >
      <span>{isOffline ? "📡" : "🔄"}</span>
      <span>
        {isOffline
          ? "Çevrimdışı — veriler bağlantı gelince senkronize edilecek"
          : `${queueSize} işlem senkronize ediliyor…`}
      </span>
    </div>
  );
}
