"use server";

import { prisma } from "@/lib/prisma";

/**
 * スタッフ用：全予約を取得
 * Basic認証で保護されているため、このアクションは認証済みのユーザーのみ実行可能
 */
export async function getAllReservations() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        timeSlot: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 日付をシリアライズ可能な形式に変換
    return reservations.map((reservation) => ({
      id: reservation.id,
      lineUserId: reservation.lineUserId,
      startTime: reservation.startTime.toISOString(),
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
      timeSlotId: reservation.timeSlotId,
      timeSlot: reservation.timeSlot
        ? {
            id: reservation.timeSlot.id,
            slotTime: reservation.timeSlot.slotTime.toISOString(),
            slotType: reservation.timeSlot.slotType,
            status: reservation.timeSlot.status,
            createdAt: reservation.timeSlot.createdAt.toISOString(),
            updatedAt: reservation.timeSlot.updatedAt.toISOString(),
          }
        : null,
    }));
  } catch (error) {
    console.error("Failed to fetch reservations:", error);
    throw new Error("予約の取得に失敗しました");
  }
}

/**
 * スタッフ用：予約を削除
 */
export async function deleteReservationById(id: number) {
  try {
    // 予約の存在確認
    const existingReservation = await prisma.reservation.findUnique({
      where: { id },
      include: { timeSlot: true },
    });

    if (!existingReservation) {
      throw new Error("予約が見つかりません");
    }

    // 過去の予約は削除不可
    const now = new Date();
    const reservationTime =
      existingReservation.timeSlot?.slotTime || existingReservation.startTime;

    if (reservationTime < now) {
      throw new Error("過去の予約は削除できません");
    }

    // トランザクションで削除
    await prisma.$transaction(async (tx) => {
      // タイムスロットのステータスを AVAILABLE に戻す
      if (existingReservation.timeSlot) {
        await tx.timeSlot.update({
          where: { id: existingReservation.timeSlot.id },
          data: { status: "AVAILABLE" },
        });
      }

      // 予約を削除
      await tx.reservation.delete({
        where: { id },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete reservation:", error);
    throw error instanceof Error ? error : new Error("予約の削除に失敗しました");
  }
}
