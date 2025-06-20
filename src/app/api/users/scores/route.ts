import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/scores?userId=1 - 特定のユーザーのスコア取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "ユーザーIDは必須です" },
        { status: 400 }
      );
    }

    const scores = await prisma.score.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(scores);
  } catch (error) {
    return NextResponse.json(
      { error: "スコアの取得に失敗しました" },
      { status: 500 }
    );
  }
}
