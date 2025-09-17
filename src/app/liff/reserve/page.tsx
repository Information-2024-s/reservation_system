"use client";

import { useEffect, useState } from "react";
import { useGlobalContext } from "@/hooks/useGlobalContexts";
import Link from "next/link";
import ReservationModal from "./ReservationModal";
import TeamRegistration, { TeamData } from "./TeamRegistration";
import { TimeSlot, convertUTCToJST, formatJSTTime } from "./types";

export default function ReservePage() {
  const { liff, liffError } = useGlobalContext();
  const [profile, setProfile] = useState<{ displayName?: string } | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 選択状態の管理
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  // モーダル関連の状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeamRegistrationOpen, setIsTeamRegistrationOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );

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

  // TimeSlots APIからデータを取得（フィルタリング付き）
  const fetchTimeSlots = async (date: string, hour: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        date,
        startHour: hour.toString(),
        endHour: hour.toString(),
      });
      const response = await fetch(`/api/timeslots?${params}`);
      if (!response.ok) {
        throw new Error("タイムスロットの取得に失敗しました");
      }
      const data: TimeSlot[] = await response.json();
      setTimeSlots(data);
      setShowTimeSlots(true);
    } catch (err) {
      console.error("Error fetching time slots:", err);
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // モーダル関連の関数
  const openModal = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsTeamRegistrationOpen(false);
    setSelectedTimeSlot(null);
  };

  const handleNext = () => {
    setIsModalOpen(false);
    setIsTeamRegistrationOpen(true);
  };

  const handleBackToModal = () => {
    setIsTeamRegistrationOpen(false);
    setIsModalOpen(true);
  };

  const handleTeamReservationComplete = (teamData: TeamData) => {
    if (selectedTimeSlot) {
      // チーム情報付きの予約処理
      alert(
        `チーム予約が完了しました！\nチーム名: ${
          teamData.teamName
        }\nメンバー数: ${
          teamData.memberCount
        }人\nメンバー: ${teamData.memberNames.join(
          ", "
        )}\n時間: ${formatJSTTime(convertUTCToJST(selectedTimeSlot.slotTime))}`
      );
      closeModal();
      // 予約後にタイムスロットを再取得
      if (selectedDate && selectedHour !== null) {
        fetchTimeSlots(selectedDate, selectedHour);
      }
    }
  };

  useEffect(() => {
    if (liff) {
      // ログイン済みでない場合は親ページにリダイレクト
      if (!liff.isLoggedIn()) {
        window.location.href = "/liff";
        return;
      }

      // プロフィールを取得
      liff
        .getProfile()
        .then((userProfile: { displayName: string }) => {
          setProfile(userProfile);
        })
        .catch((err: unknown) => console.error("Error getting profile:", err));

      // 初期状態では選択画面を表示するためローディングを解除
      setIsLoading(false);
    }
  }, [liff]);

  if (liffError) {
    return (
      <div className="p-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
          LIFF initialization failed
        </h2>
        <p className="font-mono bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded mt-2">
          {liffError}
        </p>
        <Link
          href="/liff"
          className="text-green-600 dark:text-green-400 hover:underline mt-4 inline-block"
        >
          ← 戻る
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
          エラーが発生しました
        </h2>
        <p className="mt-2">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setShowTimeSlots(false);
            setSelectedDate("");
            setSelectedHour(null);
          }}
          className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 mt-4 transition-colors"
        >
          最初から選び直す
        </button>
        <Link
          href="/liff"
          className="text-green-600 dark:text-green-400 hover:underline mt-4 inline-block ml-4"
        >
          ← 戻る
        </Link>
      </div>
    );
  }

  if (isLoading || !liff) {
    return (
      <div className="p-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <h2 className="text-xl font-bold">タイムスロットを読み込み中...</h2>
      </div>
    );
  }

  if (!liff.isLoggedIn()) {
    return (
      <div className="p-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <h2 className="text-xl font-bold">ログインが必要です</h2>
        <p className="mt-2">この機能を利用するにはLINEログインが必要です。</p>
        <Link
          href="/liff"
          className="text-green-600 dark:text-green-400 hover:underline mt-4 inline-block"
        >
          ← ログインページに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/liff"
            className="text-green-600 dark:text-green-400 hover:underline"
          >
            ← 戻る
          </Link>
        </div>

        {profile && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow">
            <h3 className="font-bold text-lg">ユーザー情報</h3>
            <p>こんにちは、{profile.displayName || "ゲスト"}さん</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">
            ゲーム予約
          </h1>

          {!showTimeSlots ? (
            // 日付・時刻選択画面
            <div>
              <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                まず日付を選択してください。
              </p>

              {/* 日付選択 */}
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
                  日付を選択
                </h3>
                <div className="max-w-md mx-auto relative">
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-4 pr-12 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 text-center text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer appearance-none"
                  >
                    <option
                      value=""
                      className="text-gray-500 dark:text-gray-400"
                    >
                      日付を選択してください
                    </option>
                    {availableDates.map((date) => (
                      <option
                        key={date.value}
                        value={date.value}
                        className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 py-2"
                      >
                        {date.label}
                      </option>
                    ))}
                  </select>
                  {/* カスタム矢印アイコン */}
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 時間帯選択 */}
              {selectedDate && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
                    時間帯を選択
                  </h3>
                  <div className="max-w-md mx-auto relative">
                    <select
                      value={selectedHour || ""}
                      onChange={(e) =>
                        setSelectedHour(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="w-full p-4 pr-12 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 text-center text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer appearance-none"
                    >
                      <option
                        value=""
                        className="text-gray-500 dark:text-gray-400"
                      >
                        時間帯を選択してください
                      </option>
                      {availableHours.map((hour) => (
                        <option
                          key={hour.value}
                          value={hour.value}
                          className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 py-2"
                        >
                          {hour.label}
                        </option>
                      ))}
                    </select>
                    {/* カスタム矢印アイコン */}
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* 検索ボタン */}
              {selectedDate && selectedHour !== null && (
                <div className="text-center">
                  <button
                    onClick={() => fetchTimeSlots(selectedDate, selectedHour)}
                    className="bg-green-500 dark:bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "検索中..." : "タイムスロットを検索"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // タイムスロット表示画面
            <div>
              <div className="mb-6 text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {availableDates.find((d) => d.value === selectedDate)?.label}{" "}
                  /{" "}
                  {availableHours.find((h) => h.value === selectedHour)?.label}
                </p>
                <button
                  onClick={() => {
                    setShowTimeSlots(false);
                    setSelectedDate("");
                    setSelectedHour(null);
                    setTimeSlots([]);
                  }}
                  className="text-green-600 dark:text-green-400 hover:underline text-sm"
                >
                  ← 日付・時刻を変更
                </button>
              </div>

              <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                ご希望の時間枠を選択してください。
              </p>

              <div className="flex justify-center items-center gap-4 md:gap-6 mb-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-green-500 border border-green-600"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    予約可能
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-gray-500 border border-gray-600"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    予約不要 (当日枠)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-red-500 border border-red-600"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    満員
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {timeSlots.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      選択した時間帯にはタイムスロットがありません。
                    </p>
                  </div>
                ) : (
                  timeSlots.map((slot) => {
                    // UTC時刻を日本時間に変換してからHH:MM形式に変換
                    const jstDate = convertUTCToJST(slot.slotTime);
                    const timeString = formatJSTTime(jstDate);

                    let slotClasses =
                      "p-3 rounded-lg text-center text-white font-bold transition-transform duration-200 transform shadow-md";
                    let statusText = "";
                    let onClick = () => {};

                    if (slot.slotType === "WALK_IN") {
                      slotClasses +=
                        " bg-gray-500 dark:bg-gray-600 cursor-not-allowed";
                      statusText = "予約不要";
                    } else {
                      if (slot.status === "BOOKED") {
                        slotClasses +=
                          " bg-red-500 dark:bg-red-600 cursor-not-allowed";
                        statusText = "満員";
                      } else {
                        slotClasses +=
                          " bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 hover:-translate-y-1 cursor-pointer";
                        statusText = "予約できます";
                        onClick = () => openModal(slot);
                      }
                    }

                    return (
                      <div
                        key={slot.id}
                        className={slotClasses}
                        onClick={onClick}
                      >
                        <span className="block text-lg mb-1">{timeString}</span>
                        <span className="block text-xs opacity-90">
                          {statusText}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 予約確認モーダル */}
        <ReservationModal
          isOpen={isModalOpen}
          selectedTimeSlot={selectedTimeSlot}
          selectedDate={selectedDate}
          profile={profile}
          availableDates={availableDates}
          onClose={closeModal}
          onNext={handleNext}
        />

        {/* チーム情報登録モーダル */}
        <TeamRegistration
          isOpen={isTeamRegistrationOpen}
          selectedTimeSlot={selectedTimeSlot}
          selectedDate={selectedDate}
          profile={profile}
          availableDates={availableDates}
          onBack={handleBackToModal}
          onComplete={handleTeamReservationComplete}
        />
      </div>
    </div>
  );
}
