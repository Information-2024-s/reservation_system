"use client";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

export default function LiffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProviders enableLiff>
      <div className="min-h-screen">{children}</div>
    </AppProviders>
  );
}
