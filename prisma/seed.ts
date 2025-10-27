import { PrismaClient, SlotType, SlotStatus, Stage } from "@prisma/client";

// PrismaClientのインスタンスを作成
const prisma = new PrismaClient();

// リセット関数群
async function resetReservations() {
  console.log("Resetting Reservations...");
  await prisma.reservation.deleteMany({});
  await prisma.$executeRaw`ALTER SEQUENCE "Reservation_id_seq" RESTART WITH 1`;
  console.log("Reservations reset completed.");
}

async function resetTimeSlots() {
  console.log("Resetting TimeSlots...");
  await resetReservations(); // 外部キー制約のため先にReservationを削除
  await prisma.timeSlot.deleteMany({});
  await prisma.$executeRaw`ALTER SEQUENCE "TimeSlot_id_seq" RESTART WITH 1`;
  console.log("TimeSlots reset completed.");
}

async function resetPlayerScores() {
  console.log("Resetting PlayerScores...");
  await prisma.playerScore.deleteMany({});
  await prisma.$executeRaw`ALTER SEQUENCE "PlayerScore_id_seq" RESTART WITH 1`;
  console.log("PlayerScores reset completed.");
}

async function resetTeamScores() {
  console.log("Resetting TeamScores...");
  await resetPlayerScores(); // 外部キー制約のため先にPlayerScoreを削除
  await prisma.teamScore.deleteMany({});
  await prisma.$executeRaw`ALTER SEQUENCE "TeamScore_id_seq" RESTART WITH 1`;
  console.log("TeamScores reset completed.");
}

async function resetTmpScores() {
  console.log("Resetting TmpScores...");
  await prisma.tmpScore.deleteMany({});
  console.log("TmpScores reset completed.");
}

async function resetAll() {
  console.log("Resetting all tables...");
  await resetTimeSlots();
  await resetTeamScores();
  await resetTmpScores();
  console.log("All tables reset completed.");
}

