"use client";

import { useState, useEffect, createContext, useContext } from "react";
import type { Liff } from "@line/liff";
import type { ReactNode } from "react";

// Create a context for LIFF
type LiffContextType = {
  liff: Liff | null;
  liffError: string | null;
  isLoggedIn: boolean | null;
};

const LiffContext = createContext<LiffContextType>({
  liff: null,
  liffError: null,
  isLoggedIn: null,
});

export const useLiff = () => useContext(LiffContext);

export default function LiffProvider({ children }: { children: ReactNode }) {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Execute liff.init() when the app is initialized
  useEffect(() => {
    // to avoid `window is not defined` error
    import("@line/liff")
      .then((liff) => liff.default)
      .then((liff) => {
        console.log("LIFF init...");
        console.log(process.env.NEXT_PUBLIC_LIFF_ID);
        liff
          .init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
          .then(() => {
            console.log("LIFF init succeeded.");
            setLiffObject(liff);
            setIsLoggedIn(liff.isLoggedIn());
          })
          .catch((error: Error) => {
            console.log("LIFF init failed.");
            setLiffError(error.toString());
          });
      });
  }, []);

  // 公式アカウントのURL（適宜変更してください）
  const officialAccountUrl = "https://lin.ee/xxxxxx";

  return (
    <LiffContext.Provider value={{ liff: liffObject, liffError, isLoggedIn }}>
      {/* ログイン状態が未判定またはLIFF初期化中は何も表示しない */}
      {isLoggedIn === false ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(255,255,255,0.95)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>LINEログインが必要です。</p>
          <a
            href={officialAccountUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: "16px",
              padding: "12px 24px",
              background: "#06C755",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            公式アカウントへ
          </a>
        </div>
      ) : null}
      {children}
    </LiffContext.Provider>
  );
}
