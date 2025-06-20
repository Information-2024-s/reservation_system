import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reservations - 全予約取得
export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        user: true,
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

// POST /api/reservations - 予約作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, receiptNumber, numberOfPeople, startTime, endTime } = body;

    if (
      !userId ||
      !receiptNumber ||
      !numberOfPeople ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        { error: "すべてのフィールドは必須です" },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: parseInt(userId),
        receiptNumber,
        numberOfPeople: parseInt(numberOfPeople),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "予約の作成に失敗しました" },
      { status: 500 }
    );
  }
}
