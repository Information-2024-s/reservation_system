import { ReactNode } from "react";
import Link from "next/link";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">スタッフ管理画面</h1>
            <nav className="flex gap-2">
              <Link
                href="/staff"
                className="px-4 py-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-700 font-medium"
              >
                ダッシュボード
              </Link>
              <Link
                href="/staff/reservations"
                className="px-4 py-2 rounded-lg transition-colors hover:bg-blue-100 text-blue-700 font-medium"
              >
                予約管理
              </Link>
              <Link
                href="/staff/scores"
                className="px-4 py-2 rounded-lg transition-colors hover:bg-green-100 text-green-700 font-medium"
              >
                スコア管理
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
