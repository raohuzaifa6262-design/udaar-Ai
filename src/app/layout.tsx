import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UdhaarAI — Smart Debt Tracker",
  description: "Track debts and credits intelligently with UdhaarAI. Know who owes you and who you owe, with AI-powered insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 15, 30, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
            },
          }}
        />
      </body>
    </html>
  );
}
