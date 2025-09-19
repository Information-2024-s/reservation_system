import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { prisma } from "../../../lib/prisma";
import {
  reservation,
  createReservation,
  updateReservation,
  idParam,
  createReservationWithTeam,
  addTeamToReservation,
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
    include: {
      teams: true,
      timeSlot: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedReservations = reservations.map((reservation) => ({
    id: reservation.id,
    lineUserId: reservation.lineUserId,
    startTime: reservation.startTime.toISOString(),
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
    timeSlotId: reservation.timeSlotId,
    teams: reservation.teams,
    timeSlot: reservation.timeSlot,
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
  
  if (!currentUserId) {
    console.log("No authenticated user");
    return c.json({ error: "認証が必要です" }, 401);
  }

  // 現在の時刻
  const now = new Date();

  // 現在のユーザーの未来の予約を取得（チーム情報とタイムスロット情報も含む）
  const userReservation = await prisma.reservation.findFirst({
    where: { 
      lineUserId: currentUserId,
      timeSlot: {
        slotTime: {
          gte: now // 現在時刻以降のタイムスロットのみ
        }
      }
    },
    include: {
      teams: {
        include: {
          players: true,
        },
      },
      timeSlot: true,
    },
    orderBy: { 
      timeSlot: {
        slotTime: "asc" // 最も近い未来の予約を取得
      }
    },
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
    lineUserId: userReservation.lineUserId,
    startTime: userReservation.startTime.toISOString(),
    createdAt: userReservation.createdAt.toISOString(),
    updatedAt: userReservation.updatedAt.toISOString(),
    timeSlotId: userReservation.timeSlotId,
  };

  // 最初のチームを取得（通常は1つの予約に1つのチーム）
  const firstTeam = userReservation.teams[0];
  const formattedTeam = firstTeam
    ? {
        id: firstTeam.id,
        name: firstTeam.name,
        headcount: firstTeam.headcount,
        players: firstTeam.players.map((player) => ({
          id: player.id,
          name: player.name || "",
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

  console.log('=== 予約作成API開始 ===');
  console.log('リクエストデータ:', data);

  // 現在認証されているユーザーIDを取得
  const currentUserId = await getCurrentUserId(c);
  console.log('認証されたユーザーID:', currentUserId);

  try {
    const result = await prisma.$transaction(async (tx) => {
      console.log('トランザクション開始');
      
      // 1. タイムスロットの確認
      const timeSlot = await tx.timeSlot.findUnique({
        where: { id: data.timeSlotId },
      });

      console.log('取得したタイムスロット:', timeSlot);

      if (!timeSlot) {
        throw new Error("指定されたタイムスロットが見つかりません");
      }

      if (timeSlot.slotType === "WALK_IN") {
        throw new Error("このタイムスロットは当日枠のため予約できません");
      }

      if (timeSlot.status === "BOOKED") {
        throw new Error("このタイムスロットは既に予約済みです");
      }

      // 2. 既存の未来の予約をチェック（認証されたユーザーの場合のみ）
      if (currentUserId) {
        const now = new Date();
        console.log('現在時刻:', now);
        
        const existingFutureReservation = await tx.reservation.findFirst({
          where: {
            lineUserId: currentUserId,
            timeSlot: {
              slotTime: {
                gte: now // 現在時刻以降のタイムスロットのみ
              }
            }
          },
          include: {
            timeSlot: true,
          },
        });

        console.log('既存の未来の予約:', existingFutureReservation);

        if (existingFutureReservation) {
          throw new Error("既に未来の予約があります。予約は1人につき1つまでです。");
        }
      }

      // 3. 予約作成
      const reservationData = {
        startTime: timeSlot.slotTime,
        timeSlotId: data.timeSlotId,
        lineUserId: null as string | null,
      };

      if (currentUserId) {
        reservationData.lineUserId = currentUserId;
      } else if (data.lineUserId) {
        reservationData.lineUserId = data.lineUserId;
      }

      console.log('予約データ:', reservationData);

      const newReservation = await tx.reservation.create({
        data: reservationData,
      });

      console.log('作成された予約:', newReservation);

      // 3. タイムスロットのステータスを「予約済み」に更新
      await tx.timeSlot.update({
        where: { id: data.timeSlotId },
        data: { status: "BOOKED" },
      });

      console.log('タイムスロットステータス更新完了');

      return newReservation;
    });

    console.log('トランザクション完了, 結果:', result);

    const formattedReservation = {
      ...result,
      startTime: result.startTime.toISOString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };

    console.log('フォーマット済み予約:', formattedReservation);

    return c.json(formattedReservation, 201);
  } catch (error) {
    console.error("=== 予約作成エラー ===");
    console.error("エラー詳細:", error);
    console.error("エラータイプ:", typeof error);
    console.error("エラースタック:", error instanceof Error ? error.stack : 'スタックなし');
    
    const errorMessage = error instanceof Error ? error.message : "予約の作成に失敗しました";
    console.error("返却エラーメッセージ:", errorMessage);
    
    return c.json(
      { error: errorMessage, message: errorMessage },
      400
    );
  }
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
      // 1. ユーザーの既存の未来の予約をチェック（1枠制限）
      const now = new Date();
      const existingFutureReservations = await tx.reservation.findMany({
        where: {
          lineUserId: currentUserId,
          timeSlot: {
            slotTime: {
              gte: now // 現在時刻以降のタイムスロットのみ
            }
          }
        },
        include: {
          timeSlot: true,
        },
      });

      if (existingFutureReservations.length > 0) {
        throw new Error("既に未来の予約があります。予約は1人につき1つまでです。");
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

      // 2. 予約作成（先に作成してIDを取得）
      const newReservation = await tx.reservation.create({
        data: {
          lineUserId: currentUserId,
          startTime: timeSlot.slotTime,
          timeSlotId: data.timeSlotId,
        },
      });

      // 3. チーム作成（予約IDを使用）
      const newTeam = await tx.team.create({
        data: {
          name: data.teamName,
          headcount: data.memberCount,
          reservation_id: newReservation.id,
        },
      });

      // 4. プレイヤー作成
      for (const memberName of data.memberNames) {
        await tx.player.create({
          data: {
            name: memberName,
            team_id: newTeam.id,
          },
        });
      }

      // 5. TimeSlotのステータスを「予約済み」に更新
      await tx.timeSlot.update({
        where: { id: data.timeSlotId },
        data: { status: "BOOKED" },
      });

      return { newReservation, newTeam };
    });

    const formattedResponse = {
      reservation: {
        id: result.newReservation.id,
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

  try {
    // まず予約が存在するかチェック
    const existingReservation = await prisma.reservation.findUnique({
      where: { id },
      include: { timeSlot: true },
    });

    if (!existingReservation) {
      return c.json({ error: "予約が見つかりません" }, 404);
    }

    // 過去の予約は削除不可
    const now = new Date();
    const reservationTime = existingReservation.timeSlot?.slotTime || existingReservation.startTime;
    
    if (reservationTime < now) {
      return c.json({ error: "過去の予約は削除できません" }, 400);
    }

    // 関連するチームとプレイヤーも含めて削除するトランザクション処理
    await prisma.$transaction(async (tx) => {
      // 1. 予約に関連するチームを取得
      const teams = await tx.team.findMany({
        where: { reservation_id: id },
      });

      // 2. 各チームに関連するプレイヤーを削除
      for (const team of teams) {
        await tx.player.deleteMany({
          where: { team_id: team.id },
        });
      }

      // 3. チームを削除
      await tx.team.deleteMany({
        where: { reservation_id: id },
      });

      // 4. 予約に関連するタイムスロットのステータスを AVAILABLE に戻す
      if (existingReservation.timeSlot) {
        await tx.timeSlot.update({
          where: { id: existingReservation.timeSlot.id },
          data: { status: "AVAILABLE" },
        });
      }

      // 5. 予約を削除
      await tx.reservation.delete({
        where: { id },
      });
    });

    console.log("Successfully deleted reservation ID:", id);
    return c.body(null, 204);
  } catch (error) {
    console.error("Error deleting reservation:", error);
    
    if (error instanceof Error) {
      // Prismaの特定のエラーをチェック
      if (error.message.includes("Record to delete does not exist")) {
        return c.json({ error: "予約が見つかりません" }, 404);
      }
      
      // 外部キー制約エラーなど
      if (error.message.includes("Foreign key constraint")) {
        return c.json({ error: "関連データが存在するため削除できません" }, 400);
      }
    }

    return c.json({ error: "予約の削除に失敗しました" }, 500);
  }
});

// 既存予約にチーム追加ルート
const addTeamToReservationRoute = createRoute({
  path: "/{id}/add-team",
  method: "post",
  tags: ["Reservations"],
  summary: "既存予約にチーム情報を追加",
  request: {
    params: idParam,
    body: {
      content: {
        "application/json": {
          schema: addTeamToReservation,
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

app.openapi(addTeamToReservationRoute, async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");

  console.log('=== チーム追加API開始 ===');
  console.log('予約ID:', id);
  console.log('チームデータ:', data);

  // 現在認証されているユーザーIDを取得
  const currentUserId = await getCurrentUserId(c);
  console.log('認証されたユーザーID:', currentUserId);

  if (!currentUserId) {
    return c.json({ error: "認証が必要です" }, 401);
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 予約の存在確認と所有者確認
      const existingReservation = await tx.reservation.findUnique({
        where: { id: Number(id) },
        include: {
          teams: true,
        },
      });

      if (!existingReservation) {
        throw new Error("予約が見つかりません");
      }

      if (existingReservation.lineUserId !== currentUserId) {
        throw new Error("この予約を変更する権限がありません");
      }

      if (existingReservation.teams.length > 0) {
        throw new Error("この予約には既にチーム情報が登録されています");
      }

      console.log('予約確認完了:', existingReservation);

      // 2. チーム作成
      const newTeam = await tx.team.create({
        data: {
          name: data.name,
          headcount: data.headcount,
          reservation_id: existingReservation.id,
        },
      });

      console.log('チーム作成完了:', newTeam);

      // 3. プレイヤー作成
      for (const memberName of data.memberNames) {
        await tx.player.create({
          data: {
            name: memberName,
            team_id: newTeam.id,
          },
        });
      }

      console.log('プレイヤー作成完了');

      return newTeam;
    });

    console.log('トランザクション完了:', result);

    return c.json({ team: result }, 201);
  } catch (error) {
    console.error("=== チーム追加エラー ===");
    console.error("エラー詳細:", error);
    
    const errorMessage = error instanceof Error ? error.message : "チームの追加に失敗しました";
    console.error("返却エラーメッセージ:", errorMessage);
    
    return c.json(
      { error: errorMessage },
      400
    );
  }
});

export default app;
