"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";

function MailButton({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        background: "#27272A",
        borderRadius: 8,
        color: "#E4E4E7",
        fontSize: 14,
        textDecoration: "none",
      }}
    >
      {label}
      <span style={{ color: "#71717A" }}>→</span>
    </a>
  );
}

function CopyButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "12px 14px",
        background: "#27272A",
        border: "none",
        borderRadius: 8,
        color: "#E4E4E7",
        fontSize: 14,
        cursor: "pointer",
        textAlign: "left",
        boxSizing: "border-box",
      }}
    >
      {copied ? "Kopyalandı ✓" : email}
      {!copied && (
        <span style={{ color: "#71717A", fontSize: 12 }}>Kopyala</span>
      )}
    </button>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sent) return;
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

  const btnStyle = (): React.CSSProperties => {
    if (sent) {
      return {
        background: "#78350F",
        border: "1px solid #D97706",
        color: "#FDE68A",
        cursor: "default",
      };
    }
    if (loading) {
      return {
        background: "#18181B",
        border: "none",
        color: "#71717A",
        cursor: "default",
      };
    }
    return {
      background: "#27272A",
      border: "none",
      color: "#F4F4F5",
      cursor: "pointer",
    };
  };

  const btnLabel = sent
    ? "Mail kutunu kontrol et →"
    : loading
    ? "Gönderiliyor…"
    : "Giriş linki gönder";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#09090B",
        color: "#F4F4F5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
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
            color: "#71717A",
            textAlign: "center",
            margin: "0 0 32px",
          }}
        >
          {sent
            ? `${email} adresine link gönderdik.`
            : "Devam etmek için email adresini gir."}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            disabled={sent || loading}
            placeholder="email@örnek.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "14px 16px",
              background: "#18181B",
              border: "1px solid #3F3F46",
              borderRadius: 10,
              color: sent ? "#52525B" : "#F4F4F5",
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
              opacity: sent ? 0.5 : 1,
            }}
            onFocus={(e) => {
              if (!sent) e.currentTarget.style.borderColor = "#71717A";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#3F3F46";
            }}
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
            disabled={loading || sent}
            style={{
              display: "block",
              width: "100%",
              marginTop: 12,
              height: 48,
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 500,
              transition: "background 0.2s, color 0.2s",
              ...btnStyle(),
            }}
          >
            {btnLabel}
          </button>
        </form>

        {loading && (
          <p
            style={{
              fontSize: 12,
              color: "#71717A",
              textAlign: "center",
              marginTop: 12,
            }}
          >
            Bu işlem birkaç saniye sürebilir…
          </p>
        )}

        {sent && (
          <div
            style={{
              marginTop: 24,
              borderRadius: 12,
              border: "1px solid #27272A",
              background: "#18181B",
              padding: 16,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "#71717A",
                margin: "0 0 12px",
              }}
            >
              Mail uygulamanı aç:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <MailButton label="Mail uygulaması" href="mailto:" />
              <MailButton label="Gmail" href="https://mail.google.com" />
              <MailButton
                label="Outlook"
                href="https://outlook.live.com/mail/"
              />
              <MailButton label="Yahoo Mail" href="https://mail.yahoo.com" />
              <CopyButton email={email} />
            </div>
            <p
              style={{
                fontSize: 12,
                color: "#52525B",
                textAlign: "center",
                margin: "12px 0 0",
              }}
            >
              Gelmediyse spam klasörünü kontrol et.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
