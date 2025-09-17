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
      if (!name.trim()) {
        memberNameErrors[index] = `メンバー${
          index + 1
        }の名前を入力してください`;
      }
    });

    if (memberNameErrors.some((error) => error)) {
      newErrors.memberNames = memberNameErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete(teamData);
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

    // 該当するメンバー名のエラーをクリア
    if (errors.memberNames && errors.memberNames[index]) {
      const newMemberErrors = [...(errors.memberNames || [])];
      newMemberErrors[index] = "";
      setErrors((prev) => ({
        ...prev,
        memberNames: newMemberErrors,
      }));
    }
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
              メンバー名 <span className="text-red-500">*</span>
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
                    placeholder={`メンバー${index + 1}の名前`}
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
            className="flex-1 bg-green-500 dark:bg-green-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
          >
            予約完了
          </button>
        </div>
      </div>
    </div>
  );
}
