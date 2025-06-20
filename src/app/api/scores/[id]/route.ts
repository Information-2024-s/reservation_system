import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/scores/[id] - 特定のスコア取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const score = await prisma.score.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!score) {
      return NextResponse.json(
        { error: "スコアが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(score);
  } catch (error) {
    return NextResponse.json(
      { error: "スコアの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// PUT /api/scores/[id] - スコア更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { score } = body;

    if (score === undefined) {
      return NextResponse.json({ error: "スコアは必須です" }, { status: 400 });
    }

    const scoreRecord = await prisma.score.update({
      where: { id },
      data: { score: parseInt(score) },
      include: {
        user: true,
      },
    });

    return NextResponse.json(scoreRecord);
  } catch (error) {
    return NextResponse.json(
      { error: "スコアの更新に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE /api/scores/[id] - スコア削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.score.delete({
      where: { id },
    });

    return NextResponse.json({ message: "スコアを削除しました" });
  } catch (error) {
    return NextResponse.json(
      { error: "スコアの削除に失敗しました" },
      { status: 500 }
    );
  }
}
