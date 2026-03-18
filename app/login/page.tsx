"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";
import { enableGuestMode } from "@/lib/guestProgress";

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
        background: "var(--bg-subtle)",
        borderRadius: 8,
        color: "var(--text-primary)",
        fontSize: 14,
        textDecoration: "none",
      }}
    >
      {label}
      <span style={{ color: "var(--text-muted)" }}>→</span>
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
        background: "var(--bg-subtle)",
        border: "none",
        borderRadius: 8,
        color: "var(--text-primary)",
        fontSize: 14,
        cursor: "pointer",
        textAlign: "left",
        boxSizing: "border-box",
      }}
    >
      {copied ? "Kopyalandı ✓" : email}
      {!copied && (
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Kopyala</span>
      )}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const supabaseConfigured =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sent) return;

    // Test bypass: "admin" → skip auth, enter as guest
    if (email.trim().toLowerCase() === "admin") {
      enableGuestMode();
      router.push("/");
      return;
    }

    if (!supabaseConfigured) {
      setError("Supabase yapılandırılmamış. Env değişkenlerini kontrol et.");
      return;
    }

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
      console.error("[auth] signInWithOtp failed:", authError.message, authError);
      setError(`Hata: ${authError.message}`);
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
        background: "var(--bg-muted)",
        border: "none",
        color: "var(--text-muted)",
        cursor: "default",
      };
    }
    return {
      background: "var(--bg-subtle)",
      border: "none",
      color: "var(--text-primary)",
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
        background: "var(--bg-base)",
        color: "var(--text-primary)",
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
            color: "var(--text-muted)",
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
            type="text"
            required
            disabled={sent || loading}
            placeholder="email@örnek.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "14px 16px",
              background: "var(--bg-muted)",
              border: "1px solid var(--text-ghost)",
              borderRadius: 10,
              color: sent ? "var(--text-faint)" : "var(--text-primary)",
              fontSize: 16,
              outline: "none",
              boxSizing: "border-box",
              opacity: sent ? 0.5 : 1,
            }}
            onFocus={(e) => {
              if (!sent) e.currentTarget.style.borderColor = "var(--text-muted)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--text-ghost)";
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
              color: "var(--text-muted)",
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
              border: "1px solid var(--bg-subtle)",
              background: "var(--bg-muted)",
              padding: 16,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
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
                color: "var(--text-faint)",
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
