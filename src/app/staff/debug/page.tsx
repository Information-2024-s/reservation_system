import { prisma } from "@/lib/prisma";

export default async function StaffDebugPage() {
  let dbStatus = "Unknown";
  let reservationCount = 0;
  let error = null;
  let reservations = null;

  try {
    // データベース接続テスト
    await prisma.$connect();
    dbStatus = "Connected";

    // 予約数をカウント
    reservationCount = await prisma.reservation.count();

    // 予約を取得
    reservations = await prisma.reservation.findMany({
      include: {
        timeSlot: true,
      },
      take: 5, // 最初の5件のみ
    });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    dbStatus = "Error";
  } finally {
    await prisma.$disconnect();
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">スタッフページ - デバッグ情報</h1>

      <div className="space-y-4">
        {/* データベース接続状態 */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-semibold mb-2">データベース接続状態</h2>
          <p className={dbStatus === "Connected" ? "text-green-600" : "text-red-600"}>
            {dbStatus}
          </p>
        </div>

        {/* エラー情報 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="font-semibold text-red-900 mb-2">エラー</h2>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {/* 予約数 */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-semibold mb-2">総予約数</h2>
          <p className="text-3xl font-bold">{reservationCount}</p>
        </div>

        {/* 予約データサンプル */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-semibold mb-2">予約データサンプル（最大5件）</h2>
          {reservations && reservations.length > 0 ? (
            <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto">
              {JSON.stringify(reservations, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">予約データがありません</p>
          )}
        </div>

        {/* 環境変数チェック */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-semibold mb-2">環境変数</h2>
          <ul className="text-sm space-y-1">
            <li>
              DATABASE_URL: {process.env.DATABASE_URL ? "✅ 設定済み" : "❌ 未設定"}
            </li>
            <li>
              STAFF_USERNAME: {process.env.STAFF_USERNAME ? "✅ 設定済み" : "❌ 未設定"}
            </li>
            <li>
              STAFF_PASSWORD: {process.env.STAFF_PASSWORD ? "✅ 設定済み" : "❌ 未設定"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
