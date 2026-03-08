import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dev Roast - Get Your GitHub Profile Roasted",
  description:
    "Analyze your GitHub repos, get a developer archetype, roast score, and shareable card. Smart scoring, personality detection, and safe humor.",
  openGraph: {
    title: "Dev Roast - Get Your GitHub Profile Roasted",
    description:
      "Analyze your GitHub repos, get a developer archetype, roast score, and shareable card.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dev Roast - Get Your GitHub Profile Roasted",
    description:
      "Analyze your GitHub repos, get a developer archetype, roast score, and shareable card.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <TooltipProvider>
            <Suspense fallback={<div className="min-h-dvh" />}>
              {children}
            </Suspense>
            <Toaster position="bottom-center" />
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
