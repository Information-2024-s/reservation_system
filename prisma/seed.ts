import { PrismaClient, SlotType, SlotStatus } from '@prisma/client';

// PrismaClientのインスタンスを作成
const prisma = new PrismaClient();

// シード処理を実行するメイン関数
async function main() {
  console.log('Seeding started...');

  // 外部キー制約のため、関連するモデルから先に削除する
  await prisma.reservation.deleteMany({});
  await prisma.timeSlot.deleteMany({});
  await prisma.team.deleteMany({}); // Teamも念のためクリア
  console.log('Cleared existing data.');

  // --- 設定値 ---
  const DATES_TO_SEED = ['2025-11-01', '2025-11-02']; // 対象の日付 (年は適宜変更してください)
  const START_HOUR = 10; // 開始時刻 (10時)
  const END_HOUR = 16;   // 終了時刻 (16時は含まず、15:57まで)
  const INTERVAL_MINUTES = 3; // 時間間隔 (3分)

  const slotsToCreate = [];
  let isWalkIn = true; // 最初の枠を「予約不要」にするためのフラグ

  // 対象の日付ごとにループ
  for (const dateStr of DATES_TO_SEED) {
    // タイムゾーン問題を避けるため、日付文字列から直接Dateオブジェクトを生成
    const targetDate = new Date(`${dateStr}T00:00:00Z`);

    const startTime = new Date(targetDate.getTime());
    startTime.setUTCHours(START_HOUR, 0, 0, 0);

    const endTime = new Date(targetDate.getTime());
    endTime.setUTCHours(END_HOUR, 0, 0, 0);
    
    let currentTime = startTime;

    // 開始時刻から終了時刻まで、指定した間隔でループ
    while (currentTime < endTime) {
      // 枠の種類を決定 (予約不要 -> 予約可能 -> 予約不要...)
      const type = isWalkIn ? SlotType.WALK_IN : SlotType.RESERVABLE;

      // Prismaに登録するためのデータオブジェクトを作成
      slotsToCreate.push({
        slotTime: new Date(currentTime.getTime()),
        slotType: type,
        // 予約可能枠のステータスはデフォルトで 'AVAILABLE'
        status: SlotStatus.AVAILABLE,
      });

      // 時間を指定した間隔だけ進める
      currentTime.setUTCMinutes(currentTime.getUTCMinutes() + INTERVAL_MINUTES);
      // フラグを反転させて、次回の枠の種類を切り替える
      isWalkIn = !isWalkIn;
    }
  }

  // 作成したデータオブジェクトをデータベースに一括で挿入
  await prisma.timeSlot.createMany({
    data: slotsToCreate,
  });

  console.log(`Created ${slotsToCreate.length} time slots.`);
  console.log('Seeding finished successfully.');
}

// メイン関数を実行し、エラーハンドリングを行う
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // スクリプトの最後にPrismaClientとの接続を閉じる
    await prisma.$disconnect();
  });

