"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  getTeamScores,
  createTeamScore,
  updateTeamScore,
  deleteTeamScore,
  getPlayerScores,
  createPlayerScore,
  updatePlayerScore,
  deletePlayerScore,
} from "./actions";

interface PlayerScore {
  id: number;
  playerName: string;
  score: number;
  team_score_id: number;
  createdAt: string;
  updatedAt: string;
}

interface TeamScore {
  id: number;
  teamName: string;
  headcount: number;
  description: string | null;
  score: number;
  createdAt: string;
  updatedAt: string;
  playerScores?: PlayerScore[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type SortField = "id" | "score" | "createdAt";
type SortDirection = "asc" | "desc";

export default function ScoreManagement() {
  const [activeTab, setActiveTab] = useState<"team" | "player">("team");
  const [teamScores, setTeamScores] = useState<TeamScore[]>([]);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // モーダル状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamScore | null>(null);
  const [modalPlayers, setModalPlayers] = useState<Array<{ id?: number; playerName: string; score: number }>>([]);
  
  // ページネーション情報
  const [teamPagination, setTeamPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [playerPagination, setPlayerPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  // ソート状態
  const [teamSortField, setTeamSortField] = useState<SortField>("createdAt");
  const [teamSortDirection, setTeamSortDirection] = useState<SortDirection>("desc");
  const [playerSortField, setPlayerSortField] = useState<SortField>("createdAt");
  const [playerSortDirection, setPlayerSortDirection] = useState<SortDirection>("desc");

  // チームスコアフォーム
  const [teamForm, setTeamForm] = useState({
    teamName: "",
    headcount: 1,
    description: "",
    score: 0,
  });

  // ソート処理
  const handleTeamSort = (field: SortField) => {
    if (teamSortField === field) {
      setTeamSortDirection(teamSortDirection === "asc" ? "desc" : "asc");
    } else {
      setTeamSortField(field);
      setTeamSortDirection("asc");
    }
  };

  const handlePlayerSort = (field: SortField) => {
    if (playerSortField === field) {
      setPlayerSortDirection(playerSortDirection === "asc" ? "desc" : "asc");
    } else {
      setPlayerSortField(field);
      setPlayerSortDirection("asc");
    }
  };

  // データ取得
  const fetchTeamScores = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTeamScores({
        page: teamPagination.page,
        limit: teamPagination.limit,
        sortBy: teamSortField,
        sortOrder: teamSortDirection,
      });

      setTeamScores(result.data);
      setTeamPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerScores = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPlayerScores({
        page: playerPagination.page,
        limit: playerPagination.limit,
        sortBy: playerSortField,
        sortOrder: playerSortDirection,
      });

      setPlayerScores(result.data);
      setPlayerPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = () => {
    fetchTeamScores();
    fetchPlayerScores();
  };

  // データ取得（初回とソート・ページ変更時）
  useEffect(() => {
    fetchTeamScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamPagination.page, teamPagination.limit, teamSortField, teamSortDirection]);

  useEffect(() => {
    fetchPlayerScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerPagination.page, playerPagination.limit, playerSortField, playerSortDirection]);

  // プレイヤーが変更されたら人数とスコアを自動計算
  useEffect(() => {
    const headcount = modalPlayers.filter(p => p.playerName.trim()).length;
    const totalScore = modalPlayers.reduce((sum, p) => sum + (p.score || 0), 0);
    
    setTeamForm(prev => ({
      ...prev,
      headcount: headcount, // 0人も許可
      score: totalScore,
    }));
  }, [modalPlayers]);

  // ページサイズ変更
  const handleTeamPageSizeChange = (newSize: number) => {
    setTeamPagination({ ...teamPagination, page: 1, limit: newSize });
  };

  const handlePlayerPageSizeChange = (newSize: number) => {
    setPlayerPagination({ ...playerPagination, page: 1, limit: newSize });
  };

  // ページ変更
  const handleTeamPageChange = (newPage: number) => {
    setTeamPagination({ ...teamPagination, page: newPage });
  };

  const handlePlayerPageChange = (newPage: number) => {
    setPlayerPagination({ ...playerPagination, page: newPage });
  };

  // ソートアイコン表示
  const SortIcon = ({ field, currentField, direction }: { field: SortField; currentField: SortField; direction: SortDirection }) => {
    if (field !== currentField) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    return direction === "asc" ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
  };

  // ページネーションコンポーネント
  const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    pageSize, 
    onPageSizeChange,
    totalItems 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    totalItems: number;
  }) => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-700">
              <span className="font-medium">{startItem}</span> ～ <span className="font-medium">{endItem}</span> 件 / 全 <span className="font-medium">{totalItems}</span> 件
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">表示件数:</label>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              最初
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              前へ
            </button>
            
            <div className="flex gap-1">
              {startPage > 1 && (
                <>
                  <button
                    onClick={() => onPageChange(1)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    1
                  </button>
                  {startPage > 2 && <span className="px-2 py-1 text-gray-500">...</span>}
                </>
              )}
              
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 border rounded-lg text-sm ${
                    currentPage === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              
              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && <span className="px-2 py-1 text-gray-500">...</span>}
                  <button
                    onClick={() => onPageChange(totalPages)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              最後
            </button>
          </div>
        </div>
      </div>
    );
  };

  // モーダルを開く（新規作成）
  const openCreateModal = () => {
    setEditingTeam(null);
    setTeamForm({
      teamName: "",
      headcount: 1,
      description: "",
      score: 0,
    });
    setModalPlayers([]);
    setIsModalOpen(true);
  };

  // モーダルを開く（編集）
  const openEditModal = (team: TeamScore) => {
    setEditingTeam(team);
    setTeamForm({
      teamName: team.teamName,
      headcount: team.headcount,
      description: team.description || "",
      score: team.score,
    });
    setModalPlayers(
      team.playerScores?.map(p => ({ id: p.id, playerName: p.playerName, score: p.score })) || []
    );
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setModalPlayers([]);
  };

  // プレイヤーを追加
  const addPlayer = () => {
    setModalPlayers([...modalPlayers, { playerName: "", score: 0 }]);
  };

  // プレイヤーを削除
  const removePlayer = (index: number) => {
    setModalPlayers(modalPlayers.filter((_, i) => i !== index));
  };

  // プレイヤーを更新
  const updatePlayer = (index: number, field: "playerName" | "score", value: string | number) => {
    const updated = [...modalPlayers];
    updated[index] = { ...updated[index], [field]: value };
    setModalPlayers(updated);
  };

  // チームスコア作成・更新（プレイヤー込み）
  const handleSaveTeamWithPlayers = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション: 1人以上のプレイヤーが必要
    const validPlayers = modalPlayers.filter(p => p.playerName.trim());
    if (validPlayers.length === 0) {
      setError("少なくとも1人のプレイヤーを追加してください");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      let teamId: number;

      if (editingTeam) {
        // 更新
        await updateTeamScore(editingTeam.id, teamForm);
        teamId = editingTeam.id;

        // 既存プレイヤーを更新・削除
        const existingPlayerIds = new Set(modalPlayers.filter(p => p.id).map(p => p.id!));
        const currentPlayerIds = new Set(editingTeam.playerScores?.map(p => p.id) || []);

        // 削除されたプレイヤー
        for (const id of currentPlayerIds) {
          if (!existingPlayerIds.has(id)) {
            await deletePlayerScore(id);
          }
        }

        // プレイヤーを更新または作成
        for (const player of modalPlayers) {
          if (player.id) {
            await updatePlayerScore(player.id, {
              playerName: player.playerName,
              score: player.score,
            });
          } else {
            await createPlayerScore({
              playerName: player.playerName,
              score: player.score,
              team_score_id: teamId,
            });
          }
        }

        alert("チームスコアを更新しました");
      } else {
        // 新規作成
        const result = await createTeamScore(teamForm);
        teamId = result.id;

        // プレイヤーを作成
        for (const player of modalPlayers) {
          if (player.playerName) {
            await createPlayerScore({
              playerName: player.playerName,
              score: player.score,
              team_score_id: teamId,
            });
          }
        }

        alert("チームスコアを作成しました");
      }

      closeModal();
      await fetchTeamScores();
      await fetchPlayerScores();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // チームスコア作成（旧）
  const handleCreateTeamScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createTeamScore(teamForm);

      // フォームリセット
      setTeamForm({
        teamName: "",
        headcount: 1,
        description: "",
        score: 0,
      });

      // データ再取得
      await fetchTeamScores();
      alert("チームスコアを作成しました");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // チームスコア削除
  const handleDeleteTeamScore = async (id: number) => {
    if (!confirm("このチームスコアを削除しますか?")) return;

    setLoading(true);
    try {
      await deleteTeamScore(id);
      await fetchTeamScores();
      alert("削除しました");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* タブ */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("team")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "team"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          チームスコア
        </button>
        <button
          onClick={() => setActiveTab("player")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "player"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          プレイヤースコア
        </button>
      </div>

      {/* チームスコアタブ */}
      {activeTab === "team" && (
        <div className="space-y-6">
          {/* チームスコア作成ボタン */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <button
              onClick={openCreateModal}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              + 新規チームスコア作成
            </button>
          </div>

          {/* チームスコア一覧 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">チームスコア一覧</h3>
              <button
                onClick={fetchTeamScores}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "更新中..." : "更新"}
              </button>
            </div>
            {teamScores.length === 0 ? (
              <p className="text-gray-500 text-center py-8">チームスコアがありません</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => handleTeamSort("id")}
                        >
                          ID <SortIcon field="id" currentField={teamSortField} direction={teamSortDirection} />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">チーム名</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">人数</th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => handleTeamSort("score")}
                        >
                          スコア <SortIcon field="score" currentField={teamSortField} direction={teamSortDirection} />
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => handleTeamSort("createdAt")}
                        >
                          作成日時 <SortIcon field="createdAt" currentField={teamSortField} direction={teamSortDirection} />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teamScores.map((team) => (
                        <tr key={team.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{team.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{team.teamName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.headcount}人</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{team.score}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(team.createdAt), "yyyy/M/d HH:mm", { locale: ja })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(team)}
                                disabled={loading}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                編集
                              </button>
                              <button
                                onClick={() => handleDeleteTeamScore(team.id)}
                                disabled={loading}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                削除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={teamPagination.page}
                  totalPages={teamPagination.totalPages}
                  onPageChange={handleTeamPageChange}
                  pageSize={teamPagination.limit}
                  onPageSizeChange={handleTeamPageSizeChange}
                  totalItems={teamPagination.total}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* プレイヤースコアタブ */}
      {activeTab === "player" && (
        <div className="space-y-6">
          {/* 閲覧専用の説明 */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>ℹ️ プレイヤースコアは閲覧のみです。</strong><br />
              プレイヤースコアの追加・編集は、チームスコアタブから「編集」ボタンをクリックして行ってください。
            </p>
          </div>

          {/* プレイヤースコア一覧 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">プレイヤースコア一覧</h3>
              <button
                onClick={fetchPlayerScores}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "更新中..." : "更新"}
              </button>
            </div>
            {playerScores.length === 0 ? (
              <p className="text-gray-500 text-center py-8">プレイヤースコアがありません</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => handlePlayerSort("id")}
                        >
                          ID <SortIcon field="id" currentField={playerSortField} direction={playerSortDirection} />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">プレイヤー名</th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => handlePlayerSort("score")}
                        >
                          スコア <SortIcon field="score" currentField={playerSortField} direction={playerSortDirection} />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">チームID</th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => handlePlayerSort("createdAt")}
                        >
                          作成日時 <SortIcon field="createdAt" currentField={playerSortField} direction={playerSortDirection} />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {playerScores.map((player) => (
                        <tr key={player.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{player.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{player.playerName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{player.score}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{player.team_score_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(player.createdAt), "yyyy/M/d HH:mm", { locale: ja })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={playerPagination.page}
                  totalPages={playerPagination.totalPages}
                  onPageChange={handlePlayerPageChange}
                  pageSize={playerPagination.limit}
                  onPageSizeChange={handlePlayerPageSizeChange}
                  totalItems={playerPagination.total}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* チームスコア作成・編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingTeam ? "チームスコア編集" : "チームスコア作成"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveTeamWithPlayers} className="space-y-6">
                {/* チーム情報 */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <h3 className="font-bold text-lg text-gray-900">チーム情報</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        チーム名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={teamForm.teamName}
                        onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        人数 <span className="text-gray-500 text-xs">(自動計算)</span>
                      </label>
                      <input
                        type="number"
                        value={teamForm.headcount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                        title="プレイヤー数から自動計算されます"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        スコア <span className="text-gray-500 text-xs">(自動計算)</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={teamForm.score}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                        title="プレイヤースコアの合計から自動計算されます"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                    <textarea
                      value={teamForm.description}
                      onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* プレイヤースコア */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900">プレイヤースコア</h3>
                    <button
                      type="button"
                      onClick={addPlayer}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      + プレイヤー追加
                    </button>
                  </div>

                  {modalPlayers.length === 0 ? (
                    <p className="text-gray-500 text-sm">プレイヤーがいません。追加してください。</p>
                  ) : (
                    <div className="space-y-3">
                      {modalPlayers.map((player, index) => (
                        <div key={index} className="flex gap-3 items-start bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              プレイヤー名 <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={player.playerName}
                              onChange={(e) => updatePlayer(index, "playerName", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              スコア <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              required
                              value={player.score}
                              onChange={(e) => updatePlayer(index, "score", parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePlayer(index)}
                            className="mt-6 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            削除
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* アクションボタン */}
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={loading || teamForm.headcount === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={teamForm.headcount === 0 ? "少なくとも1人のプレイヤーを追加してください" : ""}
                  >
                    {loading ? "保存中..." : editingTeam ? "更新" : "作成"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
