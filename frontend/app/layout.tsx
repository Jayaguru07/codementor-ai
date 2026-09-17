import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CodeMentor AI — Intelligent Programming Learning & Debugging",
  description:
    "An AI-powered programming assistant that helps students learn, debug, and improve their code. Get instant error explanations, corrected code, and learning tips.",
  keywords: ["programming", "AI", "learning", "debugging", "code analysis"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen`}>
        <ThemeProvider>
          {/* Ambient background depth blobs */}
          <div className="bg-blobs" aria-hidden="true">
            <div className="bg-blob bg-blob-1" />
            <div className="bg-blob bg-blob-2" />
            <div className="bg-blob bg-blob-3" />
          </div>

          {/* Mobile header */}
          <Header />

          {/* Desktop sidebar */}
          <Sidebar />

          {/* Main content */}
          <main className="lg:pl-60 pt-14 lg:pt-0 min-h-screen relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
