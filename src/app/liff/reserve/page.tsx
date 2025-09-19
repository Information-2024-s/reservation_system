"use client";

import React, { useEffect, useState } from "react";
import { useGlobalContext } from "@/hooks/useGlobalContexts";
import Link from "next/link";
import ReservationModal from "./ReservationModal";
import TeamRegistration, { TeamData } from "./TeamRegistration";
import ReservationConfirmation from "./ReservationConfirmation";
import TeamEditModal from "./TeamEditModal";
import { TimeSlot, convertUTCToJST, formatJSTTime } from "./types";

export default function ReservePage() {
  // CSSアニメーションを動的に追加
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      .animate-fade-in {
        animation: fadeIn 0.5s ease-out both;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ユーザー予約の型定義
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
      players: Array<{
        id: string;
        name: string;
      }>;
    } | null;
    timeSlot: {
      id: number;
      slotTime: string;
      status: string;
    } | null;
  }

  const { liff, liffError } = useGlobalContext();
  const [profile, setProfile] = useState<{ displayName?: string } | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLiffLoading, setIsLiffLoading] = useState(true);
  const [isTimeSlotsLoading, setIsTimeSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ユーザーの既存予約関連の状態
  const [userReservation, setUserReservation] =
    useState<UserReservation | null>(null);
  const [isLoadingUserReservation, setIsLoadingUserReservation] =
    useState(false);
  const [isTeamEditModalOpen, setIsTeamEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingTeamEdit, setIsSavingTeamEdit] = useState(false);

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

  // ユーザーの既存予約を取得
  const fetchUserReservation = async () => {
    setIsLoadingUserReservation(true);
    setError(null);

    try {
      const response = await fetch("/api/reservations/my-reservation");
      if (response.ok) {
        const data = await response.json();
        
        setUserReservation(data.reservation ? data : null);
        
      } else {
        throw new Error("予約情報の取得に失敗しました");
      }
    } catch (err) {
      console.error("Error fetching user reservation:", err);
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoadingUserReservation(false);
    }
  };

  // 予約を削除
  const handleDeleteReservation = async () => {
    if (!userReservation?.reservation.id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/reservations/${userReservation.reservation.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("予約を削除しました。");
        setUserReservation(null);
      } else {
        throw new Error("予約の削除に失敗しました");
      }
    } catch (err) {
      console.error("Error deleting reservation:", err);
      alert(err instanceof Error ? err.message : "予約の削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  // チーム情報を変更
  const handleEditTeam = async (
    teamId: number,
    teamData: {
      name: string;
      headcount: number;
      memberNames: string[];
    }
  ) => {
    console.log('=== handleEditTeam が呼ばれました ===');
    console.log('teamId:', teamId);
    console.log('teamData:', teamData);
    
    setIsSavingTeamEdit(true);
    try {
      const requestBody = JSON.stringify(teamData);
      console.log('リクエストボディ:', requestBody);
      
      let response;
      
      if (teamId === -1) {
        // 新規チーム作成
        console.log('新規チーム作成API呼び出し');
        response = await fetch(`/api/reservations/${userReservation?.reservation.id}/add-team`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
        });
      } else {
        // 既存チーム編集
        console.log('既存チーム編集API呼び出し');
        response = await fetch(`/api/teams/${teamId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
        });
      }

      console.log('レスポンスステータス:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('レスポンスデータ:', responseData);
        alert(teamId === -1 ? "チーム情報を登録しました。" : "チーム情報を変更しました。");
        setIsTeamEditModalOpen(false);
        // 予約情報を再取得
        await fetchUserReservation();
      } else {
        const errorData = await response.json();
        console.error('エラーレスポンス:', errorData);
        throw new Error(errorData.message || (teamId === -1 ? "チーム情報の登録に失敗しました" : "チーム情報の変更に失敗しました"));
      }
    } catch (err) {
      console.error("Error updating team:", err);
      alert(err instanceof Error ? err.message : (teamId === -1 ? "チーム情報の登録に失敗しました" : "チーム情報の変更に失敗しました"));
    } finally {
      setIsSavingTeamEdit(false);
    }
  }; // TimeSlots APIからデータを取得（フィルタリング付き）
  const fetchTimeSlots = async (date: string, hour: number) => {
    setIsTimeSlotsLoading(true);
    setError(null);
    // 即座にタイムスロット表示画面に切り替え
    setShowTimeSlots(true);

    try {
      const params = new URLSearchParams({
        date,
        startHour: hour.toString(),
        endHour: hour.toString(),
      });
      const response = await fetch(`/api/timeslots?${params}`);
      if (response.ok) {
        const data: TimeSlot[] = await response.json();
        if (process.env.NODE_ENV === "development") {
          console.log("Fetched time slots:", data); // デバッグ用ログ（開発環境のみ）
        }
        setTimeSlots(data);
      } else {
        throw new Error("タイムスロットの取得に失敗しました");
      }
    } catch (err) {
      console.error("Error fetching time slots:", err);
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      // エラー時は検索画面に戻る
      setShowTimeSlots(false);
    } finally {
      setIsTimeSlotsLoading(false);
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

  const handleTeamReservationComplete = async (teamData: TeamData) => {
    if (selectedTimeSlot) {
      // チーム情報付きの予約処理成功
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
      // 予約後に既存予約情報を再取得
      await fetchUserReservation();
      // 予約後にタイムスロットを再取得
      if (selectedDate && selectedHour !== null) {
        fetchTimeSlots(selectedDate, selectedHour);
      }
    }
  };

  // チーム情報なしで直接予約
  const handleDirectReservation = async () => {
    if (!selectedTimeSlot) return;

    console.log('=== 直接予約開始 ===');
    console.log('選択されたタイムスロット:', selectedTimeSlot);

    try {
      const requestBody = {
        timeSlotId: selectedTimeSlot.id,
      };
      
      console.log('リクエストボディ:', requestBody);

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('レスポンスステータス:', response.status);
      console.log('レスポンスヘッダー:', response.headers);

      const responseData = await response.json();
      console.log('レスポンスデータ:', responseData);

      if (response.ok) {
        console.log('予約成功!');
        alert(
          `予約が完了しました！\n時間: ${formatJSTTime(
            convertUTCToJST(selectedTimeSlot.slotTime)
          )}\n\nチーム情報は後から追加できます。`
        );
        closeModal();
        // 予約後に既存予約情報を再取得
        await fetchUserReservation();
        // 予約後にタイムスロットを再取得
        if (selectedDate && selectedHour !== null) {
          fetchTimeSlots(selectedDate, selectedHour);
        }
      } else {
        console.error('予約失敗 - レスポンス:', responseData);
        throw new Error(responseData.message || responseData.error || '予約に失敗しました');
      }
    } catch (err) {
      console.error('=== 予約エラー詳細 ===');
      console.error('エラーオブジェクト:', err);
      console.error('エラータイプ:', typeof err);
      console.error('エラーメッセージ:', err instanceof Error ? err.message : err);
      
      const errorMessage = err instanceof Error ? err.message : '予約に失敗しました';
      alert(`予約エラー: ${errorMessage}\n\n詳細はデベロッパーツールのコンソールを確認してください。`);
    }
  };

  useEffect(() => {
    const fetchUserReservationOnMount = async () => {
      setIsLoadingUserReservation(true);
      setError(null);

      try {
        const response = await fetch("/api/reservations/my-reservation");
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setUserReservation(data.reservation ? data : null);
        } else {
          throw new Error("予約情報の取得に失敗しました");
        }
      } catch (err) {
        console.error("Error fetching user reservation:", err);
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setIsLoadingUserReservation(false);
      }
    };

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
          // 既存予約を取得
          fetchUserReservationOnMount();
        })
        .catch((err: unknown) => console.error("Error getting profile:", err));

      // 初期状態では選択画面を表示するためローディングを解除
      setIsLiffLoading(false);
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

  if (isLiffLoading || !liff) {
    return (
      <div className="p-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <h2 className="text-xl font-bold">LIFF初期化中...</h2>
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

          {isLoadingUserReservation ? (
            // 既存予約読み込み中
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
                予約情報を読み込み中...
              </span>
            </div>
          ) : userReservation ? (
            // 既存予約がある場合は確認画面を表示
            <ReservationConfirmation
              userReservation={userReservation}
              onTeamEdit={() => setIsTeamEditModalOpen(true)}
              onDelete={handleDeleteReservation}
              isDeleting={isDeleting}
            />
          ) : !showTimeSlots ? (
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
                      className="bg-green-500 dark:bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-600 dark:hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isTimeSlotsLoading}
                    >
                      {isTimeSlotsLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>検索中...</span>
                        </div>
                      ) : (
                        "タイムスロットを検索"
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // タイムスロット表示画面
              <div>
                <div className="mb-6 text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {
                      availableDates.find((d) => d.value === selectedDate)
                        ?.label
                    }{" "}
                    /{" "}
                    {
                      availableHours.find((h) => h.value === selectedHour)
                        ?.label
                    }
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
                      予約不可 (当日枠)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-red-500 border border-red-600"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      他の方が予約済み
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {timeSlots.length === 0 ? (
                    <div className="col-span-full text-center py-8 opacity-0 animate-pulse">
                      <div className="mb-4 animate-fade-in">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p
                        className="text-gray-500 dark:text-gray-400 animate-fade-in"
                        style={{ animationDelay: "200ms" }}
                      >
                        選択した時間帯にはタイムスロットがありません。
                      </p>
                    </div>
                  ) : (
                    timeSlots.map((slot, index) => {
                      // UTC時刻を日本時間に変換してからHH:MM形式に変換
                      const jstDate = convertUTCToJST(slot.slotTime);
                      const timeString = formatJSTTime(jstDate);

                      if (process.env.NODE_ENV === "development") {
                        console.log(
                          `Slot ${slot.id}: type=${slot.slotType}, status=${slot.status}`
                        ); // デバッグ用ログ（開発環境のみ）
                      }

                      let slotClasses =
                        "p-3 rounded-lg text-center text-white font-bold transition-all duration-300 transform shadow-md opacity-0 translate-y-4 hover:scale-105";
                      let statusText = "";
                      let onClick = () => {};

                      // アニメーション用のスタイル
                      const animationStyle = {
                        animation: `slideInUp 0.6s ease-out ${
                          index * 50
                        }ms both`,
                      };

                      if (slot.slotType === "WALK_IN") {
                        slotClasses +=
                          " bg-gray-500 dark:bg-gray-600 cursor-not-allowed";
                        statusText = "予約不要";
                      } else {
                        if (slot.status === "BOOKED") {
                          slotClasses +=
                            " bg-red-500 dark:bg-red-600 cursor-not-allowed";
                          statusText = "他の方が予約済み";
                        } else {
                          slotClasses +=
                            " bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 hover:-translate-y-1 cursor-pointer hover:shadow-lg";
                          statusText = "予約できます";
                          onClick = () => openModal(slot);
                        }
                      }

                      return (
                        <div
                          key={slot.id}
                          className={slotClasses}
                          onClick={onClick}
                          style={animationStyle}
                        >
                          <span className="block text-lg mb-1">
                            {timeString}
                          </span>
                          <span className="block text-xs opacity-90">
                            {statusText}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )
          }
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
          onReserveDirect={handleDirectReservation}
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

        {/* チーム編集モーダル */}
        {userReservation && (
          <TeamEditModal
            userReservation={userReservation}
            isOpen={isTeamEditModalOpen}
            onClose={() => setIsTeamEditModalOpen(false)}
            onSave={handleEditTeam}
            isSaving={isSavingTeamEdit}
          />
        )}
      </div>
    </div>
  );
}
