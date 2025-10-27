import TmpScoreManagement from "./TmpScoreManagement";

export default function TmpScoresPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">仮スコア管理</h2>
        <TmpScoreManagement />
      </div>
    </div>
  );
}
