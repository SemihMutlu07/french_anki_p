import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import OnboardingParamHandler from "@/components/OnboardingParamHandler";
import OnboardingGuard from "@/components/OnboardingGuard";
import SupabaseConfigChecker from "@/components/SupabaseConfigChecker";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineIndicator from "@/components/OfflineIndicator";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#000091",
};

export const metadata: Metadata = {
  title: "FR Tutor",
  description: "Boğaziçi FR101 Fransızca Öğrenme",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FR Tutor",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        {/* useSearchParams requires Suspense */}
        <Suspense fallback={null}>
          <OnboardingParamHandler />
        </Suspense>
        <OnboardingGuard />
        <SupabaseConfigChecker />
        <ServiceWorkerRegistration />
        <InstallPrompt />
        <OfflineIndicator />
        {children}
      </body>
    </html>
  );
}
