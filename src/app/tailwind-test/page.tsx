import React from "react";

export default function TailwindTestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
      <h1 className="text-4xl font-bold text-white mb-6">
        Tailwind CSS テストページ
      </h1>
      <p className="text-lg text-white mb-4">
        このページの色・余白・フォントサイズが反映されていればTailwindは有効です。
      </p>
      <button className="px-6 py-2 bg-white text-blue-600 rounded shadow hover:bg-blue-100 transition">
        テストボタン
      </button>
    </div>
  );
}
