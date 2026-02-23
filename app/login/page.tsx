"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createBrowserSupabase();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (authError) {
      setError("Bir hata oluştu. Lütfen tekrar dene.");
    } else {
      setSent(true);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#e5e5e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {sent ? (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 32, margin: 0 }}>📬</p>
          <p
            style={{
              fontSize: 18,
              fontWeight: 600,
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            Email&apos;ini kontrol et
          </p>
          <p style={{ fontSize: 14, color: "#666666", margin: 0 }}>
            {email} adresine giriş linki gönderdik.
          </p>
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: 360 }}>
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              margin: "0 0 8px",
              textAlign: "center",
            }}
          >
            FR Tutor
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#666666",
              textAlign: "center",
              margin: "0 0 32px",
            }}
          >
            Devam etmek için email adresini gir.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder="email@örnek.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                padding: "14px 16px",
                background: "#111111",
                border: "1px solid #2a2a2a",
                borderRadius: 10,
                color: "#e5e5e5",
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "#444444")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#2a2a2a")
              }
            />

            {error && (
              <p
                style={{
                  fontSize: 13,
                  color: "#cc4444",
                  marginTop: 10,
                  marginBottom: 0,
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: "block",
                width: "100%",
                marginTop: 12,
                height: 48,
                background: loading ? "#1e1e1e" : "#2a2a2a",
                border: "none",
                borderRadius: 10,
                color: loading ? "#555555" : "#ffffff",
                fontSize: 15,
                fontWeight: 500,
                cursor: loading ? "default" : "pointer",
              }}
            >
              {loading ? "Gönderiliyor…" : "Giriş linki gönder"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
