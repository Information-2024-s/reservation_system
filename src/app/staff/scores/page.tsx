import ScoreManagement from "./ScoreManagement";

export default function ScoresPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">スコア管理</h2>
        <ScoreManagement />
      </div>
    </div>
  );
}
