import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/scores - 全スコア取得
export async function GET() {
  try {
    const scores = await prisma.score.findMany({
      include: {
        user: true,
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

// POST /api/scores - スコア作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, score } = body;

    if (!userId || score === undefined) {
      return NextResponse.json(
        { error: "ユーザーIDとスコアは必須です" },
        { status: 400 }
      );
    }

    const scoreRecord = await prisma.score.create({
      data: {
        userId: parseInt(userId),
        score: parseInt(score),
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(scoreRecord, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "スコアの作成に失敗しました" },
      { status: 500 }
    );
  }
}
