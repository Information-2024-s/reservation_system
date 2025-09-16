"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalContext } from "@/contexts/GlobalContexts";
import { Liff } from "@line/liff";
import { useEffect, useState } from "react";
import { signIn, signOut, SessionProvider } from "next-auth/react";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);

  const handleLogout = async () => {
    if (!liffObject) return;
    
    // NextAuthのログアウトを先に実行
    await signOut({ redirect: false });
    
    // LIFFのログアウト
    if (liffObject.isLoggedIn()) {
      liffObject.logout();
    }
    
    // ページリロード
    window.location.reload();
  };

  // Execute liff.init() when the app is initialized
  useEffect(() => {
    // to avoid `window is not defined` error
      import("@line/liff")
      .then((liff) => liff.default)
      .then((liff) => {
        console.log("LIFF init...");
        liff
          .init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
          .then(() => {
            console.log("LIFF init succeeded.");
            setLiffObject(liff);

            // LIFFでログイン済みの場合、NextAuthでログイン
            if (liff.isLoggedIn()) {
              const accessToken = liff.getAccessToken();
              if (accessToken) {
                // NextAuth.js (v5) の signIn を実行
                console.log("Signing in with access token:", accessToken);
                signIn("line-liff", {
                  accessToken, // authorize関数に渡すデータ
                  redirect: false, // ページ遷移なし
                });
              }
            }
          })
          .catch((error: Error) => {
            console.log("LIFF init failed.");
            setLiffError(error.toString());
          });
      });
  }, []);

  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <GlobalContext.Provider
            value={{ liff: liffObject, liffError: liffError, handleLogout: handleLogout }}
          >
            {children}
          </GlobalContext.Provider>
        </SessionProvider>
      </body>
    </html>
  );
}
