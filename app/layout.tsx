import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
        <div
          className="mobile-only"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "32px 24px",
            background: "#09090B",
          }}
        >
          <p style={{ fontSize: 40, marginBottom: 24 }}>🖥️</p>
          <p style={{ fontSize: 17, fontWeight: 600, color: "#F4F4F5", margin: "0 0 10px" }}>
            Şu an masaüstü için optimize edildi
          </p>
          <p style={{ fontSize: 14, color: "#71717A", margin: 0 }}>
            Mobil versiyon yakında geliyor.
          </p>
        </div>
        <div className="desktop-only">
          {children}
        </div>
      </body>
    </html>
  );
}
