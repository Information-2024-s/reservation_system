// 時間枠の型定義（APIレスポンスに対応）
export interface TimeSlot {
  id: number;
  slotTime: string; // ISO 8601形式
  slotType: "RESERVABLE" | "WALK_IN";
  status: "AVAILABLE" | "BOOKED";
  createdAt: string;
  updatedAt: string;
}

// UTC時刻を日本時間に変換するヘルパー関数
export const convertUTCToJST = (utcTimeString: string): Date => {
  const utcDate = new Date(utcTimeString);
  // UTC時刻に9時間を加算して日本時間に変換
  const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
  return jstDate;
};

// 日本時間のDateオブジェクトを HH:MM 形式の文字列に変換
export const formatJSTTime = (jstDate: Date): string => {
  const hours = jstDate.getUTCHours().toString().padStart(2, "0");
  const minutes = jstDate.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
