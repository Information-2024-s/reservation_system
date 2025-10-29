"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type TimeSlot = {
  id: number;
  slotTime: string;
  slotType: "RESERVABLE" | "WALK_IN";
  status: "AVAILABLE" | "BOOKED" | "UNAVAILABLE";
  createdAt: string;
  updatedAt: string;
  hasReservation: boolean;
};

/**
 * スタッフ用：全タイムスロットを取得
 */
export async function getAllTimeSlots(): Promise<TimeSlot[]> {
  try {
    console.log('=== getAllTimeSlots: 開始 ===');
    
    const timeSlots = await prisma.timeSlot.findMany({
      include: {
        reservation: true,
      },
      orderBy: { slotTime: "asc" },
    });

    console.log(`取得したタイムスロット数: ${timeSlots.length}`);

    // 日付をシリアライズ可能な形式に変換
    const formattedTimeSlots = timeSlots.map((slot) => ({
      id: slot.id,
      slotTime: slot.slotTime.toISOString(),
      slotType: slot.slotType,
      status: slot.status,
      createdAt: slot.createdAt.toISOString(),
      updatedAt: slot.updatedAt.toISOString(),
      hasReservation: slot.reservation !== null,
    }));
    
    console.log('=== getAllTimeSlots: 成功 ===');
    return formattedTimeSlots;
  } catch (error) {
    console.error("=== getAllTimeSlots: エラー ===");
    console.error("Failed to fetch timeslots:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
    throw new Error("タイムスロットの取得に失敗しました");
  }
}

/**
 * スタッフ用：タイムスロットのステータスを更新
 */
export async function updateTimeSlotStatus(
  id: number,
  status: "AVAILABLE" | "UNAVAILABLE"
): Promise<TimeSlot> {
  try {
    console.log(`=== updateTimeSlotStatus: 開始 ID=${id}, Status=${status} ===`);
    
    // タイムスロットの存在確認
    const existingSlot = await prisma.timeSlot.findUnique({
      where: { id },
      include: {
        reservation: true,
      },
    });

    if (!existingSlot) {
      console.error(`タイムスロットが見つかりません: ID=${id}`);
      throw new Error("タイムスロットが見つかりません");
    }

    console.log(`既存のタイムスロット:`, existingSlot);

    // BOOKEDステータスのスロットは更新不可
    if (existingSlot.status === "BOOKED") {
      console.error(`予約済みのスロットは編集できません: ID=${id}`);
      throw new Error("予約済みのスロットは編集できません");
    }

    const updatedSlot = await prisma.timeSlot.update({
      where: { id },
      data: { status },
      include: {
        reservation: true,
      },
    });

    console.log(`タイムスロットを更新しました: ID=${id}`, updatedSlot);
    
    // キャッシュを明示的に再検証
    revalidatePath("/staff/timeslots");
    
    const formattedSlot = {
      id: updatedSlot.id,
      slotTime: updatedSlot.slotTime.toISOString(),
      slotType: updatedSlot.slotType,
      status: updatedSlot.status,
      createdAt: updatedSlot.createdAt.toISOString(),
      updatedAt: updatedSlot.updatedAt.toISOString(),
      hasReservation: updatedSlot.reservation !== null,
    };

    return formattedSlot;
  } catch (error) {
    console.error("=== updateTimeSlotStatus: エラー ===");
    console.error("Failed to update timeslot status:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
    throw error instanceof Error ? error : new Error("ステータスの更新に失敗しました");
  }
}
