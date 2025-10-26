import Link from "next/link";

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">スタッフダッシュボード</h2>
        <p className="text-gray-600">管理機能にアクセスできます</p>
      </div>

      {/* 機能カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 予約管理カード */}
        <Link href="/staff/reservations">
          <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="ml-4 text-xl font-bold text-gray-900">予約管理</h3>
            </div>
            <p className="text-gray-600 mb-4">
              予約の確認、呼び出し、削除などの操作を行います
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              <span>予約一覧を見る</span>
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </Link>

        {/* スコア管理カード */}
        <Link href="/staff/scores">
          <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 rounded-lg p-3">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="ml-4 text-xl font-bold text-gray-900">スコア管理</h3>
            </div>
            <p className="text-gray-600 mb-4">
              チームスコアとプレイヤースコアの作成・管理を行います
            </p>
            <div className="flex items-center text-green-600 font-medium">
              <span>スコア管理を開く</span>
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* 追加情報 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-2">📌 ご利用ガイド</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>予約管理では、予約者の呼び出しや不在マークが可能です</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>スコア管理では、チームとプレイヤーのスコアを記録できます</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>各ページで最新データを取得するには「更新」ボタンを使用してください</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
