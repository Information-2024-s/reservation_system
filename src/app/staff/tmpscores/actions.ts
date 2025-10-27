"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Stage } from "@prisma/client";

export async function getTmpScores() {
  try {
    const tmpScores = await prisma.tmpScore.findMany({
      orderBy: [{ id: "asc" }, { stage: "asc" }],
    });
    return { success: true, data: tmpScores };
  } catch (error) {
    console.error("Failed to fetch tmp scores:", error);
    return { success: false, error: "仮スコアの取得に失敗しました" };
  }
}

export async function createTmpScore(data: {
  id: number;
  stage: Stage;
  score: number;
}) {
  try {
    const tmpScore = await prisma.tmpScore.create({
      data,
    });
    revalidatePath("/staff/tmpscores");
    return { success: true, data: tmpScore };
  } catch (error) {
    console.error("Failed to create tmp score:", error);
    return { success: false, error: "仮スコアの作成に失敗しました" };
  }
}

export async function updateTmpScore(
  id: number,
  stage: Stage,
  data: { score: number }
) {
  try {
    const tmpScore = await prisma.tmpScore.update({
      where: {
        id_stage: {
          id,
          stage,
        },
      },
      data,
    });
    revalidatePath("/staff/tmpscores");
    return { success: true, data: tmpScore };
  } catch (error) {
    console.error("Failed to update tmp score:", error);
    return { success: false, error: "仮スコアの更新に失敗しました" };
  }
}

export async function deleteTmpScore(id: number, stage: Stage) {
  try {
    await prisma.tmpScore.delete({
      where: {
        id_stage: {
          id,
          stage,
        },
      },
    });
    revalidatePath("/staff/tmpscores");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete tmp score:", error);
    return { success: false, error: "仮スコアの削除に失敗しました" };
  }
}

export async function deleteAllTmpScoresById(id: number) {
  try {
    await prisma.tmpScore.deleteMany({
      where: { id },
    });
    revalidatePath("/staff/tmpscores");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete tmp scores:", error);
    return { success: false, error: "仮スコアの一括削除に失敗しました" };
  }
}
