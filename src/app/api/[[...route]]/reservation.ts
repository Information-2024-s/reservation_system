import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { prisma } from "../../../lib/prisma";
import {
  reservation,
  createReservation,
  updateReservation,
  idParam,
  createReservationWithTeam,
} from "./zod_objects";
import { auth } from "@/auth";
import { authenticateCombined, getCurrentUserId } from "./auth-helpers";
import { z } from "zod";

const app = new OpenAPIHono();

// 取得系ルート（GET）はAPIキーまたはNextAuth認証、CUD系も両方対応
app.use("*", authenticateCombined);

// 予約一覧取得ルート
const getReservationsRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Reservations"],
  summary: "予約一覧を取得",
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: reservation.array(),
        },
      },
    },
  },
});

app.openapi(getReservationsRoute, async (c) => {
  const session = await auth();

  console.log("Authenticated session:", session);

  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
  });

  const formattedReservations = reservations.map((reservation) => ({
    id: reservation.id,
    teamId: reservation.teamId,
    lineUserId: reservation.lineUserId,
    startTime: reservation.startTime.toISOString(),
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
    timeSlotId: reservation.timeSlotId,
  }));

  return c.json(formattedReservations);
});

// 現在のユーザーの予約を取得するルート
const getCurrentUserReservationRoute = createRoute({
  path: "/my-reservation",
  method: "get",
  tags: ["Reservations"],
  summary: "現在のユーザーの予約を取得",
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({
            reservation: reservation.nullable(),
            team: z
              .object({
                id: z.number(),
                name: z.string(),
                headcount: z.number(),
                members: z.array(
                  z.object({
                    id: z.number(),
                    name: z.string(),
                  })
                ),
              })
              .nullable(),
            timeSlot: z
              .object({
                id: z.number(),
                slotTime: z.string(),
                status: z.string(),
              })
              .nullable(),
          }),
        },
      },
    },
    404: {
      description: "予約が見つかりません",
    },
  },
});

app.openapi(getCurrentUserReservationRoute, async (c) => {
  const currentUserId = await getCurrentUserId(c);
  console.log("Current User ID:", currentUserId);
  if (!currentUserId) {
    console.log(currentUserId);
    console.log("No authenticated user");
    return c.json({ error: "認証が必要です" }, 401);
  }

  // 現在のユーザーの予約を取得（チーム情報とタイムスロット情報も含む）
  const userReservation = await prisma.reservation.findFirst({
    where: { lineUserId: currentUserId },
    include: {
      team: {
        include: {
          users: true,
        },
      },
      timeSlot: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!userReservation) {
    return c.json({
      reservation: null,
      team: null,
      timeSlot: null,
    });
  }

  const formattedReservation = {
    id: userReservation.id,
    teamId: userReservation.teamId,
    lineUserId: userReservation.lineUserId,
    startTime: userReservation.startTime.toISOString(),
    createdAt: userReservation.createdAt.toISOString(),
    updatedAt: userReservation.updatedAt.toISOString(),
    timeSlotId: userReservation.timeSlotId,
  };

  const formattedTeam = userReservation.team
    ? {
        id: userReservation.team.id,
        name: userReservation.team.name,
        headcount: userReservation.team.headcount,
        users: userReservation.team.users.map((user) => ({
          id: user.id,
          name: user.name,
        })),
      }
    : null;

  const formattedTimeSlot = userReservation.timeSlot
    ? {
        id: userReservation.timeSlot.id,
        slotTime: userReservation.timeSlot.slotTime.toISOString(),
        status: userReservation.timeSlot.status,
      }
    : null;

  return c.json({
    reservation: formattedReservation,
    team: formattedTeam,
    timeSlot: formattedTimeSlot,
  });
});

// 予約詳細取得ルート
const getReservationRoute = createRoute({
  path: "/{id}",
  method: "get",
  tags: ["Reservations"],
  summary: "予約詳細を取得",
  request: {
    params: idParam,
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: reservation,
        },
      },
    },
  },
});

app.openapi(getReservationRoute, async (c) => {
  const { id } = c.req.valid("param");

  const reservationRecord = await prisma.reservation.findUnique({
    where: { id },
  });

  const formattedReservation = {
    ...reservationRecord!,
    lineUserId: reservationRecord!.lineUserId,
    startTime: reservationRecord!.startTime.toISOString(),
    createdAt: reservationRecord!.createdAt.toISOString(),
    updatedAt: reservationRecord!.updatedAt.toISOString(),
  };

  return c.json(formattedReservation);
});

