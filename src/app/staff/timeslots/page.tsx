import TimeslotManagement from "./TimeslotManagement";

export default function TimeslotsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">タイムスロット管理</h2>
        <TimeslotManagement />
      </div>
    </div>
  );
}