// TimeSlot作成関数
async function seedTimeSlots() {
  console.log("Seeding TimeSlots...");

  await resetTimeSlots();

  // --- 設定値 ---
  const DATES_TO_SEED = ["2025-11-01", "2025-11-02"]; // 対象の日付 (年は適宜変更してください)
  const START_HOUR = 10; // 開始時刻 (10時)
  const END_HOUR = 16; // 終了時刻 (16時は含まず、15:57まで)
  const INTERVAL_MINUTES = 3; // 時間間隔 (3分)

  const slotsToCreate = [];
  let isWalkIn = true; // 最初の枠を「予約不要」にするためのフラグ

  // 対象の日付ごとにループ
  for (const dateStr of DATES_TO_SEED) {
    // タイムゾーン問題を避けるため、日付文字列から直接Dateオブジェクトを生成
    const targetDate = new Date(`${dateStr}T00:00:00Z`);

    const startTime = new Date(targetDate.getTime());
    // 日本時間をUTCとして正しく登録するため、9時間を引く
    startTime.setUTCHours(START_HOUR, 0, 0, 0);
    startTime.setUTCHours(startTime.getUTCHours() - 9);

    const endTime = new Date(targetDate.getTime());
    // 日本時間をUTCとして正しく登録するため、9時間を引く
    endTime.setUTCHours(END_HOUR, 0, 0, 0);
    endTime.setUTCHours(endTime.getUTCHours() - 9);

    const currentTime = startTime;

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
}

// スコアデータ作成関数
async function seedScores() {
  console.log("Seeding Scores...");

  await resetTeamScores();
  await resetTmpScores();

  // --- TeamScoreのテストデータを作成 ---
  const teamScoresData = [
    // 1人チーム
    { teamName: "ソロプレイヤーA", headcount: 1, description: "初回プレイ", score: 12500 },
    { teamName: "ソロプレイヤーB", headcount: 1, description: null, score: 15800 },
    { teamName: "ソロプレイヤーC", headcount: 1, description: "再挑戦", score: 18200 },
    { teamName: "ソロプレイヤーA", headcount: 1, description: "リベンジ", score: 14300 },
    { teamName: "ソロプレイヤーD", headcount: 1, description: null, score: 11000 },
    
    // 2人チーム
    { teamName: "デュオファイターズ", headcount: 2, description: "初プレイ", score: 22000 },
    { teamName: "ツインスターズ", headcount: 2, description: null, score: 25500 },
    { teamName: "デュオファイターズ", headcount: 2, description: "再挑戦", score: 26800 },
    { teamName: "パートナーズ", headcount: 2, description: null, score: 19500 },
    { teamName: "ツインスターズ", headcount: 2, description: "最終戦", score: 28300 },
    
    // 3人チーム
    { teamName: "トリプルスレット", headcount: 3, description: "初挑戦", score: 31000 },
    { teamName: "スリーマスケティアーズ", headcount: 3, description: null, score: 35200 },
    { teamName: "トリプルスレット", headcount: 3, description: "2回目", score: 33500 },
    { teamName: "トライアングル", headcount: 3, description: null, score: 28900 },
    { teamName: "スリーマスケティアーズ", headcount: 3, description: "再プレイ", score: 37800 },
    
    // 4人チーム
    { teamName: "フォースクワッド", headcount: 4, description: "フルメンバー", score: 42000 },
    { teamName: "クワッドフォース", headcount: 4, description: null, score: 45800 },
    { teamName: "フォーエバーズ", headcount: 4, description: "初プレイ", score: 38500 },
    { teamName: "フォースクワッド", headcount: 4, description: "リベンジ", score: 47200 },
    { teamName: "クワッドフォース", headcount: 4, description: "2回目", score: 49500 },
  ];

  for (const teamData of teamScoresData) {
    await prisma.teamScore.create({
      data: teamData,
    });
  }

  console.log(`Created ${teamScoresData.length} team scores.`);

  // --- PlayerScoreのテストデータを作成 ---
  // まず作成したTeamScoreを取得
  const createdTeamScores = await prisma.teamScore.findMany({
    orderBy: { id: 'asc' },
  });

  const playerScoresData = [
    // 1人チームのプレイヤースコア
    { playerName: "太郎", score: 12500, team_score_id: createdTeamScores[0].id },
    { playerName: "花子", score: 15800, team_score_id: createdTeamScores[1].id },
    { playerName: "次郎", score: 18200, team_score_id: createdTeamScores[2].id },
    { playerName: "太郎", score: 14300, team_score_id: createdTeamScores[3].id },
    { playerName: "三郎", score: 11000, team_score_id: createdTeamScores[4].id },
    
    // 2人チームのプレイヤースコア
    { playerName: "山田", score: 11000, team_score_id: createdTeamScores[5].id },
    { playerName: "田中", score: 11000, team_score_id: createdTeamScores[5].id },
    { playerName: "佐藤", score: 13000, team_score_id: createdTeamScores[6].id },
    { playerName: "鈴木", score: 12500, team_score_id: createdTeamScores[6].id },
    { playerName: "山田", score: 14000, team_score_id: createdTeamScores[7].id },
    { playerName: "田中", score: 12800, team_score_id: createdTeamScores[7].id },
    { playerName: "高橋", score: 9500, team_score_id: createdTeamScores[8].id },
    { playerName: "渡辺", score: 10000, team_score_id: createdTeamScores[8].id },
    { playerName: "佐藤", score: 14800, team_score_id: createdTeamScores[9].id },
    { playerName: "鈴木", score: 13500, team_score_id: createdTeamScores[9].id },
    
    // 3人チームのプレイヤースコア
    { playerName: "伊藤", score: 10500, team_score_id: createdTeamScores[10].id },
    { playerName: "加藤", score: 10500, team_score_id: createdTeamScores[10].id },
    { playerName: "中村", score: 10000, team_score_id: createdTeamScores[10].id },
    { playerName: "小林", score: 12000, team_score_id: createdTeamScores[11].id },
    { playerName: "斎藤", score: 11700, team_score_id: createdTeamScores[11].id },
    { playerName: "吉田", score: 11500, team_score_id: createdTeamScores[11].id },
    { playerName: "伊藤", score: 11500, team_score_id: createdTeamScores[12].id },
    { playerName: "加藤", score: 11000, team_score_id: createdTeamScores[12].id },
    { playerName: "中村", score: 11000, team_score_id: createdTeamScores[12].id },
    { playerName: "木村", score: 9800, team_score_id: createdTeamScores[13].id },
    { playerName: "林", score: 9600, team_score_id: createdTeamScores[13].id },
    { playerName: "山本", score: 9500, team_score_id: createdTeamScores[13].id },
    { playerName: "小林", score: 13000, team_score_id: createdTeamScores[14].id },
    { playerName: "斎藤", score: 12500, team_score_id: createdTeamScores[14].id },
    { playerName: "吉田", score: 12300, team_score_id: createdTeamScores[14].id },
    
    // 4人チームのプレイヤースコア
    { playerName: "清水", score: 10500, team_score_id: createdTeamScores[15].id },
    { playerName: "山口", score: 10500, team_score_id: createdTeamScores[15].id },
    { playerName: "松本", score: 10500, team_score_id: createdTeamScores[15].id },
    { playerName: "井上", score: 10500, team_score_id: createdTeamScores[15].id },
    { playerName: "竹内", score: 11500, team_score_id: createdTeamScores[16].id },
    { playerName: "橋本", score: 11500, team_score_id: createdTeamScores[16].id },
    { playerName: "中島", score: 11400, team_score_id: createdTeamScores[16].id },
    { playerName: "長谷川", score: 11400, team_score_id: createdTeamScores[16].id },
    { playerName: "石田", score: 9600, team_score_id: createdTeamScores[17].id },
    { playerName: "前田", score: 9600, team_score_id: createdTeamScores[17].id },
    { playerName: "岡田", score: 9700, team_score_id: createdTeamScores[17].id },
    { playerName: "藤田", score: 9600, team_score_id: createdTeamScores[17].id },
    { playerName: "清水", score: 11800, team_score_id: createdTeamScores[18].id },
    { playerName: "山口", score: 11800, team_score_id: createdTeamScores[18].id },
    { playerName: "松本", score: 11800, team_score_id: createdTeamScores[18].id },
    { playerName: "井上", score: 11800, team_score_id: createdTeamScores[18].id },
    { playerName: "竹内", score: 12400, team_score_id: createdTeamScores[19].id },
    { playerName: "橋本", score: 12400, team_score_id: createdTeamScores[19].id },
    { playerName: "中島", score: 12400, team_score_id: createdTeamScores[19].id },
    { playerName: "長谷川", score: 12300, team_score_id: createdTeamScores[19].id },
  ];

  for (const playerData of playerScoresData) {
    await prisma.playerScore.create({
      data: playerData,
    });
  }

  console.log(`Created ${playerScoresData.length} player scores.`);

  // --- TmpScoreのテストデータを作成 ---
  const tmpScoresData = [
    // ID 1 - 3つのステージすべて完了
    { id: 1, stage: Stage.First, score: 4500 },
    { id: 1, stage: Stage.Second, score: 5200 },
    { id: 1, stage: Stage.Third, score: 6800 },
    
    // ID 2 - 2ステージまで完了
    { id: 2, stage: Stage.First, score: 3800 },
    { id: 2, stage: Stage.Second, score: 4900 },
    
    // ID 3 - 1ステージのみ
    { id: 3, stage: Stage.First, score: 5500 },
    
    // ID 4 - 3ステージすべて完了（高スコア）
    { id: 4, stage: Stage.First, score: 6200 },
    { id: 4, stage: Stage.Second, score: 7100 },
    { id: 4, stage: Stage.Third, score: 8500 },
    
    // ID 5 - 3ステージすべて完了
    { id: 5, stage: Stage.First, score: 4200 },
    { id: 5, stage: Stage.Second, score: 5600 },
    { id: 5, stage: Stage.Third, score: 7200 },
    
    // ID 6 - 2ステージまで完了
    { id: 6, stage: Stage.First, score: 3500 },
    { id: 6, stage: Stage.Second, score: 4200 },
    
    // ID 7 - 1ステージのみ
    { id: 7, stage: Stage.First, score: 4800 },
    
    // ID 8 - 3ステージすべて完了（低スコア）
    { id: 8, stage: Stage.First, score: 3200 },
    { id: 8, stage: Stage.Second, score: 3900 },
    { id: 8, stage: Stage.Third, score: 4500 },
    
    // ID 9 - 2ステージまで完了
    { id: 9, stage: Stage.First, score: 5100 },
    { id: 9, stage: Stage.Second, score: 6300 },
    
    // ID 10 - 3ステージすべて完了
    { id: 10, stage: Stage.First, score: 5800 },
    { id: 10, stage: Stage.Second, score: 6700 },
    { id: 10, stage: Stage.Third, score: 7900 },
  ];

  for (const tmpData of tmpScoresData) {
    await prisma.tmpScore.create({
      data: tmpData,
    });
  }

  console.log(`Created ${tmpScoresData.length} tmp scores.`);
  console.log("Seeding Scores finished successfully.");
}

// メイン関数
async function main() {
  console.log("Seeding started...");
  
  // TimeSlotの作成
  await seedTimeSlots();
  
  // スコアデータの作成
  await seedScores();
  
  console.log("All seeding finished successfully.");
}

// コマンドライン引数で実行する関数を選択
async function executeCommand() {
  const command = process.argv[2];

  switch (command) {
    // リセット系
    case "reset:all":
      await resetAll();
      break;
    case "reset:timeslots":
      await resetTimeSlots();
      break;
    case "reset:reservations":
      await resetReservations();
      break;
    case "reset:teamscores":
      await resetTeamScores();
      break;
    case "reset:playerscores":
      await resetPlayerScores();
      break;
    case "reset:tmpscores":
      await resetTmpScores();
      break;

    // シード系
    case "seed:all":
      await main();
      break;
    case "seed:timeslots":
      await seedTimeSlots();
      break;
    case "seed:scores":
      await seedScores();
      break;

    // デフォルト（引数なし）
    default:
      if (command) {
        console.error(`Unknown command: ${command}`);
        console.log("\nAvailable commands:");
        console.log("  Reset commands:");
        console.log("    reset:all          - Reset all tables");
        console.log("    reset:timeslots    - Reset TimeSlots (and Reservations)");
        console.log("    reset:reservations - Reset Reservations only");
        console.log("    reset:teamscores   - Reset TeamScores (and PlayerScores)");
        console.log("    reset:playerscores - Reset PlayerScores only");
        console.log("    reset:tmpscores    - Reset TmpScores");
        console.log("\n  Seed commands:");
        console.log("    seed:all           - Seed all data (default)");
        console.log("    seed:timeslots     - Seed TimeSlots only");
        console.log("    seed:scores        - Seed Scores only");
        process.exit(1);
      } else {
        // 引数がない場合はデフォルトで全データをシード
        await main();
      }
  }
}

// メイン関数を実行し、エラーハンドリングを行う
executeCommand()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // スクリプトの最後にPrismaClientとの接続を閉じる
    await prisma.$disconnect();
  });
