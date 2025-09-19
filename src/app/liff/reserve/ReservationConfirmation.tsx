import React from "react";
import { formatJSTTime, convertUTCToJST } from "./types";

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

interface ReservationConfirmationProps {
  userReservation: UserReservation;
  onTeamEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export default function ReservationConfirmation({
  userReservation,
  onTeamEdit,
  onDelete,
  isDeleting,
}: ReservationConfirmationProps) {
  const { reservation, team, timeSlot } = userReservation;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          予約確認
        </h2>
      </div>

      {/* 予約情報カード */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="bg-blue-500 text-white rounded-full p-2 mr-3">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
            予約済み
          </h3>
        </div>

        {/* 時間情報 */}
        {timeSlot && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              予約時間
            </p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {formatJSTTime(convertUTCToJST(timeSlot.slotTime))}
            </p>
          </div>
        )}

        {/* チーム情報 */}
        {team && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              チーム名
            </p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {team.name}
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              メンバー数: {team.headcount}人
            </p>

            {team.players.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  メンバー:
                </p>
                <div className="flex flex-wrap gap-2">
                  {team.players.map((user, index) => (
                    <span
                      key={user.id}
                      className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                    >
                      {user.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 予約ID */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            予約ID
          </p>
          <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
            #{reservation.id}
          </p>
        </div>

        {/* 予約日時 */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            予約作成日時
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {new Date(reservation.createdAt).toLocaleString("ja-JP")}
          </p>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onTeamEdit}
          className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          チーム編集
        </button>

        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="w-full bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {isDeleting ? (
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
              削除中...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              予約を削除
            </>
          )}
        </button>
      </div>

      {/* 削除確認メッセージ */}
      {isDeleting && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            予約を削除しています。しばらくお待ちください...
          </p>
        </div>
      )}
    </div>
  );
}
