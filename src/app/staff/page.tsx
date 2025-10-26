import { getAllReservations } from "./actions";
import ReservationTable from "./ReservationTable";

export default async function StaffPage() {
  const reservations = await getAllReservations();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">予約一覧</h2>
        </div>

        <ReservationTable initialReservations={reservations} />
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">総予約数</h3>
          <p className="text-3xl font-bold text-gray-900">{reservations.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">今後の予約</h3>
          <p className="text-3xl font-bold text-blue-600">
            {
              reservations.filter(
                (r) => new Date(r.timeSlot?.slotTime || r.startTime) >= new Date()
              ).length
            }
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">過去の予約</h3>
          <p className="text-3xl font-bold text-gray-600">
            {
              reservations.filter(
                (r) => new Date(r.timeSlot?.slotTime || r.startTime) < new Date()
              ).length
            }
          </p>
        </div>
      </div>
    </div>
  );
}