// 予約作成ルート
const createReservationRoute = createRoute({
  path: "/",
  method: "post",
  tags: ["Reservations"],
  summary: "予約を作成",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createReservation,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: {
        "application/json": {
          schema: reservation,
        },
      },
    },
    400: {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});

app.openapi(createReservationRoute, async (c) => {
  const data = c.req.valid("json");

  // 現在認証されているユーザーIDを取得
  const currentUserId = await getCurrentUserId(c);

  const reservationData = {
    teamId: data.teamId,
    startTime: new Date(data.startTime),
    timeSlotId: data.timeSlotId,
    lineUserId: null as string | null, // 初期値はnull、後で上書き
  };

  if (currentUserId) {
    // NextAuth認証の場合、認証されたユーザーIDを使用
    reservationData.lineUserId = currentUserId;
  } else if (data.lineUserId) {
    // APIキー認証で明示的にlineUserIdが指定された場合のみ設定
    reservationData.lineUserId = data.lineUserId;
  }
  // APIキー認証でlineUserIdが指定されていない場合はnullのまま

  const newReservation = await prisma.reservation.create({
    data: reservationData,
  });

  const formattedReservation = {
    ...newReservation,
    startTime: newReservation.startTime.toISOString(),
    createdAt: newReservation.createdAt.toISOString(),
    updatedAt: newReservation.updatedAt.toISOString(),
  };

  return c.json(formattedReservation, 201);
});

