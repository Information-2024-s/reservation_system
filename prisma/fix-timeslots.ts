import { PrismaClient, SlotType, SlotStatus } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 14:30以降のタイムスロットを削除
 * 1日目・2日目の両方で14:30以降のスロットを削除
 */
async function deleteTimeSlotsAfter1430() {
  console.log("Deleting time slots after 14:30...");

  const targetDates = ["2025-11-01", "2025-11-02"];
  let totalDeleted = 0;

  for (const dateStr of targetDates) {
    // 日本時間14:30 = UTC 05:30
    const cutoffTime = new Date(`${dateStr}T05:30:00.000Z`);

    // その日の終わり (翌日の00:00)
    const nextDay = new Date(`${dateStr}T00:00:00.000Z`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const deleted = await prisma.timeSlot.deleteMany({
      where: {
        slotTime: {
          gte: cutoffTime,
          lt: nextDay,
        },
      },
    });

    console.log(`Deleted ${deleted.count} slots after 14:30 on ${dateStr}`);
    totalDeleted += deleted.count;
  }

  console.log(`Total deleted: ${totalDeleted} slots`);
  console.log("Deletion completed.");
}

/**
 * 画像の仕様に従ってタイムスロットを作成
 * 既存の枠（1日目10:00～16:00、2日目10:00～14:30）には触れず、
 * 追加すべき時間帯のみを作成
 *
 * 1日目: 9:15～10:00 の部分のみ追加
 * 2日目: 9:15～10:00 の部分のみ追加
 */
async function createTimeSlots() {
  console.log("Creating additional time slots (9:15-10:00 only)...");

  const INTERVAL_MINUTES = 3; // 3分間隔
  const slotsToCreate = [];

  // --- 1日目: 2025-11-01 (9:15～10:00 のみ追加) ---
  const day1Date = "2025-11-01";
  const day1StartHour = 9;
  const day1StartMinute = 15;
  const day1EndHour = 10;
  const day1EndMinute = 0;

  console.log(
    `Creating slots for Day 1: ${day1Date} (${day1StartHour}:${day1StartMinute}～${day1EndHour}:${day1EndMinute})`
  );

  const day1TargetDate = new Date(`${day1Date}T00:00:00Z`);
  const day1StartTime = new Date(day1TargetDate.getTime());
  day1StartTime.setUTCHours(day1StartHour - 9, day1StartMinute, 0, 0); // 日本時間 -> UTC

  const day1EndTime = new Date(day1TargetDate.getTime());
  day1EndTime.setUTCHours(day1EndHour - 9, day1EndMinute, 0, 0); // 日本時間 -> UTC

  let currentTime = new Date(day1StartTime.getTime());
  let isWalkIn = true; // 最初の枠を「予約不要」にする

  while (currentTime < day1EndTime) {
    const type = isWalkIn ? SlotType.WALK_IN : SlotType.RESERVABLE;

    slotsToCreate.push({
      slotTime: new Date(currentTime.getTime()),
      slotType: type,
      status: SlotStatus.AVAILABLE,
    });

    currentTime.setUTCMinutes(currentTime.getUTCMinutes() + INTERVAL_MINUTES);
    isWalkIn = !isWalkIn;
  }

  const day1SlotsCount = slotsToCreate.length;
  console.log(`Day 1 slots to create: ${day1SlotsCount}`);

  // --- 2日目: 2025-11-02 (9:15～10:00 のみ追加) ---
  const day2Date = "2025-11-02";
  const day2StartHour = 9;
  const day2StartMinute = 15;
  const day2EndHour = 10;
  const day2EndMinute = 0;

  console.log(
    `Creating slots for Day 2: ${day2Date} (${day2StartHour}:${day2StartMinute}～${day2EndHour}:${day2EndMinute})`
  );

  const day2TargetDate = new Date(`${day2Date}T00:00:00Z`);
  const day2StartTime = new Date(day2TargetDate.getTime());
  day2StartTime.setUTCHours(day2StartHour - 9, day2StartMinute, 0, 0); // 日本時間 -> UTC

  const day2EndTime = new Date(day2TargetDate.getTime());
  day2EndTime.setUTCHours(day2EndHour - 9, day2EndMinute, 0, 0); // 日本時間 -> UTC

  currentTime = new Date(day2StartTime.getTime());
  isWalkIn = true; // 2日目も最初の枠を「予約不要」にする

  while (currentTime < day2EndTime) {
    const type = isWalkIn ? SlotType.WALK_IN : SlotType.RESERVABLE;

    slotsToCreate.push({
      slotTime: new Date(currentTime.getTime()),
      slotType: type,
      status: SlotStatus.AVAILABLE,
    });

    currentTime.setUTCMinutes(currentTime.getUTCMinutes() + INTERVAL_MINUTES);
    isWalkIn = !isWalkIn;
  }

  const day2SlotsCount = slotsToCreate.length - day1SlotsCount;
  console.log(`Day 2 slots to create: ${day2SlotsCount}`);
  console.log(`Total slots to create: ${slotsToCreate.length}`);

  // データベースに一括挿入
  const result = await prisma.timeSlot.createMany({
    data: slotsToCreate,
    skipDuplicates: true, // 既存のスロットがある場合はスキップ
  });

  console.log(`Successfully created ${result.count} time slots.`);
}

/**
 * 2:30～4:00 のタイムスロットを作成
 * 2枠に1枠を予約枠（RESERVABLE）にする
 */
async function createTimeSlots230To400() {
  console.log("Creating time slots from 2:30 to 4:00...");

  const INTERVAL_MINUTES = 3; // 3分間隔
  const slotsToCreate = [];

  // --- 11/1: 2:30～4:00 ---
  const dateStr = "2025-11-01";
  const startHour = 2;
  const startMinute = 30;
  const endHour = 4;
  const endMinute = 0;

  console.log(
    `Creating slots: ${dateStr} (${startHour}:${startMinute}～${endHour}:${endMinute})`
  );

  const targetDate = new Date(`${dateStr}T00:00:00Z`);
  const startTime = new Date(targetDate.getTime());
  startTime.setUTCHours(startHour - 9, startMinute, 0, 0); // 日本時間 -> UTC

  const endTime = new Date(targetDate.getTime());
  endTime.setUTCHours(endHour - 9, endMinute, 0, 0); // 日本時間 -> UTC

  const currentTime = new Date(startTime.getTime());
  let slotCount = 0; // 枠番号カウンター

  while (currentTime < endTime) {
    // 2枠に1枠を予約枠に（0, 1 -> WALK_IN, 2 -> RESERVABLE, 3, 4 -> WALK_IN, 5 -> RESERVABLE...）
    const isReservable = slotCount % 3 === 2;
    const type = isReservable ? SlotType.RESERVABLE : SlotType.WALK_IN;

    slotsToCreate.push({
      slotTime: new Date(currentTime.getTime()),
      slotType: type,
      status: SlotStatus.AVAILABLE,
    });

    console.log(
      `Slot ${slotCount}: ${currentTime.toISOString()} - ${type} (${
        isReservable ? "予約可能" : "予約不要"
      })`
    );

    currentTime.setUTCMinutes(currentTime.getUTCMinutes() + INTERVAL_MINUTES);
    slotCount++;
  }

  console.log(`Total slots to create: ${slotsToCreate.length}`);

  // データベースに一括挿入
  const result = await prisma.timeSlot.createMany({
    data: slotsToCreate,
    skipDuplicates: true, // 既存のスロットがある場合はスキップ
  });

  console.log(`Successfully created ${result.count} time slots.`);
}

/**
 * 14:30～16:00 のタイムスロットを作成
 * 2枠に1枠を予約枠（RESERVABLE）にする
 */
async function createTimeSlots1430To1600() {
  console.log("Creating time slots from 14:30 to 16:00...");

  const INTERVAL_MINUTES = 3; // 3分間隔
  const slotsToCreate = [];

  // --- 11/1: 14:30～16:00 ---
  const dateStr = "2025-11-01";
  const startHour = 14;
  const startMinute = 30;
  const endHour = 16;
  const endMinute = 0;

  console.log(
    `Creating slots: ${dateStr} (${startHour}:${startMinute}～${endHour}:${endMinute})`
  );

  const targetDate = new Date(`${dateStr}T00:00:00Z`);
  const startTime = new Date(targetDate.getTime());
  startTime.setUTCHours(startHour - 9, startMinute, 0, 0); // 日本時間 -> UTC

  const endTime = new Date(targetDate.getTime());
  endTime.setUTCHours(endHour - 9, endMinute, 0, 0); // 日本時間 -> UTC

  const currentTime = new Date(startTime.getTime());
  let slotCount = 0; // 枠番号カウンター

  while (currentTime < endTime) {
    // 2枠に1枠を予約枠に（0, 1 -> WALK_IN, 2 -> RESERVABLE, 3, 4 -> WALK_IN, 5 -> RESERVABLE...）
    const isReservable = slotCount % 3 === 2;
    const type = isReservable ? SlotType.RESERVABLE : SlotType.WALK_IN;

    slotsToCreate.push({
      slotTime: new Date(currentTime.getTime()),
      slotType: type,
      status: SlotStatus.AVAILABLE,
    });

    console.log(
      `Slot ${slotCount}: ${currentTime.toISOString()} - ${type} (${
        isReservable ? "予約可能" : "予約不要"
      })`
    );

    currentTime.setUTCMinutes(currentTime.getUTCMinutes() + INTERVAL_MINUTES);
    slotCount++;
  }

  console.log(`Total slots to create: ${slotsToCreate.length}`);

  // データベースに一括挿入
  const result = await prisma.timeSlot.createMany({
    data: slotsToCreate,
    skipDuplicates: true, // 既存のスロットがある場合はスキップ
  });

  console.log(`Successfully created ${result.count} time slots.`);
}

/**
 * メイン実行関数
 */
async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case "delete":
        // 14:30以降のスロットを削除のみ
        console.log("Starting deletion process...");
        await deleteTimeSlotsAfter1430();
        console.log("Deletion completed successfully.");
        break;

      case "create":
        // 新規作成のみ
        console.log("Starting timeslot creation process...");
        await createTimeSlots();
        console.log("Timeslot creation completed successfully.");
        break;

      case "230to400":
        // 2:30～4:00の枠を作成
        console.log("Starting 2:30-4:00 timeslot creation process...");
        await createTimeSlots230To400();
        console.log("2:30-4:00 timeslot creation completed successfully.");
        break;

      case "1430to1600":
        // 14:30～16:00の枠を作成
        console.log("Starting 14:30-16:00 timeslot creation process...");
        await createTimeSlots1430To1600();
        console.log("14:30-16:00 timeslot creation completed successfully.");
        break;

      case "all":
      default:
        // 削除してから作成（デフォルト動作）
        console.log("Starting timeslot fix process (delete + create)...");
        await deleteTimeSlotsAfter1430();
        await createTimeSlots();
        console.log("Timeslot fix completed successfully.");
        break;
    }
  } catch (error) {
    console.error("Error occurred:", error);
    throw error;
  }
}

// 実行
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
