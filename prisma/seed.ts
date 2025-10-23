import { PrismaClient, SlotType, SlotStatus } from "@prisma/client";

// PrismaClientのインスタンスを作成
const prisma = new PrismaClient();

// シード処理を実行するメイン関数
async function main() {
  console.log("Seeding started...");

  // 外部キー制約のため、関連するモデルから先に削除する
  await prisma.reservation.deleteMany({});
  await prisma.timeSlot.deleteMany({});
  await prisma.playerScore.deleteMany({});
  await prisma.teamScore.deleteMany({});
  console.log("Cleared existing data.");

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

  // --- TeamScoreのテストデータを作成 ---
  const teamScoresData = [
    // 1人チーム
    { teamName: "ソロプレイヤーA", headcount: 1, gameSessionName: "第1回戦", description: "初回プレイ", score: 12500 },
    { teamName: "ソロプレイヤーB", headcount: 1, gameSessionName: "第1回戦", description: null, score: 15800 },
    { teamName: "ソロプレイヤーC", headcount: 1, gameSessionName: "第2回戦", description: "再挑戦", score: 18200 },
    { teamName: "ソロプレイヤーA", headcount: 1, gameSessionName: "第2回戦", description: "リベンジ", score: 14300 },
    { teamName: "ソロプレイヤーD", headcount: 1, gameSessionName: "第1回戦", description: null, score: 11000 },
    
    // 2人チーム
    { teamName: "デュオファイターズ", headcount: 2, gameSessionName: "第1回戦", description: "初プレイ", score: 22000 },
    { teamName: "ツインスターズ", headcount: 2, gameSessionName: "第1回戦", description: null, score: 25500 },
    { teamName: "デュオファイターズ", headcount: 2, gameSessionName: "第2回戦", description: "再挑戦", score: 26800 },
    { teamName: "パートナーズ", headcount: 2, gameSessionName: "第1回戦", description: null, score: 19500 },
    { teamName: "ツインスターズ", headcount: 2, gameSessionName: "第3回戦", description: "最終戦", score: 28300 },
    
    // 3人チーム
    { teamName: "トリプルスレット", headcount: 3, gameSessionName: "第1回戦", description: "初挑戦", score: 31000 },
    { teamName: "スリーマスケティアーズ", headcount: 3, gameSessionName: "第1回戦", description: null, score: 35200 },
    { teamName: "トリプルスレット", headcount: 3, gameSessionName: "第2回戦", description: "2回目", score: 33500 },
    { teamName: "トライアングル", headcount: 3, gameSessionName: "第1回戦", description: null, score: 28900 },
    { teamName: "スリーマスケティアーズ", headcount: 3, gameSessionName: "第2回戦", description: "再プレイ", score: 37800 },
    
    // 4人チーム
    { teamName: "フォースクワッド", headcount: 4, gameSessionName: "第1回戦", description: "フルメンバー", score: 42000 },
    { teamName: "クワッドフォース", headcount: 4, gameSessionName: "第1回戦", description: null, score: 45800 },
    { teamName: "フォーエバーズ", headcount: 4, gameSessionName: "第1回戦", description: "初プレイ", score: 38500 },
    { teamName: "フォースクワッド", headcount: 4, gameSessionName: "第2回戦", description: "リベンジ", score: 47200 },
    { teamName: "クワッドフォース", headcount: 4, gameSessionName: "第2回戦", description: "2回目", score: 49500 },
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
  console.log("Seeding finished successfully.");
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
