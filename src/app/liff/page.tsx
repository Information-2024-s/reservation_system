"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useGlobalContext } from "@/hooks/useGlobalContexts";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { liff, liffError, handleLogout } = useGlobalContext();
  const [profile, setProfile] = useState<{ displayName?: string } | null>(null);
  const [isInLineApp, setIsInLineApp] = useState<boolean | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (liff) {
      // LINEアプリ内かどうかを判定
      setIsInLineApp(liff.isInClient());

      // ログイン済みの場合はプロフィールを取得
      if (liff.isLoggedIn()) {
        liff
          .getProfile()
          .then((userProfile: any) => {
            setProfile(userProfile);
          })
          .catch((err: any) => console.error("Error getting profile:", err));
      }
    }
  }, [liff]);

  const handleLogin = () => {
    if (!liff) return;

    if (liff.isInClient()) {
      // LINEアプリ内の場合は通常のログイン
      liff.login();
    } else {
      // 外部ブラウザの場合は外部ブラウザでログイン
      liff.login({
        redirectUri: window.location.href
      });
    }
  };

  if (liffError) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>LIFF initialization failed</h2>
        <p><code>{liffError}</code></p>
      </div>
    );
  }

  if (!liff) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Loading LIFF...</h2>
      </div>
    );
  }

  const isLoggedIn = liff.isLoggedIn();

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>予約システム - LIFFアプリ</h2>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>LIFF Status</h3>
        <p>LIFF initialized: {liff ? "Yes" : "No"}</p>
        <p>Environment: {isInLineApp === null ? "Checking..." : isInLineApp ? "LINE App" : "External Browser"}</p>
        <p>Logged in: {isLoggedIn ? "Yes" : "No"}</p>
        {isLoggedIn && profile && (
          <div style={{ marginTop: '10px' }}>
            <p>User ID: {liff.getDecodedIDToken()?.sub}</p>
            <p>Display Name: {profile.displayName || "No name"}</p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>NextAuth Session</h3>
        <p>Status: {status}</p>
        {session && (
          <div style={{ marginTop: '10px' }}>
            <pre>{JSON.stringify(session, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* ログイン状態に応じたメインコンテンツ */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        backgroundColor: (isLoggedIn) ? '#d4edda' : '#f8d7da',
        border: `1px solid ${(isLoggedIn) ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '5px',
        textAlign: 'center'
      }}>
        {(isLoggedIn) ? (
          <div>
            <h3 style={{ color: '#155724', marginBottom: '15px' }}>
              ログイン完了！
            </h3>
            <p style={{ color: '#155724', marginBottom: '20px' }}>
              {profile?.displayName || "ゲスト"}さん、こんにちは！<br />
              予約システムをご利用いただけます。
            </p>
            <Link 
              href="/liff/reserve"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#00B900',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              📅 予約ページへ進む
            </Link>
          </div>
        ) : (
          <div>
            <h3 style={{ color: '#721c24', marginBottom: '15px' }}>
              ログインが必要です
            </h3>
            <p style={{ color: '#721c24', marginBottom: '20px' }}>
              予約システムをご利用いただくには、<br />
              LINEアカウントでのログインが必要です。
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleLogin}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#00B900',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                🔐 LIFF Login
                {isInLineApp === false && " (External Browser)"}
              </button>
              
            </div>
          </div>
        )}
      </div>

      {/* ログイン/ログアウトボタン */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        {(isLoggedIn) ? (
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ログアウト
          </button>
        ) : null}
      </div>

      {isInLineApp === false && (
        <div style={{ padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '5px', marginBottom: '20px' }}>
          <p><strong>外部ブラウザで実行中</strong></p>
          <p>LINEアプリ外でも利用できます。ログインボタンをクリックしてLINEログインを行ってください。</p>
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a
          href="https://developers.line.biz/ja/docs/liff/"
          target="_blank"
          rel="noreferrer"
          style={{ color: '#00B900', textDecoration: 'none', fontSize: '14px' }}
        >
          LIFF Documentation →
        </a>
      </div>
    </div>
  );
}
