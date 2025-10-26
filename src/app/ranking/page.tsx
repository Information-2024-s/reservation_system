'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TerminalBackground from './TerminalBackground';
import './terminal-bg.css';

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
        const key = score.teamName;
        const existing = teamMap.get(key);
        if (existing) {
          existing.totalScore += score.score;
          existing.count += 1;
        } else {
          teamMap.set(key, {
            teamName: score.teamName,
            headcount: score.headcount,
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
          <p className="text-[#9aa3a6] text-lg tracking-wider">NO DATA AVAILABLE</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr 
              className="bg-[rgba(74,144,226,0.1)] border-b border-[rgba(74,144,226,0.2)]"
            >
              <th 
                className="px-5 py-3 text-left font-bold text-[#4a90e2] text-xs uppercase tracking-wider"
                style={{ 
                  fontFamily: 'system-ui, sans-serif',
                  letterSpacing: '0.05em',
                  width: '80px',
                }}
              >
                順位
              </th>
              <th 
                className="px-5 py-3 text-left font-bold text-[#4a90e2] text-xs uppercase tracking-wider"
                style={{ 
                  fontFamily: 'system-ui, sans-serif',
                  letterSpacing: '0.05em',
                  width: 'auto',
                }}
              >
                チーム名
              </th>
              <th 
                className="px-5 py-3 text-right font-bold text-[#4a90e2] text-xs uppercase tracking-wider"
                style={{ 
                  fontFamily: 'system-ui, sans-serif',
                  letterSpacing: '0.05em',
                  width: '120px',
                }}
              >
                スコア
              </th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((ranking, index) => (
              <tr 
                key={`${ranking.teamName}_${index}`} 
                className={`border-b border-[rgba(74,144,226,0.1)] transition-all duration-300 ${
                  index % 2 === 0 ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(255,255,255,0.01)]'
                } hover:bg-[rgba(74,144,226,0.05)]`}
              >
                <td className="px-5 py-4 align-middle">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`w-10 h-10 rounded-lg grid place-items-center text-sm font-semibold tracking-wider uppercase transition-all duration-250 ${
                        index === 0 ? 'bg-gradient-to-b from-[rgba(60,50,20,0.85)] to-[rgba(25,20,5,0.95)] text-[#fff7d1] border-[rgba(255,230,150,0.45)]' :
                        index === 1 ? 'bg-gradient-to-b from-[rgba(35,40,55,0.85)] to-[rgba(15,18,25,0.95)] text-[#eef1ff] border-[rgba(190,210,255,0.45)]' :
                        index === 2 ? 'bg-gradient-to-b from-[rgba(45,25,20,0.85)] to-[rgba(25,10,5,0.95)] text-[#ffe0c0] border-[rgba(255,180,120,0.4)]' :
                        'bg-[rgba(10,15,25,0.7)] text-[#eaf2ff] border-[rgba(120,220,255,0.25)]'
                      } border-[1.5px]`}
                      style={{
                        backdropFilter: 'blur(14px) saturate(200%)',
                        WebkitBackdropFilter: 'blur(14px) saturate(200%)',
                        boxShadow: index === 0 ? 'inset 0 0 14px rgba(255, 220, 120, 0.25), 0 0 18px rgba(255, 200, 90, 0.4), 0 0 6px rgba(255, 255, 180, 0.3)' :
                                   index === 1 ? 'inset 0 0 14px rgba(190, 210, 255, 0.25), 0 0 18px rgba(150, 170, 255, 0.35), 0 0 6px rgba(220, 230, 255, 0.25)' :
                                   index === 2 ? 'inset 0 0 14px rgba(255, 150, 100, 0.25), 0 0 18px rgba(255, 130, 70, 0.4), 0 0 6px rgba(255, 200, 160, 0.25)' : '',
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 font-semibold text-white align-middle">
                  {ranking.teamName}
                </td>
                <td 
                  className="px-5 py-4 text-right font-bold text-white text-base align-middle"
                  style={{ textShadow: '0 0 8px rgba(74, 144, 226, 0.3)' }}
                >
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
      <div className="ranking-page min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b0f0f] to-[#0f1414] relative">
        <TerminalBackground />
        <div className="text-center relative z-10">
          <div 
            className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent"
            style={{
              borderTopColor: '#4a90e2',
              borderRightColor: '#4a90e2',
            }}
          />
          <p 
            className="mt-6 text-[#e0f0ff] text-lg font-semibold tracking-wider uppercase"
            style={{ letterSpacing: '0.08em' }}
          >
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ranking-page min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b0f0f] to-[#0f1414] relative">
        <TerminalBackground />
        <div 
          className="p-8 max-w-md relative z-10"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderLeft: '2px solid #ef4444',
            clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%)',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          <div 
            className="absolute bottom-0 right-0 w-[7px] h-[7px]"
            style={{
              background: '#ef4444',
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
            }}
          />
          <h2 
            className="text-red-400 font-bold text-xl mb-3 tracking-wide uppercase"
            style={{ letterSpacing: '0.08em' }}
          >
            ERROR
          </h2>
          <p className="text-[#e0f0ff]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-page min-h-screen bg-gradient-to-b from-[#0b0f0f] to-[#0f1414] py-12 px-6 flex justify-center relative">
      <TerminalBackground />
      <div className="ranking-content w-full max-w-[1100px]">
        {/* タイトル */}
        <header className="text-center mb-6">
          <h1 
            className="text-5xl md:text-6xl font-extrabold text-[#e0f0ff] uppercase tracking-wider"
            style={{ 
              fontFamily: 'system-ui, sans-serif',
              textShadow: '0 0 4px rgba(224, 240, 255, 0.6), 0 0 8px rgba(224, 240, 255, 0.5), 0 0 12px rgba(74, 144, 226, 0.5), 0 0 18px rgba(74, 144, 226, 0.4), 0 0 24px rgba(74, 144, 226, 0.3)',
              lineHeight: 1.2,
            }}>
            RANKING
          </h1>
        </header>

        {/* タブナビゲーション */}
        <nav className="flex justify-around mb-8" role="tablist" aria-label="チームタイプ切替">
          <button
            onClick={() => setActiveTab('team1')}
            className={`px-4 py-3 font-semibold text-lg uppercase tracking-wider transition-colors duration-200 relative ${
              activeTab === 'team1' ? 'text-white' : 'text-white/70 hover:text-white'
            }`}
            style={activeTab === 'team1' ? {
              borderBottom: '2px solid #4a90e2',
            } : {}}
          >
            1人チーム
          </button>
          <button
            onClick={() => setActiveTab('team2')}
            className={`px-4 py-3 font-semibold text-lg uppercase tracking-wider transition-colors duration-200 relative ${
              activeTab === 'team2' ? 'text-white' : 'text-white/70 hover:text-white'
            }`}
            style={activeTab === 'team2' ? {
              borderBottom: '2px solid #4a90e2',
            } : {}}
          >
            2人チーム
          </button>
          <button
            onClick={() => setActiveTab('team3')}
            className={`px-4 py-3 font-semibold text-lg uppercase tracking-wider transition-colors duration-200 relative ${
              activeTab === 'team3' ? 'text-white' : 'text-white/70 hover:text-white'
            }`}
            style={activeTab === 'team3' ? {
              borderBottom: '2px solid #4a90e2',
            } : {}}
          >
            3人チーム
          </button>
          <button
            onClick={() => setActiveTab('team4')}
            className={`px-4 py-3 font-semibold text-lg uppercase tracking-wider transition-colors duration-200 relative ${
              activeTab === 'team4' ? 'text-white' : 'text-white/70 hover:text-white'
            }`}
            style={activeTab === 'team4' ? {
              borderBottom: '2px solid #4a90e2',
            } : {}}
          >
            4人チーム
          </button>
        </nav>

        {/* ランキング表示エリア */}
        <main 
          className="p-7 relative"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(74, 144, 226, 0.25)',
            borderLeft: '2px solid #4a90e2',
            clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* 右下の三角形 */}
          <div 
            className="absolute bottom-0 right-0 w-[7px] h-[7px]"
            style={{
              background: '#4a90e2',
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
            }}
          />
          
          <h2 
            className="text-xl font-semibold text-white mb-5 tracking-wider uppercase"
            id="panel-title"
            style={{
              fontFamily: 'system-ui, sans-serif',
              letterSpacing: '0.08em',
              textShadow: '0 0 10px rgba(74, 144, 226, 0.3)',
            }}
          >
            {activeTab === 'team1' && '1人チームランキング'}
            {activeTab === 'team2' && '2人チームランキング'}
            {activeTab === 'team3' && '3人チームランキング'}
            {activeTab === 'team4' && '4人チームランキング'}
          </h2>

          {/* テーブル表示 */}
          {activeTab === 'team1' && renderTeamRankings(1)}
          {activeTab === 'team2' && renderTeamRankings(2)}
          {activeTab === 'team3' && renderTeamRankings(3)}
          {activeTab === 'team4' && renderTeamRankings(4)}

          {/* 統計情報 */}
          <div className="grid grid-cols-2 gap-5 mt-7">
            <div 
              className="p-6 flex flex-col items-start justify-between h-[120px] relative"
              style={{
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(74, 144, 226, 0.25)',
                borderLeft: '2px solid #4a90e2',
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div 
                className="absolute bottom-0 right-0 w-[7px] h-[7px]"
                style={{
                  background: '#4a90e2',
                  clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                }}
              />
              <div 
                className="text-xs font-bold text-[#4a90e2] uppercase tracking-wider"
                style={{ letterSpacing: '0.05em' }}
              >
                TEAM SCORES
              </div>
              <div 
                className="text-5xl font-extrabold text-white leading-none"
                style={{ textShadow: '0 0 10px rgba(74, 144, 226, 0.3)' }}
              >
                {teamScores.length}
              </div>
            </div>

            <div 
              className="p-6 flex flex-col items-start justify-between h-[120px] relative"
              style={{
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(74, 144, 226, 0.25)',
                borderLeft: '2px solid #4a90e2',
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div 
                className="absolute bottom-0 right-0 w-[7px] h-[7px]"
                style={{
                  background: '#4a90e2',
                  clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                }}
              />
              <div 
                className="text-xs font-bold text-[#4a90e2] uppercase tracking-wider"
                style={{ letterSpacing: '0.05em' }}
              >
                PLAYER SCORES
              </div>
              <div 
                className="text-5xl font-extrabold text-white leading-none"
                style={{ textShadow: '0 0 10px rgba(74, 144, 226, 0.3)' }}
              >
                {playerScores.length}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function RankingPage() {
  return (
    <Suspense fallback={
      <div className="ranking-page min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b0f0f] to-[#0f1414] relative">
        <TerminalBackground />
        <div className="text-center relative z-10">
          <div 
            className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent"
            style={{
              borderTopColor: '#4a90e2',
              borderRightColor: '#4a90e2',
            }}
          />
          <p 
            className="mt-6 text-[#e0f0ff] text-lg font-semibold tracking-wider uppercase"
            style={{ letterSpacing: '0.08em' }}
          >
            LOADING...
          </p>
        </div>
      </div>
    }>
      <RankingContent />
    </Suspense>
  );
}