// チーム登録付き予約作成ルート
const createReservationWithTeamRoute = createRoute({
  path: "/with-team",
  method: "post",
  tags: ["Reservations"],
  summary: "チーム登録付きで予約を作成",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createReservationWithTeam,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: {
        "application/json": {
          schema: z.object({
            reservation: reservation,
            team: z.object({
              id: z.number(),
              name: z.string(),
              headcount: z.number(),
            }),
          }),
        },
      },
    },
    400: {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
    409: {
      description: "Conflict - TimeSlot already booked",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});

app.openapi(createReservationWithTeamRoute, async (c) => {
  const data = c.req.valid("json");

  // 現在認証されているユーザーIDを取得
  const currentUserId = await getCurrentUserId(c);

  if (!currentUserId) {
    return c.json({ error: "認証が必要です" }, 400);
  }

  try {
    // トランザクションで原子的に処理
    const result = await prisma.$transaction(async (tx) => {
      // 1. ユーザーの既存予約をチェック（1枠制限）
      const existingReservations = await tx.reservation.findMany({
        where: {
          lineUserId: currentUserId,
        },
        include: {
          timeSlot: true,
        },
      });

      if (existingReservations.length > 0) {
        throw new Error("既に予約済みです。1人につき1枠までの制限があります。");
      }

      // 2. TimeSlotが予約可能か確認
      const timeSlot = await tx.timeSlot.findUnique({
        where: { id: data.timeSlotId },
      });

      if (!timeSlot) {
        throw new Error("指定されたタイムスロットが見つかりません");
      }

      if (timeSlot.slotType === "WALK_IN") {
        throw new Error("このタイムスロットは当日枠のため予約できません");
      }

      if (timeSlot.status === "BOOKED") {
        throw new Error("このタイムスロットは既に予約済みです");
      }

      // 2. チーム作成
      const newTeam = await tx.team.create({
        data: {
          name: data.teamName,
          headcount: data.memberCount,
        },
      });

      // 3. 予約作成
      const newReservation = await tx.reservation.create({
        data: {
          teamId: newTeam.id,
          lineUserId: currentUserId,
          startTime: timeSlot.slotTime,
          timeSlotId: data.timeSlotId,
        },
      });

      // 4. TimeSlotのステータスを「予約済み」に更新
      await tx.timeSlot.update({
        where: { id: data.timeSlotId },
        data: { status: "BOOKED" },
      });

      return { newReservation, newTeam };
    });

    const formattedResponse = {
      reservation: {
        id: result.newReservation.id,
        teamId: result.newReservation.teamId,
        lineUserId: result.newReservation.lineUserId,
        startTime: result.newReservation.startTime.toISOString(),
        timeSlotId: result.newReservation.timeSlotId,
        createdAt: result.newReservation.createdAt.toISOString(),
        updatedAt: result.newReservation.updatedAt.toISOString(),
      },
      team: {
        id: result.newTeam.id,
        name: result.newTeam.name,
        headcount: result.newTeam.headcount,
      },
    };

    return c.json(formattedResponse, 201);
  } catch (error) {
    console.error("Error creating reservation with team:", error);

    if (error instanceof Error) {
      if (error.message.includes("既に予約済み")) {
        return c.json({ error: error.message }, 409);
      }
      return c.json({ error: error.message }, 400);
    }

    return c.json({ error: "予約の作成に失敗しました" }, 400);
  }
});

// ユーザーの予約状態確認ルート
const getUserReservationStatusRoute = createRoute({
  path: "/my-status",
  method: "get",
  tags: ["Reservations"],
  summary: "ユーザーの予約状態を確認",
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({
            hasReservation: z.boolean(),
            reservation: reservation.nullable(),
            remainingSlots: z.number(),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});

app.openapi(getUserReservationStatusRoute, async (c) => {
  // 現在認証されているユーザーIDを取得
  const currentUserId = await getCurrentUserId(c);

  if (!currentUserId) {
    return c.json({ error: "認証が必要です" }, 401);
  }

  const existingReservations = await prisma.reservation.findMany({
    where: {
      lineUserId: currentUserId,
    },
    include: {
      timeSlot: true,
    },
  });

  const hasReservation = existingReservations.length > 0;
  const maxSlots = 1; // 1枠制限
  const remainingSlots = Math.max(0, maxSlots - existingReservations.length);

  const reservation = hasReservation
    ? {
        id: existingReservations[0].id,
        teamId: existingReservations[0].teamId,
        lineUserId: existingReservations[0].lineUserId,
        startTime: existingReservations[0].startTime.toISOString(),
        timeSlotId: existingReservations[0].timeSlotId,
        createdAt: existingReservations[0].createdAt.toISOString(),
        updatedAt: existingReservations[0].updatedAt.toISOString(),
      }
    : null;

  return c.json({
    hasReservation,
    reservation,
    remainingSlots,
  });
});

// 予約更新ルート
const updateReservationRoute = createRoute({
  path: "/{id}",
  method: "patch",
  tags: ["Reservations"],
  summary: "予約を更新",
  request: {
    params: idParam,
    body: {
      content: {
        "application/json": {
          schema: updateReservation,
        },
      },
    },
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: reservation,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Not Found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});

app.openapi(updateReservationRoute, async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");

  // 現在認証されているユーザーIDを取得
  const currentUserId = await getCurrentUserId(c);

  // NextAuth認証の場合、予約の所有者チェック
  if (currentUserId) {
    const existingReservation = await prisma.reservation.findUnique({
      where: { id },
      select: { lineUserId: true },
    });

    if (!existingReservation) {
      return c.json({ error: "Reservation not found" }, 404);
    }

    // lineUserIdがnullの予約は誰でも更新可能（後方互換性のため）
    if (
      existingReservation.lineUserId &&
      existingReservation.lineUserId !== currentUserId
    ) {
      return c.json(
        { error: "Access denied: You can only update your own reservations" },
        403
      );
    }
  }

  try {
    const updateData = {
      ...data,
      ...(data.startTime && { startTime: new Date(data.startTime) }),
    };

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
    });

    const formattedReservation = {
      ...updatedReservation,
      startTime: updatedReservation.startTime.toISOString(),
      createdAt: updatedReservation.createdAt.toISOString(),
      updatedAt: updatedReservation.updatedAt.toISOString(),
    };

    return c.json(formattedReservation, 200);
  } catch (error) {
    return c.json({ error: "Reservation not found" }, 404);
  }
});

// 予約削除ルート
const deleteReservationRoute = createRoute({
  path: "/{id}",
  method: "delete",
  tags: ["Reservations"],
  summary: "予約を削除",
  request: {
    params: idParam,
  },
  responses: {
    204: {
      description: "No Content",
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Not Found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});

app.openapi(deleteReservationRoute, async (c) => {
  const { id } = c.req.valid("param");

  // 現在認証されているユーザーIDを取得
  const currentUserId = await getCurrentUserId(c);

  // NextAuth認証の場合、予約の所有者チェック
  if (currentUserId) {
    const existingReservation = await prisma.reservation.findUnique({
      where: { id },
      select: { lineUserId: true },
    });

    if (!existingReservation) {
      return c.json({ error: "Reservation not found" }, 404);
    }

    // lineUserIdがnullの予約は誰でも削除可能（後方互換性のため）
    if (
      existingReservation.lineUserId &&
      existingReservation.lineUserId !== currentUserId
    ) {
      return c.json(
        { error: "Access denied: You can only delete your own reservations" },
        403
      );
    }
  }

  await prisma.reservation.delete({
    where: { id },
  });

  return c.body(null, 204);
});

export default app;
