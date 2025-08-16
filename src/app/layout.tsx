import type { Metadata } from "next";
import "./globals.css";
import LiffProvider from "./LiffProvider";

export const metadata: Metadata = {
  title: "顔シューティング（仮）",
  description: "2I 顔シューティング(仮)!! - 予約システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}
