'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface PlayerScoreData {
  id: number;
  playerName: string;
  score: number;
  team_score_id: number;
  createdAt: string;
  updatedAt: string;
}

interface TeamScoreData {
  id: number;
  teamName: string;
  headcount: number;
  gameSessionName: string;
  description: string | null;
  score: number;
  createdAt: string;
  updatedAt: string;
}

interface TeamRanking {
  teamName: string;
  headcount: number;
  totalScore: number;
  count: number;
  gameSessionName: string;
}

function RankingContent() {
  const searchParams = useSearchParams();
  const [playerScores, setPlayerScores] = useState<PlayerScoreData[]>([]);
  const [teamScores, setTeamScores] = useState<TeamScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'team1' | 'team2' | 'team3' | 'team4'>('team1');

  // クエリパラメータから設定を取得
  const autoSwitch = searchParams.get('auto') === 'true'; // デフォルトfalse
  const intervalSeconds = parseInt(searchParams.get('interval') || '10', 10); // デフォルト10秒

  // 自動タブ切り替え
  useEffect(() => {
    if (!autoSwitch) return; // 自動切り替えが無効の場合は何もしない

    const tabs: ('team1' | 'team2' | 'team3' | 'team4')[] = ['team1', 'team2', 'team3', 'team4'];
    const AUTO_SWITCH_INTERVAL = intervalSeconds * 1000; // 秒をミリ秒に変換

    const interval = setInterval(() => {
      setActiveTab(currentTab => {
        const currentIndex = tabs.indexOf(currentTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        return tabs[nextIndex];
      });
    }, AUTO_SWITCH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoSwitch, intervalSeconds]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        console.log('Starting fetch...');
        
        // PlayerScoreとTeamScoreを並列取得
        const [playerRes, teamRes] = await Promise.all([
          fetch('/api/playerscores'),
          fetch('/api/teamscores')
        ]);

        console.log('playerRes.ok:', playerRes.ok, 'teamRes.ok:', teamRes.ok);

        if (!playerRes.ok || !teamRes.ok) {
          throw new Error('スコアの取得に失敗しました');
        }

        const playerData = await playerRes.json();
        const teamData = await teamRes.json();

        console.log('Fetched Player Scores:', playerData);
        console.log('Fetched Team Scores:', teamData);
        console.log('Player Scores length:', playerData.length);
        console.log('Team Scores length:', teamData.length);

        setPlayerScores(playerData);
        setTeamScores(teamData);
        
        console.log('State updated, loading will be set to false');
      } catch (err) {
        console.error('Error fetching scores:', err);
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
        console.log('Loading set to false');
      }
    };

    fetchScores();
  }, []);

  // チーム人数別にスコアを集計してランキング作成
  const getTeamRankings = (headcount: number): TeamRanking[] => {
    const teamMap = new Map<string, TeamRanking>();

    teamScores
      .filter(score => score.headcount === headcount)
      .forEach(score => {
        const key = `${score.teamName}_${score.gameSessionName}`;
        const existing = teamMap.get(key);
        if (existing) {
          existing.totalScore += score.score;
          existing.count += 1;
        } else {
          teamMap.set(key, {
            teamName: score.teamName,
            headcount: score.headcount,
            gameSessionName: score.gameSessionName,
            totalScore: score.score,
            count: 1
          });
        }
      });

    return Array.from(teamMap.values())
      .sort((a, b) => b.totalScore - a.totalScore);
  };

  const renderTeamRankings = (headcount: number) => {
    const rankings = getTeamRankings(headcount);
    
    if (rankings.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-[#666] text-lg tracking-wider">NO DATA AVAILABLE</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[#1a1a1a] border-b-2 border-[#4a90e2]" style={{ boxShadow: '0 2px 15px rgba(74, 144, 226, 0.3)' }}>
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#4a90e2] uppercase tracking-wider">順位</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-[#4a90e2] uppercase tracking-wider">チーム名</th>
              <th className="px-6 py-4 text-right text-sm font-bold text-[#4a90e2] uppercase tracking-wider">スコア</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((ranking, index) => (
              <tr 
                key={`${ranking.teamName}_${ranking.gameSessionName}`} 
                className={`border-b border-[#3a3a3a] transition-all duration-300 ${
                  index % 2 === 0 ? 'bg-[#2a2a2a]' : 'bg-[#222]'
                } hover:bg-[#333] hover:shadow-[0_0_15px_rgba(74,144,226,0.2)]`}
              >
                <td className="px-6 py-5">
                  <span className={`font-bold text-lg ${
                    index === 0 ? 'text-[#FFD700]' :
                    index === 1 ? 'text-[#C0C0C0]' :
                    index === 2 ? 'text-[#CD7F32]' :
                    'text-[#e0e0e0]'
                  }`} style={
                    index < 3 ? { textShadow: `0 0 10px ${
                      index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
                    }` } : {}
                  }>
                    {index + 1}
                    {index === 0 && ' 🥇'}
                    {index === 1 && ' 🥈'}
                    {index === 2 && ' 🥉'}
                  </span>
                </td>
                <td className="px-6 py-5 font-bold text-[#e0e0e0] tracking-wide">{ranking.teamName}</td>
                <td className="px-6 py-5 text-right font-bold text-[#4a90e2] text-lg" 
                    style={{ textShadow: '0 0 10px rgba(74, 144, 226, 0.5)' }}>
                  {ranking.totalScore.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181818]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#4a90e2] border-t-transparent"></div>
          <p className="mt-6 text-[#e0e0e0] text-lg font-semibold tracking-wider">LOADING...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181818]">
        <div className="bg-[#2a2a2a] border-2 border-red-500 rounded-lg p-8 max-w-md shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <h2 className="text-red-400 font-bold text-xl mb-3 tracking-wide">ERROR</h2>
          <p className="text-[#e0e0e0]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* タイトル */}
        <h1 className="text-5xl md:text-6xl font-bold text-[#e0e0e0] mb-12 text-center tracking-wider"
            style={{ 
              fontFamily: 'system-ui, sans-serif',
              textShadow: '0 0 20px rgba(74, 144, 226, 0.5), 0 0 40px rgba(74, 144, 226, 0.3)' 
            }}>
          🏆 RANKING
        </h1>

        {/* タブナビゲーション */}
        <div className="bg-[#2a2a2a] rounded-lg shadow-[0_0_30px_rgba(74,144,226,0.2)] mb-8 border border-[#3a3a3a]">
          <div className="flex border-b border-[#3a3a3a] overflow-x-auto">
            <button
              onClick={() => setActiveTab('team1')}
              className={`px-8 py-5 font-bold text-sm whitespace-nowrap transition-all duration-300 tracking-wider ${
                activeTab === 'team1'
                  ? 'border-b-3 border-[#4a90e2] text-[#4a90e2] bg-[#1a1a1a] shadow-[0_0_20px_rgba(74,144,226,0.4)]'
                  : 'text-[#999] hover:text-[#e0e0e0] hover:bg-[#333]'
              }`}
              style={activeTab === 'team1' ? { 
                textShadow: '0 0 10px rgba(74, 144, 226, 0.8)' 
              } : {}}
            >
              1人チーム
            </button>
            <button
              onClick={() => setActiveTab('team2')}
              className={`px-8 py-5 font-bold text-sm whitespace-nowrap transition-all duration-300 tracking-wider ${
                activeTab === 'team2'
                  ? 'border-b-3 border-[#4a90e2] text-[#4a90e2] bg-[#1a1a1a] shadow-[0_0_20px_rgba(74,144,226,0.4)]'
                  : 'text-[#999] hover:text-[#e0e0e0] hover:bg-[#333]'
              }`}
              style={activeTab === 'team2' ? { 
                textShadow: '0 0 10px rgba(74, 144, 226, 0.8)' 
              } : {}}
            >
              2人チーム
            </button>
            <button
              onClick={() => setActiveTab('team3')}
              className={`px-8 py-5 font-bold text-sm whitespace-nowrap transition-all duration-300 tracking-wider ${
                activeTab === 'team3'
                  ? 'border-b-3 border-[#4a90e2] text-[#4a90e2] bg-[#1a1a1a] shadow-[0_0_20px_rgba(74,144,226,0.4)]'
                  : 'text-[#999] hover:text-[#e0e0e0] hover:bg-[#333]'
              }`}
              style={activeTab === 'team3' ? { 
                textShadow: '0 0 10px rgba(74, 144, 226, 0.8)' 
              } : {}}
            >
              3人チーム
            </button>
            <button
              onClick={() => setActiveTab('team4')}
              className={`px-8 py-5 font-bold text-sm whitespace-nowrap transition-all duration-300 tracking-wider ${
                activeTab === 'team4'
                  ? 'border-b-3 border-[#4a90e2] text-[#4a90e2] bg-[#1a1a1a] shadow-[0_0_20px_rgba(74,144,226,0.4)]'
                  : 'text-[#999] hover:text-[#e0e0e0] hover:bg-[#333]'
              }`}
              style={activeTab === 'team4' ? { 
                textShadow: '0 0 10px rgba(74, 144, 226, 0.8)' 
              } : {}}
            >
              4人チーム
            </button>
          </div>
        </div>

        {/* ランキング表示エリア */}
        <div className="bg-[#2a2a2a] rounded-lg shadow-[0_0_40px_rgba(74,144,226,0.3)] overflow-hidden border border-[#3a3a3a]">
          <div className="p-8">
            {activeTab === 'team1' && (
              <>
                <h2 className="text-3xl font-bold text-[#e0e0e0] mb-8 tracking-wider"
                    style={{ textShadow: '0 0 15px rgba(74, 144, 226, 0.5)' }}>
                  1人チームランキング
                </h2>
                {renderTeamRankings(1)}
              </>
            )}
            {activeTab === 'team2' && (
              <>
                <h2 className="text-3xl font-bold text-[#e0e0e0] mb-8 tracking-wider"
                    style={{ textShadow: '0 0 15px rgba(74, 144, 226, 0.5)' }}>
                  2人チームランキング
                </h2>
                {renderTeamRankings(2)}
              </>
            )}
            {activeTab === 'team3' && (
              <>
                <h2 className="text-3xl font-bold text-[#e0e0e0] mb-8 tracking-wider"
                    style={{ textShadow: '0 0 15px rgba(74, 144, 226, 0.5)' }}>
                  3人チームランキング
                </h2>
                {renderTeamRankings(3)}
              </>
            )}
            {activeTab === 'team4' && (
              <>
                <h2 className="text-3xl font-bold text-[#e0e0e0] mb-8 tracking-wider"
                    style={{ textShadow: '0 0 15px rgba(74, 144, 226, 0.5)' }}>
                  4人チームランキング
                </h2>
                {renderTeamRankings(4)}
              </>
            )}
          </div>
        </div>

        {/* 統計情報 */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#2a2a2a] rounded-lg shadow-[0_0_25px_rgba(74,144,226,0.2)] p-8 border border-[#3a3a3a] hover:shadow-[0_0_35px_rgba(74,144,226,0.4)] transition-all duration-300">
            <h3 className="text-sm font-semibold text-[#999] mb-3 uppercase tracking-wider">Team Scores</h3>
            <p className="text-5xl font-bold text-[#4a90e2]" 
               style={{ textShadow: '0 0 20px rgba(74, 144, 226, 0.6)' }}>
              {teamScores.length}
            </p>
          </div>
          <div className="bg-[#2a2a2a] rounded-lg shadow-[0_0_25px_rgba(74,144,226,0.2)] p-8 border border-[#3a3a3a] hover:shadow-[0_0_35px_rgba(74,144,226,0.4)] transition-all duration-300">
            <h3 className="text-sm font-semibold text-[#999] mb-3 uppercase tracking-wider">Player Scores</h3>
            <p className="text-5xl font-bold text-[#4a90e2]"
               style={{ textShadow: '0 0 20px rgba(74, 144, 226, 0.6)' }}>
              {playerScores.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RankingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#181818]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#4a90e2] border-t-transparent"></div>
          <p className="mt-6 text-[#e0e0e0] text-lg font-semibold tracking-wider">LOADING...</p>
        </div>
      </div>
    }>
      <RankingContent />
    </Suspense>
  );
}
