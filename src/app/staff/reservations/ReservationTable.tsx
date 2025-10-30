"use client";

import { useState, useTransition, useMemo } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { 
  deleteReservationById, 
  markReservationAsCalled, 
  markReservationAsNoShow,
  resetCallStatus 
} from "./actions";
import { useRouter } from "next/navigation";

interface TimeSlot {
  id: number;
  slotTime: string;
  slotType: "RESERVABLE" | "WALK_IN";
  status: "AVAILABLE" | "BOOKED" | "UNAVAILABLE";
  createdAt: string;
  updatedAt: string;
}

interface Reservation {
  id: number;
  name: string;
  lineUserId: string | null;
  callStatus: "NOT_CALLED" | "CALLED" | "NO_SHOW";
  calledAt: string | null;
  startTime: string;
  createdAt: string;
  updatedAt: string;
  timeSlotId: number | null;
  timeSlot: TimeSlot | null;
}

interface Props {
  initialReservations: Reservation[];
}

export default function ReservationTable({ initialReservations }: Props) {
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past">("upcoming");
  const [isPending, startTransition] = useTransition();
  const [fetchingLineUser, setFetchingLineUser] = useState<number | null>(null);
  const router = useRouter();

  // 現在時刻を固定（ハイドレーションエラー回避）
  const now = useMemo(() => new Date(), []);

  const handleFetchLineUserName = async (lineUserId: string, reservationId: number) => {
    setFetchingLineUser(reservationId);
    try {
      const response = await fetch(`/api/line/profile/${lineUserId}`);
      const data = await response.json();

      if (response.ok) {
        alert(`LINEユーザー名: ${data.displayName}\nユーザーID: ${lineUserId}`);
      } else {
        throw new Error(data.error || "ユーザー情報の取得に失敗しました");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "ユーザー情報の取得に失敗しました");
    } finally {
      setFetchingLineUser(null);
    }
  };

  const handleDeleteReservation = async (id: number) => {
    if (!confirm("この予約を削除してもよろしいですか？")) {
      return;
    }

    try {
      await deleteReservationById(id);
      alert("予約を削除しました");
      
      // ページをリフレッシュして最新データを取得
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  const handleMarkAsCalled = async (id: number) => {
    try {
      console.log(`呼ぶボタンクリック: ID=${id}`);
      await markReservationAsCalled(id);
      console.log(`呼び出し成功: ID=${id}`);
      
      // ページをリフレッシュ
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      console.error(`呼び出しエラー: ID=${id}`, err);
      alert(err instanceof Error ? err.message : "更新に失敗しました");
    }
  };

  const handleMarkAsNoShow = async (id: number) => {
    if (!confirm("この予約を不在としてマークしますか？")) {
      return;
    }

    try {
      await markReservationAsNoShow(id);
      
      // ページをリフレッシュ
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "更新に失敗しました");
    }
  };

  const handleResetCallStatus = async (id: number) => {
    try {
      await resetCallStatus(id);
      
      // ページをリフレッシュ
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "リセットに失敗しました");
    }
  };

  const filteredReservations = initialReservations.filter((reservation) => {
    const reservationTime = new Date(reservation.timeSlot?.slotTime || reservation.startTime);

    if (filterStatus === "upcoming") {
      return reservationTime >= now;
    } else if (filterStatus === "past") {
      return reservationTime < now;
    }
    return true;
  });

  const sortedReservations = [...filteredReservations].sort((a, b) => {
    const timeA = new Date(a.timeSlot?.slotTime || a.startTime).getTime();
    const timeB = new Date(b.timeSlot?.slotTime || b.startTime).getTime();
    return timeB - timeA; // 新しい順
  });

  return (
    <>
      {/* フィルター */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterStatus === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          すべて ({initialReservations.length})
        </button>
        <button
          onClick={() => setFilterStatus("upcoming")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterStatus === "upcoming"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          今後の予約 (
          {
            initialReservations.filter(
              (r) => new Date(r.timeSlot?.slotTime || r.startTime) >= new Date()
            ).length
          }
          )
        </button>
        <button
          onClick={() => setFilterStatus("past")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterStatus === "past"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          過去の予約 (
          {
            initialReservations.filter(
              (r) => new Date(r.timeSlot?.slotTime || r.startTime) < new Date()
            ).length
          }
          )
        </button>
        <button
          onClick={() => router.refresh()}
          disabled={isPending}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isPending ? "更新中..." : "更新"}
        </button>
      </div>

      {/* 予約リスト */}
      {sortedReservations.length === 0 ? (
        <p className="text-gray-500 text-center py-8">予約がありません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  予約ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  予約者名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  予約日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  スロットタイプ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  呼び出し状態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LINE ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedReservations.map((reservation) => {
                const reservationTime = new Date(
                  reservation.timeSlot?.slotTime || reservation.startTime
                );
                const isPast = reservationTime < now;

                return (
                  <tr key={reservation.id} className={isPast ? "bg-gray-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{reservation.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {reservation.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(reservationTime, "yyyy年M月d日(E) HH:mm", { locale: ja })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.timeSlot?.slotType === "RESERVABLE" ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          予約枠
                        </span>
                      ) : reservation.timeSlot?.slotType === "WALK_IN" ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          当日受付
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          不明
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {reservation.callStatus === "CALLED" ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          🔔 呼出済
                        </span>
                      ) : reservation.callStatus === "NO_SHOW" ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          ❌ 不在
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          ⏱ 未呼出
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isPast ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          終了
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          予約済み
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.lineUserId ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">
                            {reservation.lineUserId.substring(0, 12)}...
                          </span>
                          <button
                            onClick={() => handleFetchLineUserName(reservation.lineUserId!, reservation.id)}
                            disabled={fetchingLineUser === reservation.id}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 text-xs whitespace-nowrap"
                            title="LINE表示名を取得"
                          >
                            {fetchingLineUser === reservation.id ? "取得中..." : "名前取得"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">なし</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(reservation.createdAt), "yyyy/M/d HH:mm", { locale: ja })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-2">
                        {!isPast && (
                          <div className="flex gap-2">
                            {reservation.callStatus === "NOT_CALLED" && (
                              <button
                                onClick={() => handleMarkAsCalled(reservation.id)}
                                disabled={isPending}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 text-xs font-medium whitespace-nowrap"
                              >
                                呼ぶ
                              </button>
                            )}
                            {reservation.callStatus === "CALLED" && (
                              <>
                                <button
                                  onClick={() => handleMarkAsNoShow(reservation.id)}
                                  disabled={isPending}
                                  className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:opacity-50 text-xs font-medium whitespace-nowrap"
                                >
                                  不在
                                </button>
                                <button
                                  onClick={() => handleResetCallStatus(reservation.id)}
                                  disabled={isPending}
                                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 text-xs font-medium whitespace-nowrap"
                                >
                                  リセット
                                </button>
                              </>
                            )}
                            {reservation.callStatus === "NO_SHOW" && (
                              <button
                                onClick={() => handleResetCallStatus(reservation.id)}
                                disabled={isPending}
                                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 text-xs font-medium whitespace-nowrap"
                              >
                                リセット
                              </button>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteReservation(reservation.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 text-xs font-medium whitespace-nowrap"
                          disabled={isPast || isPending}
                        >
                          {isPast ? "削除不可" : "削除"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
