import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reservations/[id] - 特定の予約取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "予約が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(reservation);
  } catch (error) {
    return NextResponse.json(
      { error: "予約の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// PUT /api/reservations/[id] - 予約更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { receiptNumber, numberOfPeople, startTime, endTime } = body;

    if (!receiptNumber || !numberOfPeople || !startTime || !endTime) {
      return NextResponse.json(
        { error: "すべてのフィールドは必須です" },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        receiptNumber,
        numberOfPeople: parseInt(numberOfPeople),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(reservation);
  } catch (error) {
    return NextResponse.json(
      { error: "予約の更新に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE /api/reservations/[id] - 予約削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.reservation.delete({
      where: { id },
    });

    return NextResponse.json({ message: "予約を削除しました" });
  } catch (error) {
    return NextResponse.json(
      { error: "予約の削除に失敗しました" },
      { status: 500 }
    );
  }
}
