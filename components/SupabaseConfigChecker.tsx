"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";

interface SupabaseConfigStatus {
  hasUrl: boolean;
  hasAnonKey: boolean;
  isValid: boolean;
  error?: string;
}

/**
 * Component to verify Supabase configuration.
 * Only shown in development mode.
 */
export function SupabaseConfigChecker() {
  const [status, setStatus] = useState<SupabaseConfigStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const hasUrl = !!url && url !== "" && url.includes("supabase.co");
    const hasAnonKey = !!anonKey && anonKey.length > 20;

    const configStatus: SupabaseConfigStatus = {
      hasUrl,
      hasAnonKey,
      isValid: hasUrl && hasAnonKey,
    };

    setStatus(configStatus);
    setIsChecking(false);

    // Try to connect to Supabase if config looks valid
    if (configStatus.isValid) {
      const supabase = createBrowserSupabase();
      
      // Try a simple operation to verify connection
      supabase.auth.getSession().then(({ error }) => {
        if (error) {
          setStatus((prev) =>
            prev
              ? {
                  ...prev,
                  error: error.message,
                  isValid: false,
                }
              : null
          );
        }
      });
    }
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  if (isChecking || !status) {
    return null;
  }

  if (status.isValid) {
    return null; // Don't show anything if config is valid
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        maxWidth: "320px",
        padding: "16px",
        background: "#FEF2F2",
        border: "1px solid #FCA5A5",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 9999,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <span style={{ fontSize: "20px" }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#991B1B",
            }}
          >
            Supabase Configuration Missing
          </p>
          <div style={{ fontSize: "12px", color: "#7F1D1D", lineHeight: 1.6 }}>
            {!status.hasUrl && (
              <p style={{ margin: "0 0 4px" }}>
                ❌ <code>NEXT_PUBLIC_SUPABASE_URL</code> is not set
              </p>
            )}
            {!status.hasAnonKey && (
              <p style={{ margin: "0 0 4px" }}>
                ❌ <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> is not set
              </p>
            )}
            {status.error && (
              <p style={{ margin: "4px 0 0", fontSize: "11px", fontFamily: "monospace" }}>
                Error: {status.error}
              </p>
            )}
          </div>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: "11px",
              color: "#991B1B",
            }}
          >
            Create a <code>.env.local</code> file in the project root. See{" "}
            <code>.env.local.example</code> for reference.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SupabaseConfigChecker;
