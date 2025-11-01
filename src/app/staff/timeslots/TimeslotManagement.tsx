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

  // スロット時刻でソートして、現在/過去で分割
  const getSortedAndSplitTimeslots = () => {
    const now = new Date();
    
    // スロット時刻でソート（昇順）
    const sorted = [...timeslots].sort((a, b) => {
      const timeA = new Date(a.slotTime).getTime();
      const timeB = new Date(b.slotTime).getTime();
      return timeA - timeB;
    });

    // 現在と過去で分割
    const current = sorted.filter(slot => new Date(slot.slotTime) >= now);
    const past = sorted.filter(slot => new Date(slot.slotTime) < now);

    return { current, past };
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

        {/* 現在と今後のスロット */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">現在と今後のスロット</h3>
          <TimeslotTable initialTimeslots={getSortedAndSplitTimeslots().current} />
        </div>

        {/* 過去のスロット */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">過去のスロット</h3>
          {getSortedAndSplitTimeslots().past.length > 0 ? (
            <TimeslotTable initialTimeslots={getSortedAndSplitTimeslots().past} />
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">過去のスロットはありません</p>
            </div>
          )}
        </div>
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

      {/* 現在と今後のスロットの統計 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">現在と今後のスロット統計</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-600 mb-2">総数</h4>
            <p className="text-2xl font-bold text-blue-900">{getSortedAndSplitTimeslots().current.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-600 mb-2">利用可能</h4>
            <p className="text-2xl font-bold text-green-900">
              {getSortedAndSplitTimeslots().current.filter((t) => t.status === "AVAILABLE").length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-purple-600 mb-2">予約済み</h4>
            <p className="text-2xl font-bold text-purple-900">
              {getSortedAndSplitTimeslots().current.filter((t) => t.status === "BOOKED").length}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-600 mb-2">利用不可</h4>
            <p className="text-2xl font-bold text-red-900">
              {getSortedAndSplitTimeslots().current.filter((t) => t.status === "UNAVAILABLE").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
