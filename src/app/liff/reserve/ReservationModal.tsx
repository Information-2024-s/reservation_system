import React from "react";
import { TimeSlot, convertUTCToJST, formatJSTTime } from "./types";

interface ReservationModalProps {
  isOpen: boolean;
  selectedTimeSlot: TimeSlot | null;
  selectedDate: string;
  profile: { displayName?: string } | null;
  availableDates: { value: string; label: string }[];
  onClose: () => void;
  onNext: () => void;
}

export default function ReservationModal({
  isOpen,
  selectedTimeSlot,
  selectedDate,
  profile,
  availableDates,
  onClose,
  onNext,
}: ReservationModalProps) {
  if (!isOpen || !selectedTimeSlot) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl">
        <h3 className="text-xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
          予約確認
        </h3>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              予約日時
            </div>
            <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
              {availableDates.find((d) => d.value === selectedDate)?.label}
            </div>
            <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
              {formatJSTTime(convertUTCToJST(selectedTimeSlot.slotTime))}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              予約者
            </div>
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {profile?.displayName || "ゲスト"}さん
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="text-sm text-blue-600 dark:text-blue-300 mb-1">
              予約種別
            </div>
            <div className="font-bold text-blue-800 dark:text-blue-200">
              {selectedTimeSlot.slotType === "RESERVABLE"
                ? "事前予約枠"
                : "当日受付枠"}
            </div>
          </div>

          {/* 予約について */}
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
            <div className="text-sm text-green-600 dark:text-green-300 mb-1">
              📝 予約について
            </div>
            <div className="text-sm text-green-800 dark:text-green-200">
              この予約を確定すると、他の時間枠の予約はできなくなります。
              （1人につき1枠まで）
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 dark:bg-gray-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onNext}
            className="flex-1 bg-green-500 dark:bg-green-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
          >
            予約手続きへ
          </button>
        </div>
      </div>
    </div>
  );
}
