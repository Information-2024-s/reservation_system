"use client";

import { useState } from "react";
import { updateTimeSlotStatus } from "./actions";

type TimeSlot = {
  id: number;
  slotTime: string;
  slotType: "RESERVABLE" | "WALK_IN";
  status: "AVAILABLE" | "BOOKED" | "UNAVAILABLE";
  createdAt: string;
  updatedAt: string;
  hasReservation: boolean;
};

type TimeslotTableProps = {
  initialTimeslots: TimeSlot[];
};

export default function TimeslotTable({ initialTimeslots }: TimeslotTableProps) {
  const [timeslots, setTimeslots] = useState<TimeSlot[]>(initialTimeslots);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatusToggle = async (id: number, currentStatus: "AVAILABLE" | "BOOKED" | "UNAVAILABLE") => {
    setUpdatingId(id);
    setError(null);
    
    // AVAILABLE ↔ UNAVAILABLE の切り替え
    const newStatus = currentStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";

    try {
      const updated = await updateTimeSlotStatus(id, newStatus);
      
      setTimeslots((prev) =>
        prev.map((slot) => (slot.id === id ? updated : slot))
      );
    } catch (e) {
      console.error('ステータス更新エラー:', e);
      setError(e instanceof Error ? e.message : 'ステータスの更新に失敗しました');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: "AVAILABLE" | "BOOKED" | "UNAVAILABLE") => {
    if (status === "AVAILABLE") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          利用可能
        </span>
      );
    }
    if (status === "BOOKED") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          予約済み
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        利用不可
      </span>
    );
  };

  const getTypeBadge = (type: "RESERVABLE" | "WALK_IN") => {
    if (type === "RESERVABLE") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          予約可能
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        ウォークイン
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                スロット時刻
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイプ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成日時
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeslots.map((slot) => (
              <tr key={slot.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {slot.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDateTime(slot.slotTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getTypeBadge(slot.slotType)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getStatusBadge(slot.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(slot.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {slot.status === "BOOKED" ? (
                    <div className="flex flex-col gap-2">
                      <button
                        disabled
                        className="px-4 py-2 rounded-md font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
                        title="予約済みのため編集できません"
                      >
                        編集不可（予約済み）
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStatusToggle(slot.id, slot.status)}
                      disabled={updatingId === slot.id}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        slot.status === "AVAILABLE"
                          ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {updatingId === slot.id ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          更新中...
                        </span>
                      ) : slot.status === "AVAILABLE" ? (
                        "利用不可に変更"
                      ) : (
                        "利用可能に変更"
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {timeslots.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">タイムスロットがありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
