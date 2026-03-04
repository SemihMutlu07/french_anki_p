import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import OnboardingParamHandler from "@/components/OnboardingParamHandler";
import OnboardingGuard from "@/components/OnboardingGuard";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FR Tutor",
  description: "French vocabulary tutor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} antialiased`}>
        {/* useSearchParams requires Suspense */}
        <Suspense fallback={null}>
          <OnboardingParamHandler />
        </Suspense>
        <OnboardingGuard />
        {children}
      </body>
    </html>
  );
}
