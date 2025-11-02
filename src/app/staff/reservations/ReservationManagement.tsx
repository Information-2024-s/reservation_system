"use client";

import { useState, useEffect } from "react";
import { getAllReservations } from "./actions";
import ReservationTable from "./ReservationTable";

type Reservation = Awaited<ReturnType<typeof getAllReservations>>[number];

export default function ReservationManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllReservations();
      console.log("ReservationManagement: 予約取得成功", data.length);
      setReservations(data);
    } catch (e) {
      console.error("ReservationManagement: 予約取得エラー", e);
      setError(e instanceof Error ? e.message : "予約の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-2">エラー</h2>
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-red-600 mt-2">
            サーバーログを確認してください。データベース接続を確認してください。
          </p>
          <button
            onClick={fetchReservations}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">予約一覧</h2>
        </div>

        <ReservationTable
          initialReservations={reservations}
          onRefresh={fetchReservations}
        />
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">総予約数</h3>
          <p className="text-3xl font-bold text-gray-900">
            {reservations.length}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            今後の予約（10分以内含む）
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {
              reservations.filter((r) => {
                const now = new Date();
                const tenMinutesFromNow = new Date(
                  now.getTime() + 10 * 60 * 1000
                );
                const reservationTime = new Date(
                  r.timeSlot?.slotTime || r.startTime
                );
                return (
                  reservationTime >= now ||
                  (reservationTime >= now &&
                    reservationTime <= tenMinutesFromNow)
                );
              }).length
            }
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">過去の予約</h3>
          <p className="text-3xl font-bold text-gray-600">
            {
              reservations.filter(
                (r) =>
                  new Date(r.timeSlot?.slotTime || r.startTime) < new Date()
              ).length
            }
          </p>
        </div>
      </div>
    </div>
  );
}
