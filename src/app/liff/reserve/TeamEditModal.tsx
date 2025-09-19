import { team } from "@/app/api/[[...route]]/zod_objects";
import React, { useState, useEffect } from "react";

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

interface TeamEditModalProps {
  userReservation: UserReservation;
  isOpen: boolean;
  onClose: () => void;
  onSave: (teamId: number, teamData: {
    name: string;
    headcount: number;
    memberNames: string[];
  }) => void;
  isSaving: boolean;
}

export default function TeamEditModal({
  userReservation,
  isOpen,
  onClose,
  onSave,
  isSaving,
}: TeamEditModalProps) {
  const [teamName, setTeamName] = useState("");
  const [memberCount, setMemberCount] = useState(1);
  const [memberNames, setMemberNames] = useState<string[]>([""]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});


  // モーダルが開かれたときに現在のチーム情報をセット
  useEffect(() => {
    console.log('TeamEditModal useEffect - isOpen:', isOpen);
    console.log('TeamEditModal useEffect - userReservation:', userReservation);
    
    if (isOpen && userReservation.team) {
      console.log('チーム情報を設定中:', userReservation.team);
      setTeamName(userReservation.team.name);
      setMemberCount(userReservation.team.headcount);
      
      // 既存のメンバー名を取得、足りない分は空文字で埋める
      const existingNames = userReservation.team.players.map(u => u.name);
      const names = [...existingNames];
      while (names.length < userReservation.team.headcount) {
        names.push("");
      }
      console.log('設定するメンバー名:', names);
      setMemberNames(names);
    }
  }, [isOpen, userReservation]);

  // メンバー数が変更されたときにメンバー名配列を調整
  useEffect(() => {
    const newMemberNames = [...memberNames];
    
    if (memberCount > memberNames.length) {
      // メンバー数が増えた場合、空文字を追加
      while (newMemberNames.length < memberCount) {
        newMemberNames.push("");
      }
    } else if (memberCount < memberNames.length) {
      // メンバー数が減った場合、余分な要素を削除
      newMemberNames.splice(memberCount);
    }
    
    setMemberNames(newMemberNames);
  }, [memberCount]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!teamName.trim()) {
      newErrors.teamName = "チーム名は必須です";
    } else if (teamName.length > 50) {
      newErrors.teamName = "チーム名は50文字以内で入力してください";
    }

    if (memberCount < 1 || memberCount > 10) {
      newErrors.memberCount = "メンバー数は1〜10人で入力してください";
    }

    // メンバー名の検証
    memberNames.forEach((name, index) => {
      if (!name.trim()) {
        newErrors[`memberName${index}`] = `メンバー${index + 1}の名前は必須です`;
      } else if (name.length > 30) {
        newErrors[`memberName${index}`] = `メンバー${index + 1}の名前は30文字以内で入力してください`;
      }
    });

    // 重複チェック
    const uniqueNames = new Set(memberNames.map(name => name.trim().toLowerCase()));
    if (uniqueNames.size !== memberNames.length) {
      newErrors.duplicate = "メンバー名に重複があります";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMemberNameChange = (index: number, value: string) => {
    const newMemberNames = [...memberNames];
    newMemberNames[index] = value;
    setMemberNames(newMemberNames);
    
    // エラーをクリア
    if (errors[`memberName${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`memberName${index}`];
      setErrors(newErrors);
    }
  };

  const handleSave = () => {
    console.log('=== handleSave が呼ばれました ===');
    console.log('userReservation.team:', userReservation.team);
    console.log('teamName:', teamName);
    console.log('memberCount:', memberCount);
    console.log('memberNames:', memberNames);
    
    if (!validateForm()) {
      console.log('バリデーションエラー:', errors);
      return;
    }
    
    const teamData = {
      name: teamName.trim(),
      headcount: memberCount,
      memberNames: memberNames.map(name => name.trim()),
    };
    console.log('送信するチームデータ:', teamData);

    if (userReservation.team) {
      // 既存チームの編集
      console.log('既存チームを編集します, teamId:', userReservation.team.id);
      onSave(userReservation.team.id, teamData);
    } else {
      // 新しいチームを作成
      console.log('新しいチームを作成します');
      onSave(-1, teamData); // -1を使って新規作成を示す
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {userReservation.team ? 'チーム情報を変更' : 'チーム情報を登録'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* チーム名入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                チーム名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  if (errors.teamName) {
                    const newErrors = { ...errors };
                    delete newErrors.teamName;
                    setErrors(newErrors);
                  }
                }}
                placeholder="チーム名を入力してください"
                className={`w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-gray-100 transition-colors ${
                  errors.teamName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                } focus:ring-2 focus:border-transparent`}
                maxLength={50}
              />
              {errors.teamName && (
                <p className="mt-1 text-sm text-red-500">{errors.teamName}</p>
              )}
            </div>

            {/* メンバー数選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                メンバー数 <span className="text-red-500">*</span>
              </label>
              <select
                value={memberCount}
                onChange={(e) => {
                  setMemberCount(Number(e.target.value));
                  if (errors.memberCount) {
                    const newErrors = { ...errors };
                    delete newErrors.memberCount;
                    setErrors(newErrors);
                  }
                }}
                className={`w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-gray-100 transition-colors ${
                  errors.memberCount
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                } focus:ring-2 focus:border-transparent`}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}人
                  </option>
                ))}
              </select>
              {errors.memberCount && (
                <p className="mt-1 text-sm text-red-500">{errors.memberCount}</p>
              )}
            </div>

            {/* メンバー名入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                メンバー名 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {memberNames.map((name, index) => (
                  <div key={index}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleMemberNameChange(index, e.target.value)}
                      placeholder={`メンバー${index + 1}の名前`}
                      className={`w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-gray-100 transition-colors ${
                        errors[`memberName${index}`]
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                      } focus:ring-2 focus:border-transparent`}
                      maxLength={30}
                    />
                    {errors[`memberName${index}`] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors[`memberName${index}`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {errors.duplicate && (
                <p className="mt-1 text-sm text-red-500">{errors.duplicate}</p>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              キャンセル
            </button>
            <button
              onClick={() => {
                console.log('保存ボタンがクリックされました');
                handleSave();
              }}
              disabled={isSaving}
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
                userReservation.team ? "変更を保存" : "チーム情報を登録"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}