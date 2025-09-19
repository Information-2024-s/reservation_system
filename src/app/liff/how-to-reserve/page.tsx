"use client";

import Link from "next/link";
import { useState } from "react";

export default function HowToReservePage() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "ログイン",
      icon: "🔐",
      content: (
        <div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            まず、LINEアカウントでログインします。
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 LINEアプリ内、または外部ブラウザからでもご利用いただけます
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "日付・時間を選択",
      icon: "📅",
      content: (
        <div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            予約したい日付と時間帯を選択します。
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>利用可能な日付から選択</li>
            <li>10時台〜16時台の中から時間帯を選択</li>
            <li>「タイムスロットを検索」をクリック</li>
          </ul>
        </div>
      )
    },
    {
      id: 3,
      title: "タイムスロットを選択",
      icon: "⏰",
      content: (
        <div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            空いているタイムスロットから予約したい時間を選択します。
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-md bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">予約可能</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-md bg-gray-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">予約不可（当日枠）</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-md bg-red-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">他の方が予約済み</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "予約方法を選択",
      icon: "✅",
      content: (
        <div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            2つの予約方法から選択できます。
          </p>
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                今すぐチーム情報を登録して予約
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                チーム名とメンバー情報を入力して予約完了。当日の受付がスムーズです。
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                チーム情報は後で登録（予約のみ確定）
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                まず予約を確保してから、後でチーム情報を追加できます。
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "予約完了",
      icon: "🎉",
      content: (
        <div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            予約が完了しました！
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>予約確認画面で詳細を確認できます</li>
            <li>チーム情報の追加・編集が可能です</li>
            <li>予約のキャンセルも可能です</li>
            <li>予約の時間が近づくとLINEで通知が来ます</li>
          </ul>
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ 過去の予約は削除できません。未来の予約のみ削除可能です。
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/liff"
            className="text-purple-600 dark:text-purple-400 hover:underline mb-4 inline-block"
          >
            ← 戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            📖 予約の仕方
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            クラス展予約システムの使い方の説明
          </p>
        </div>

        {/* ステップナビゲーション */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeStep === step.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{step.icon}</span>
                <span className="hidden sm:inline">ステップ{step.id}</span>
              </button>
            ))}
          </div>

          {/* アクティブなステップの内容 */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">{steps[activeStep - 1].icon}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              ステップ{activeStep}: {steps[activeStep - 1].title}
            </h2>
            <div className="max-w-2xl mx-auto">
              {steps[activeStep - 1].content}
            </div>
          </div>

          {/* ナビゲーションボタン */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
              className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              ← 前へ
            </button>
            
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {activeStep} / {steps.length}
            </span>
            
            <button
              onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
              disabled={activeStep === steps.length}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
            >
              次へ →
            </button>
          </div>
        </div>

        {/* よくある質問 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            💡 よくある質問
          </h3>
          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                Q: 予約は何個まで取れますか？
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                A: 1人につき予約は1つまでです。過去の予約は制限に含まれません。
              </p>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                Q: 予約不可（当日枠）とはなんですか？
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                A: 予約不可（当日枠）は、事前予約ができない時間枠です。当日受付での利用が可能ですが、事前に予約することはできません。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                Q: 予約をキャンセルしたい場合は？
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                A: 予約確認画面から「予約を削除」ボタンでキャンセルできます。ただし、過去の予約は削除できません。
              </p>
            </div>
          </div>
        </div>

        {/* CTAボタン */}
        <div className="text-center">
          <Link
            href="/liff/reserve"
            className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <span className="text-xl mr-2">📅</span>
            実際に予約してみる
          </Link>
        </div>
      </div>
    </div>
  );
}