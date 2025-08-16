'use client';

import { useEffect, useState } from 'react';

interface RankingItem {
  id: number;
  name: string;
  score: number; // score.tsのランキングエンドポイントから取得
  createdAt: string;
  updatedAt: string;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch('/api/scores');
        if (!response.ok) {
          throw new Error('ランキングデータの取得に失敗しました');
        }
        const data = await response.json();
        setRanking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600'; // 金
      case 2:
        return 'from-gray-300 to-gray-500'; // 銀
      case 3:
        return 'from-orange-400 to-orange-600'; // 銅
      default:
        return 'from-blue-500 to-blue-700'; // 通常
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'; // 金メダル（王者の称号）
      case 2:
        return '🥈'; // ロボット（ガンダム支部）
      case 3:
        return '🥉'; // 建設（ジオラマ同盟）
      default:
        return '🏅'; // 歯車（その他）
    }
  };

  if (loading) {
    return (
      <div className="ranking-container">
        <div className="ranking-header">
          <h1>スコアランキング</h1>
        </div>
        <div className="loading">
          データを読み込んでいます...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ranking-container">
        <div className="ranking-header">
          <h1>スコアランキング</h1>
        </div>
        <div className="error">
          エラー: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-container">
      <div className="ranking-header">
        <h1>順位　階級　名前　最高スコア</h1>
      </div>
      
      <div className="ranking-list">
        {ranking.map((item, index) => (
          <div 
            key={item.id} 
            className={`ranking-item rank-${index + 1 <= 3 ? 'top' : 'normal'}`}
          >
            <div className={`rank-badge bg-gradient-to-r ${getRankColor(index + 1)}`}>
              <span className="rank-number">{index + 1}位</span>
            </div>
            
            <div className="player-info">
              <div className="rank-icon">{getRankIcon(index + 1)}</div>
              <div className="player-details">
            <div className="player-name">{item.name}</div>
            {index + 1 <= 3 && (
              <div className="rank-title">
                {index + 1 === 1 && '王者の称号'}
                {index + 1 === 2 && 'ガンダム支部'}
                {index + 1 === 3 && 'ジオラマ同盟'}
              </div>
            )}
            {index + 1 === 4 && (
              <div className="rank-title">First世代</div>
            )}
            {index + 1 === 5 && (
              <div className="rank-title">テクニカルラボ</div>
            )}
            {index + 1 === 23 && (
              <div className="rank-title">ジオラマ支部特別足回復</div>
            )}
              </div>
            </div>
            
            <div className="score-display">
              <div className="total-score">
            {item.score.toLocaleString()}pt
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .ranking-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a1628 0%, #1e3c72 50%, #2a5298 100%);
          padding: 20px;
          font-family: 'BestTenDot-Regular', monospace;
          position: relative;
          overflow-x: hidden;
        }

        .ranking-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(100, 200, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 100, 200, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .ranking-header {
          text-align: center;
          margin-bottom: 30px;
          color: white;
          position: relative;
          z-index: 1;
        }

        .ranking-header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          background: linear-gradient(45deg, #fff, #add8e6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-decoration {
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .star {
          font-size: 1.5rem;
          animation: sparkle 2s infinite;
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .ranking-list {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
          position: relative;
          z-index: 1;
        }

        .ranking-item {
          background: linear-gradient(135deg, 
            rgba(30, 60, 114, 0.8) 0%, 
            rgba(42, 82, 152, 0.8) 50%, 
            rgba(30, 60, 114, 0.8) 100%);
          border: 2px solid rgba(100, 200, 255, 0.3);
          border-radius: 15px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 20px;
          backdrop-filter: blur(15px);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .ranking-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            transparent 50%, 
            rgba(255, 255, 255, 0.05) 100%);
          pointer-events: none;
        }

        .ranking-item:hover {
          transform: translateY(-5px);
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.4),
            0 0 20px rgba(100, 200, 255, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          border-color: rgba(100, 200, 255, 0.5);
        }

        .ranking-item.rank-top {
          border-color: rgba(255, 215, 0, 0.6);
          box-shadow: 
            0 4px 25px rgba(0, 0, 0, 0.3),
            0 0 25px rgba(255, 215, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .rank-badge {
          min-width: 80px;
          height: 50px;
          border-radius: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          box-shadow: 
            0 4px 12px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .rank-number {
          font-size: 1.2rem;
        }

        .player-info {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 1;
        }

        .rank-icon {
          font-size: 2.5rem;
          filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));
        }

        .player-details {
          color: white;
        }

        .player-name {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 5px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          color: #e6f3ff;
        }

        .rank-title {
          font-size: 0.9rem;
          color: rgba(173, 216, 230, 0.9);
          font-style: italic;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }

        .score-display {
          text-align: right;
          color: white;
        }

        .total-score {
          font-size: 1.8rem;
          font-weight: bold;
          background: linear-gradient(45deg, #FFD700, #FFA500, #FF8C00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
          filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
        }

        .loading, .error {
          text-align: center;
          color: white;
          font-size: 1.2rem;
          margin-top: 50px;
          position: relative;
          z-index: 1;
        }

        .error {
          color: #ff6b6b;
        }

        @media (max-width: 768px) {
          .ranking-item {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }

          .player-info {
            flex-direction: column;
            gap: 10px;
          }

          .ranking-header h1 {
            font-size: 2rem;
          }

          .player-name {
            font-size: 1.3rem;
          }

          .total-score {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
