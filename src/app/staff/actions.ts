"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * スタッフ用：全予約を取得
 * Basic認証で保護されているため、このアクションは認証済みのユーザーのみ実行可能
 */
export async function getAllReservations() {
  try {
    console.log('=== getAllReservations: 開始 ===');
    
    const reservations = await prisma.reservation.findMany({
      include: {
        timeSlot: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`取得した予約数: ${reservations.length}`);

    // 日付をシリアライズ可能な形式に変換
    const formattedReservations = reservations.map((reservation) => ({
      id: reservation.id,
      name: reservation.name,
      lineUserId: reservation.lineUserId,
      callStatus: reservation.callStatus,
      calledAt: reservation.calledAt?.toISOString() || null,
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
    
    console.log('=== getAllReservations: 成功 ===');
    return formattedReservations;
  } catch (error) {
    console.error("=== getAllReservations: エラー ===");
    console.error("Failed to fetch reservations:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
    throw new Error("予約の取得に失敗しました");
  }
}

/**
 * スタッフ用：予約を削除
 */
export async function deleteReservationById(id: number) {
  try {
    await prisma.reservation.delete({
      where: { id },
    });

    // キャッシュを明示的に再検証
    revalidatePath("/staff");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete reservation:", error);
    throw error instanceof Error ? error : new Error("予約の削除に失敗しました");
  }
}

/**
 * スタッフ用：予約を「呼んだ」としてマーク
 */
export async function markReservationAsCalled(id: number) {
  try {
    console.log(`=== markReservationAsCalled: 開始 ID=${id} ===`);
    
    // 予約の存在確認
    const existingReservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!existingReservation) {
      console.error(`予約が見つかりません: ID=${id}`);
      throw new Error("予約が見つかりません");
    }

    console.log(`既存の予約:`, existingReservation);

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        callStatus: "CALLED",
        calledAt: new Date(),
      },
    });

    console.log(`予約を更新しました: ID=${id}`, updatedReservation);
    
    // キャッシュを明示的に再検証
    revalidatePath("/staff");
    
    return { success: true, reservation: updatedReservation };
  } catch (error) {
    console.error("=== markReservationAsCalled: エラー ===");
    console.error("Failed to mark reservation as called:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
    throw error instanceof Error ? error : new Error("予約の更新に失敗しました");
  }
}

/**
 * スタッフ用：予約を「不在」としてマーク
 */
export async function markReservationAsNoShow(id: number) {
  try {
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        callStatus: "NO_SHOW",
      },
    });

    // キャッシュを明示的に再検証
    revalidatePath("/staff");

    return { success: true, reservation: updatedReservation };
  } catch (error) {
    console.error("Failed to mark reservation as no-show:", error);
    throw error instanceof Error ? error : new Error("予約の更新に失敗しました");
  }
}

/**
 * スタッフ用：呼び出しステータスをリセット
 */
export async function resetCallStatus(id: number) {
  try {
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        callStatus: "NOT_CALLED",
        calledAt: null,
      },
    });

    // キャッシュを明示的に再検証
    revalidatePath("/staff");

    return { success: true, reservation: updatedReservation };
  } catch (error) {
    console.error("Failed to reset call status:", error);
    throw error instanceof Error ? error : new Error("ステータスのリセットに失敗しました");
  }
}
