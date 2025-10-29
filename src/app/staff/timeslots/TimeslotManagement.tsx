"use client";

import { useState, useEffect } from "react";
import { getAllTimeSlots } from "./actions";
import TimeslotTable from "./TimeslotTable";

type TimeSlot = Awaited<ReturnType<typeof getAllTimeSlots>>[number];

export default function TimeslotManagement() {
  const [timeslots, setTimeslots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeslots = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTimeSlots();
      console.log('TimeslotManagement: タイムスロット取得成功', data.length);
      setTimeslots(data);
    } catch (e) {
      console.error('TimeslotManagement: タイムスロット取得エラー', e);
      setError(e instanceof Error ? e.message : 'タイムスロットの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeslots();
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
            onClick={fetchTimeslots}
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
          <h2 className="text-xl font-bold text-gray-900">タイムスロット一覧</h2>
        </div>

        <TimeslotTable initialTimeslots={timeslots} />
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">総スロット数</h3>
          <p className="text-3xl font-bold text-gray-900">{timeslots.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">利用可能</h3>
          <p className="text-3xl font-bold text-green-600">
            {timeslots.filter((t) => t.status === "AVAILABLE").length}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">予約済み（編集不可）</h3>
          <p className="text-3xl font-bold text-blue-600">
            {timeslots.filter((t) => t.status === "BOOKED").length}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">利用不可</h3>
          <p className="text-3xl font-bold text-gray-600">
            {timeslots.filter((t) => t.status === "UNAVAILABLE").length}
          </p>
        </div>
      </div>
    </div>
  );
}
