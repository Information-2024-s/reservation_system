import React, { useState, useEffect, useCallback } from "react";
import { TimeSlot, convertUTCToJST, formatJSTTime } from "./types";

interface UserReservation {
  reservation: {
    id: number;
    teamId: number | null;
    lineUserId: string | null;
    startTime: string;
    createdAt: string;
    updatedAt: string;
    timeSlotId: number;
  };
  team: {
    id: number;
    name: string;
    headcount: number;
    members: Array<{
      id: number;
      name: string;
    }>;
  } | null;
  timeSlot: {
    id: number;
    slotTime: string;
    status: string;
  } | null;
}

interface ReservationEditModalProps {
  userReservation: UserReservation;
  isOpen: boolean;
  onClose: () => void;
  onSave: (reservationId: number, newTimeSlotId: number) => void;
  isSaving: boolean;
}

export default function ReservationEditModal({
  userReservation,
  isOpen,
  onClose,
  onSave,
  isSaving,
}: ReservationEditModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | null>(
    null
  );
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 利用可能な日付
  const availableDates = [
    { value: "2025-11-01", label: "2025年11月1日" },
    { value: "2025-11-02", label: "2025年11月2日" },
  ];

  // 利用可能な時間帯（10時台から16時台まで）
  const availableHours = [
    { value: 10, label: "10時台 (10:00-10:59)" },
    { value: 11, label: "11時台 (11:00-11:59)" },
    { value: 12, label: "12時台 (12:00-12:59)" },
    { value: 13, label: "13時台 (13:00-13:59)" },
    { value: 14, label: "14時台 (14:00-14:59)" },
    { value: 15, label: "15時台 (15:00-15:59)" },
    { value: 16, label: "16時台 (16:00-16:59)" },
  ];

  // TimeSlots APIからデータを取得
  const fetchTimeSlots = useCallback(
    async (date: string, hour: number) => {
      setIsLoadingTimeSlots(true);
      setError(null);
      setSelectedTimeSlotId(null);

      try {
        const params = new URLSearchParams({
          date,
          startHour: hour.toString(),
          endHour: hour.toString(),
        });
        const response = await fetch(`/api/timeslots?${params}`);
        if (response.ok) {
          const data: TimeSlot[] = await response.json();
          // 現在の予約以外の利用可能なタイムスロットをフィルタ
          const availableSlots = data.filter(
            (slot) =>
              slot.status === "AVAILABLE" ||
              slot.id === userReservation.timeSlot?.id
          );
          setTimeSlots(availableSlots);
        } else {
          throw new Error("タイムスロットの取得に失敗しました");
        }
      } catch (err) {
        console.error("Error fetching time slots:", err);
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setIsLoadingTimeSlots(false);
      }
    },
    [userReservation.timeSlot?.id]
  );

  // 日付・時間が選択されたらタイムスロットを取得
  useEffect(() => {
    if (selectedDate && selectedHour !== null) {
      fetchTimeSlots(selectedDate, selectedHour);
    }
  }, [selectedDate, selectedHour, fetchTimeSlots]);

  const handleSave = () => {
    if (selectedTimeSlotId) {
      onSave(userReservation.reservation.id, selectedTimeSlotId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              予約変更
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 現在の予約情報 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              現在の予約
            </h3>
            {userReservation.timeSlot && (
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {formatJSTTime(
                  convertUTCToJST(userReservation.timeSlot.slotTime)
                )}
              </p>
            )}
            {userReservation.team && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                チーム: {userReservation.team.name} (
                {userReservation.team.headcount}人)
              </p>
            )}
          </div>

          {/* 新しい日付選択 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              新しい日付を選択
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">日付を選択してください</option>
              {availableDates.map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
          </div>

          {/* 新しい時間帯選択 */}
          {selectedDate && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                新しい時間帯を選択
              </label>
              <select
                value={selectedHour || ""}
                onChange={(e) =>
                  setSelectedHour(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">時間帯を選択してください</option>
                {availableHours.map((hour) => (
                  <option key={hour.value} value={hour.value}>
                    {hour.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* タイムスロット選択 */}
          {selectedDate && selectedHour !== null && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                具体的な時間を選択
              </label>

              {isLoadingTimeSlots ? (
                <div className="flex items-center justify-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-500"
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
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    タイムスロットを読み込み中...
                  </span>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <p className="text-yellow-700 dark:text-yellow-300">
                    この時間帯には利用可能なスロットがありません。
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {timeSlots.map((slot) => {
                    const isCurrentSlot =
                      slot.id === userReservation.timeSlot?.id;
                    const isSelected = selectedTimeSlotId === slot.id;

                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedTimeSlotId(slot.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : isCurrentSlot
                            ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                            : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                              {formatJSTTime(convertUTCToJST(slot.slotTime))}
                            </p>
                            {isCurrentSlot && (
                              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                                現在の予約時間
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="text-blue-500">
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={
                !selectedTimeSlotId ||
                selectedTimeSlotId === userReservation.timeSlot?.id ||
                isSaving
              }
              className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                  保存中...
                </>
              ) : (
                "変更を保存"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
