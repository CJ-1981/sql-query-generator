import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SQL Query Generator — AI-Powered Natural Language to SQL",
  description: "Convert natural language questions into SQL queries using AI. Supports multiple free-tier AI providers with automatic fallback.",
  keywords: ["SQL", "AI", "Natural Language", "Query Generator", "Database", "Gemini", "Groq", "OpenRouter"],
  authors: [{ name: "SQL Generator" }],
  icons: {
    icon: "/sql-icon.svg",
  },
  openGraph: {
    title: "SQL Query Generator — AI-Powered Natural Language to SQL",
    description: "Convert natural language questions into SQL queries using AI. Supports multiple free-tier AI providers with automatic fallback.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SQL Query Generator",
    description: "Convert natural language questions into SQL queries using AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
