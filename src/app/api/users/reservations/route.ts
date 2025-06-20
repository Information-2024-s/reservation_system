import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/reservations?userId=1 - 特定のユーザーの予約取得
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

    const reservations = await prisma.reservation.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        user: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    return NextResponse.json(
      { error: "予約の取得に失敗しました" },
      { status: 500 }
    );
  }
}
