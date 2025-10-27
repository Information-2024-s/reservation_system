"use client";

import { useState, useEffect } from "react";
import { Stage } from "@prisma/client";
import {
  getTmpScores,
  createTmpScore,
  updateTmpScore,
  deleteTmpScore,
  deleteAllTmpScoresById,
} from "./actions";

type TmpScore = {
  id: number;
  stage: Stage;
  score: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function TmpScoreManagement() {
  const [tmpScores, setTmpScores] = useState<TmpScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // モーダル状態
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 検索状態
  const [searchId, setSearchId] = useState("");

  // フォーム状態
  const [formData, setFormData] = useState({
    id: "",
    stage: "First" as Stage,
    score: "",
  });

  // 編集状態
  const [editingScore, setEditingScore] = useState<{
    id: number;
    stage: Stage;
    score: number;
  } | null>(null);

  const stages: Stage[] = ["First", "Second", "Third"];

  const loadTmpScores = async () => {
    setLoading(true);
    const result = await getTmpScores();
    if (result.success && result.data) {
      setTmpScores(result.data);
    } else {
      setError(result.error || "データの読み込みに失敗しました");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTmpScores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const id = parseInt(formData.id);
    const score = parseInt(formData.score);

    if (isNaN(id) || isNaN(score)) {
      setError("IDとスコアは数値で入力してください");
      return;
    }

    if (editingScore) {
      const result = await updateTmpScore(editingScore.id, editingScore.stage, {
        score,
      });
      if (result.success) {
        setSuccessMessage("仮スコアを更新しました");
        setEditingScore(null);
        setFormData({ id: "", stage: "First", score: "" });
        setIsModalOpen(false);
        loadTmpScores();
      } else {
        setError(result.error || "更新に失敗しました");
      }
    } else {
      const result = await createTmpScore({
        id,
        stage: formData.stage,
        score,
      });
      if (result.success) {
        setSuccessMessage("仮スコアを作成しました");
        setFormData({ id: "", stage: "First", score: "" });
        setIsModalOpen(false);
        loadTmpScores();
      } else {
        setError(result.error || "作成に失敗しました");
      }
    }
  };

  const handleEdit = (tmpScore: TmpScore) => {
    setEditingScore({
      id: tmpScore.id,
      stage: tmpScore.stage,
      score: tmpScore.score,
    });
    setFormData({
      id: tmpScore.id.toString(),
      stage: tmpScore.stage,
      score: tmpScore.score.toString(),
    });
    setError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingScore(null);
    setFormData({ id: "", stage: "First", score: "" });
    setError("");
    setSuccessMessage("");
    setIsModalOpen(false);
  };

  const handleOpenCreateModal = () => {
    setEditingScore(null);
    setFormData({ id: "", stage: "First", score: "" });
    setError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, stage: Stage) => {
    if (!confirm("この仮スコアを削除しますか?")) return;

    const result = await deleteTmpScore(id, stage);
    if (result.success) {
      setSuccessMessage("仮スコアを削除しました");
      loadTmpScores();
    } else {
      setError(result.error || "削除に失敗しました");
    }
  };

  const handleDeleteAll = async (id: number) => {
    if (!confirm(`ID ${id} の全ステージのスコアを削除しますか?`)) return;

    const result = await deleteAllTmpScoresById(id);
    if (result.success) {
      setSuccessMessage("仮スコアを一括削除しました");
      loadTmpScores();
    } else {
      setError(result.error || "削除に失敗しました");
    }
  };

  // IDでグループ化
  const groupedScores = tmpScores.reduce((acc, score) => {
    if (!acc[score.id]) {
      acc[score.id] = [];
    }
    acc[score.id].push(score);
    return acc;
  }, {} as Record<number, TmpScore[]>);

  // 検索フィルター適用
  const filteredIds = Object.keys(groupedScores)
    .filter((id) => {
      if (!searchId) return true;
      return id.includes(searchId);
    })
    .sort((a, b) => parseInt(a) - parseInt(b));

  // ページネーション計算
  const totalPages = Math.ceil(filteredIds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIds = filteredIds.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (value: string) => {
    setSearchId(value);
    setCurrentPage(1); // 検索時は1ページ目に戻る
  };

  const getStageLabel = (stage: Stage) => {
    switch (stage) {
      case "First":
        return "1st";
      case "Second":
        return "2nd";
      case "Third":
        return "3rd";
    }
  };

  return (
    <div className="space-y-6">
      {/* エラー・成功メッセージ */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* 作成ボタン */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleOpenCreateModal}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2"
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          新規作成
        </button>
        <button
          onClick={loadTmpScores}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
        >
          更新
        </button>
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingScore ? "仮スコア編集" : "仮スコア作成"}
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID
                </label>
                <input
                  type="number"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  disabled={!!editingScore}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステージ
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) =>
                    setFormData({ ...formData, stage: e.target.value as Stage })
                  }
                  disabled={!!editingScore}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {getStageLabel(stage)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  スコア
                </label>
                <input
                  type="number"
                  value={formData.score}
                  onChange={(e) =>
                    setFormData({ ...formData, score: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors font-semibold"
                >
                  {editingScore ? "更新" : "作成"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors font-semibold"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 仮スコア一覧 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">仮スコア一覧</h3>
          {!loading && filteredIds.length > 0 && (
            <div className="text-sm text-gray-600">
              全 {filteredIds.length} 件中 {startIndex + 1} - {Math.min(endIndex, filteredIds.length)} 件を表示
            </div>
          )}
        </div>

        {/* 検索バー */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchId}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="IDで検索..."
              className="w-full md:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchId && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        ) : filteredIds.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchId ? "検索結果がありません" : "仮スコアがありません"}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentIds.map((id) => {
                const scores = groupedScores[parseInt(id)];
                const totalScore = scores.reduce((sum: number, s: TmpScore) => sum + s.score, 0);
                return (
                  <div
                    key={id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <h4 className="text-xl font-bold text-purple-600">
                          ID: {id}
                        </h4>
                        <span className="text-lg font-semibold text-gray-700">
                          合計: {totalScore.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteAll(parseInt(id))}
                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                      >
                        全削除
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {scores.map((score: TmpScore) => (
                        <div
                          key={`${score.id}-${score.stage}`}
                          className="bg-gray-50 p-3 rounded border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-purple-700">
                              {getStageLabel(score.stage)}
                            </span>
                            <span className="text-lg font-bold">
                              {score.score.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(score)}
                              className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(score.id, score.stage)}
                              className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← 前へ
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // 最初のページ、最後のページ、現在のページ周辺のみ表示
                    const shouldShow =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    const shouldShowEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                    const shouldShowEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

                    if (shouldShowEllipsisBefore || shouldShowEllipsisAfter) {
                      return (
                        <span key={page} className="px-3 py-2 text-gray-500">
                          ...
                        </span>
                      );
                    }

                    if (!shouldShow) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-md border transition-colors ${
                          currentPage === page
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  次へ →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
