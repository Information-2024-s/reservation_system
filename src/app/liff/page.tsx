"use client";

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
          .then((userProfile: { displayName: string; userId: string; pictureUrl?: string; statusMessage?: string }) => {
            setProfile(userProfile);
          })
          .catch((err: unknown) => console.error("Error getting profile:", err));
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-red-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            初期化エラー
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            アプリの初期化に失敗しました
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (!liff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            読み込み中...
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            アプリを初期化しています
          </p>
        </div>
      </div>
    );
  }

  // LIFFのログイン状態を確認
  const isLiffLoggedIn = liff.isLoggedIn();
  
  // セッションが読み込み中の場合は待機
  if (isLiffLoggedIn && status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            認証中...
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            ログイン情報を確認しています
          </p>
        </div>
      </div>
    );
  }

  const isLoggedIn = isLiffLoggedIn && session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🎮 クラス展予約システム
          </h1>
        </div>

        {/* メインコンテンツカード */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          {isLoggedIn ? (
            // ログイン後の画面
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  ログイン完了！
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  こんにちは、<span className="font-semibold text-green-600 dark:text-green-400">
                    {profile?.displayName || "ゲスト"}
                  </span>さん
                </p>
              </div>

              <div className="space-y-4">
                <Link 
                  href="/liff/reserve"
                  className="block w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <span className="text-xl">📅</span>
                  <span className="ml-2 text-lg">予約ページへ進む</span>
                </Link>
                
                <Link 
                  href="/liff/how-to-reserve"
                  className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <span className="text-xl">📖</span>
                  <span className="ml-2 text-lg">予約の仕方を見る</span>
                </Link>
              </div>

              {/* ログアウトボタン（LINEアプリ内では非表示） */}
              {isInLineApp === false && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors text-sm"
                  >
                    ログアウト
                  </button>
                </div>
              )}
            </div>
          ) : (
            // ログイン前の画面
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  ログインが必要です
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  ゲーム予約システムをご利用いただくには<br />
                  LINEアカウントでのログインが必要です
                </p>
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <span className="text-xl">📱</span>
                <span className="ml-2 text-lg">LINEでログイン</span>
              </button>

              {isInLineApp === false && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    💡 外部ブラウザからもご利用いただけます
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© 2024年度入学 2I</p>
        </div>
      </div>
    </div>
  );
}
