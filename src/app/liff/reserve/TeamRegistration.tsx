import React, { useState } from "react";
import { TimeSlot, convertUTCToJST, formatJSTTime } from "./types";

interface TeamRegistrationProps {
  isOpen: boolean;
  selectedTimeSlot: TimeSlot | null;
  selectedDate: string;
  profile: { displayName?: string } | null;
  availableDates: { value: string; label: string }[];
  onBack: () => void;
  onComplete: (teamData: TeamData) => void;
}

export interface TeamData {
  teamName: string;
  memberCount: number;
  memberNames: string[];
}

interface TeamDataErrors {
  teamName?: string;
  memberCount?: string;
  memberNames?: string[];
}

export default function TeamRegistration({
  isOpen,
  selectedTimeSlot,
  selectedDate,
  profile,
  availableDates,
  onBack,
  onComplete,
}: TeamRegistrationProps) {
  const [teamData, setTeamData] = useState<TeamData>({
    teamName: "",
    memberCount: 1,
    memberNames: [""],
  });

  const [errors, setErrors] = useState<TeamDataErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !selectedTimeSlot) {
    return null;
  }

  // メンバー数が変更されたときにmemberNamesを調整
  const updateMemberCount = (newCount: number) => {
    const newMemberNames = [...teamData.memberNames];

    if (newCount > newMemberNames.length) {
      // メンバーが増えた場合は空文字列を追加
      while (newMemberNames.length < newCount) {
        newMemberNames.push("");
      }
    } else if (newCount < newMemberNames.length) {
      // メンバーが減った場合は末尾を削除
      newMemberNames.splice(newCount);
    }

    setTeamData((prev) => ({
      ...prev,
      memberCount: newCount,
      memberNames: newMemberNames,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: TeamDataErrors = {};

    if (!teamData.teamName.trim()) {
      newErrors.teamName = "チーム名を入力してください";
    }

    if (teamData.memberCount < 1 || teamData.memberCount > 4) {
      newErrors.memberCount = "メンバー数は1〜4人で入力してください";
    }

    // メンバー名のバリデーション
    const memberNameErrors: string[] = [];
    teamData.memberNames.forEach((name, index) => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        memberNameErrors[index] = `メンバー${
          index + 1
        }の名前を入力してください`;
      } else {
        // ひらがなのみのチェック（正規表現：ひらがな、長音記号、小さいっゃゅょを含む）
        const hiraganaRegex = /^[あ-んーっゃゅょ]+$/;
        if (!hiraganaRegex.test(trimmedName)) {
          memberNameErrors[index] = `メンバー${
            index + 1
          }の名前はひらがなで入力してください`;
        } else if (trimmedName.length > 6) {
          memberNameErrors[index] = `メンバー${
            index + 1
          }の名前は6文字以内で入力してください`;
        }
      }
    });

    if (memberNameErrors.some((error) => error)) {
      newErrors.memberNames = memberNameErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reservations/with-team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeSlotId: selectedTimeSlot!.id,
          teamName: teamData.teamName,
          memberCount: teamData.memberCount,
          memberNames: teamData.memberNames,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "予約の作成に失敗しました");
      }

      const result = await response.json();

      // 予約完了
      onComplete(teamData);
    } catch (error) {
      console.error("Error creating reservation:", error);

      // エラーメッセージを表示
      if (error instanceof Error) {
        if (error.message.includes("このタイムスロットは既に予約済みです")) {
          alert(
            "申し訳ございません。選択されたタイムスロットは既に予約済みです。他の時間をお選びください。"
          );
        } else {
          alert(`予約の作成に失敗しました: ${error.message}`);
        }
      } else {
        alert("予約の作成に失敗しました。もう一度お試しください。");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TeamData, value: string | number) => {
    setTeamData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // エラーをクリア
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleMemberNameChange = (index: number, value: string) => {
    const newMemberNames = [...teamData.memberNames];
    newMemberNames[index] = value;
    setTeamData((prev) => ({
      ...prev,
      memberNames: newMemberNames,
    }));

    // リアルタイムバリデーション
    const newMemberErrors = [...(errors.memberNames || [])];
    const trimmedValue = value.trim();

    if (trimmedValue === "") {
      // 空文字の場合はエラーをクリア（送信時にチェックされるため）
      newMemberErrors[index] = "";
    } else {
      // ひらがなのみのチェック（正規表現：ひらがな、長音記号、小さいっゃゅょを含む）
      const hiraganaRegex = /^[あ-んーっゃゅょ]+$/;
      if (!hiraganaRegex.test(trimmedValue)) {
        newMemberErrors[index] = `メンバー${
          index + 1
        }の名前はひらがなで入力してください`;
      } else if (trimmedValue.length > 6) {
        newMemberErrors[index] = `メンバー${
          index + 1
        }の名前は6文字以内で入力してください`;
      } else {
        // バリデーション通過の場合はエラーをクリア
        newMemberErrors[index] = "";
      }
    }

    // エラー配列が全て空文字列の場合はundefinedに設定
    const hasErrors = newMemberErrors.some((error) => error);
    setErrors((prev) => ({
      ...prev,
      memberNames: hasErrors ? newMemberErrors : undefined,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl p-6 w-full max-w-lg mx-auto shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
          チーム情報登録
        </h3>

        {/* 予約情報の確認 */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            予約日時
          </div>
          <div className="font-bold text-gray-900 dark:text-gray-100">
            {availableDates.find((d) => d.value === selectedDate)?.label}{" "}
            {formatJSTTime(convertUTCToJST(selectedTimeSlot.slotTime))}
          </div>
        </div>

        {/* チーム情報入力フォーム */}
        <div className="space-y-4 mb-6">
          {/* チーム名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              チーム名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={teamData.teamName}
              onChange={(e) => handleInputChange("teamName", e.target.value)}
              className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.teamName
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="チーム名を入力してください"
            />
            {errors.teamName && (
              <p className="text-red-500 text-sm mt-1">{errors.teamName}</p>
            )}
          </div>

          {/* メンバー数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              メンバー数 <span className="text-red-500">*</span>
            </label>
            <select
              value={teamData.memberCount}
              onChange={(e) => updateMemberCount(parseInt(e.target.value))}
              className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.memberCount
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {Array.from({ length: 4 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}人
                </option>
              ))}
            </select>
            {errors.memberCount && (
              <p className="text-red-500 text-sm mt-1">{errors.memberCount}</p>
            )}
          </div>

          {/* メンバー名前 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              メンバー名（ひらがな6文字以内）{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {teamData.memberNames.map((name, index) => (
                <div key={index}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      handleMemberNameChange(index, e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.memberNames && errors.memberNames[index]
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder={`メンバー${index + 1}（例：たろう）`}
                    maxLength={6}
                  />
                  {errors.memberNames && errors.memberNames[index] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.memberNames[index]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-500 dark:bg-gray-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            戻る
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-green-500 dark:bg-green-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-green-600 dark:hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>予約中...</span>
              </div>
            ) : (
              "予約完了"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
