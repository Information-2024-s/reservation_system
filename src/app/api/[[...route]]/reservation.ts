import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { prisma } from '../../../lib/prisma';
import { reservation, createReservation, updateReservation, idParam } from './zod_objects';
import { auth } from "@/auth";
import { authenticateCombined, getCurrentUserId } from './auth-helpers';
import { z } from 'zod';

const app = new OpenAPIHono();

// 取得系ルート（GET）はAPIキーまたはNextAuth認証、CUD系も両方対応
app.use('*', authenticateCombined);

// 予約一覧取得ルート
const getReservationsRoute = createRoute({
    path: '/',
    method: 'get',
    tags: ['Reservations'],
    summary: '予約一覧を取得',
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: reservation.array(),
                },
            },
        },
    },
});

app.openapi(getReservationsRoute, async (c) => {
    const session = await auth();

    console.log('Authenticated session:', session);


    const reservations = await prisma.reservation.findMany({
        orderBy: { createdAt: 'desc' },
    });

    const formattedReservations = reservations.map(reservation => ({
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

// 予約詳細取得ルート
const getReservationRoute = createRoute({
    path: '/{id}',
    method: 'get',
    tags: ['Reservations'],
    summary: '予約詳細を取得',
    request: {
        params: idParam,
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: reservation,
                },
            },
        },
    },
});

app.openapi(getReservationRoute, async (c) => {
    const { id } = c.req.valid('param');
    
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
    path: '/',
    method: 'post',
    tags: ['Reservations'],
    summary: '予約を作成',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createReservation,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Created',
            content: {
                'application/json': {
                    schema: reservation,
                },
            },
        },
        400: {
            description: 'Bad Request',
            content: {
                'application/json': {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
        },
    },
});

app.openapi(createReservationRoute, async (c) => {
    const data = c.req.valid('json');
    
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

// 予約更新ルート
const updateReservationRoute = createRoute({
    path: '/{id}',
    method: 'patch',
    tags: ['Reservations'],
    summary: '予約を更新',
    request: {
        params: idParam,
        body: {
            content: {
                'application/json': {
                    schema: updateReservation,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: reservation,
                },
            },
        },
        403: {
            description: 'Forbidden',
            content: {
                'application/json': {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
        },
        404: {
            description: 'Not Found',
            content: {
                'application/json': {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
        },
    },
});

app.openapi(updateReservationRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');

    // 現在認証されているユーザーIDを取得
    const currentUserId = await getCurrentUserId(c);

    // NextAuth認証の場合、予約の所有者チェック
    if (currentUserId) {
        const existingReservation = await prisma.reservation.findUnique({
            where: { id },
            select: { lineUserId: true },
        });

        if (!existingReservation) {
            return c.json({ error: 'Reservation not found' }, 404);
        }

        // lineUserIdがnullの予約は誰でも更新可能（後方互換性のため）
        if (existingReservation.lineUserId && existingReservation.lineUserId !== currentUserId) {
            return c.json({ error: 'Access denied: You can only update your own reservations' }, 403);
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
        return c.json({ error: 'Reservation not found' }, 404);
    }
});

// 予約削除ルート
const deleteReservationRoute = createRoute({
    path: '/{id}',
    method: 'delete',
    tags: ['Reservations'],
    summary: '予約を削除',
    request: {
        params: idParam,
    },
    responses: {
        204: {
            description: 'No Content',
        },
        403: {
            description: 'Forbidden',
            content: {
                'application/json': {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
        },
        404: {
            description: 'Not Found',
            content: {
                'application/json': {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
        },
    },
});

app.openapi(deleteReservationRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    // 現在認証されているユーザーIDを取得
    const currentUserId = await getCurrentUserId(c);
    
    // NextAuth認証の場合、予約の所有者チェック
    if (currentUserId) {
        const existingReservation = await prisma.reservation.findUnique({
            where: { id },
            select: { lineUserId: true },
        });
        
        if (!existingReservation) {
            return c.json({ error: 'Reservation not found' }, 404);
        }
        
        // lineUserIdがnullの予約は誰でも削除可能（後方互換性のため）
        if (existingReservation.lineUserId && existingReservation.lineUserId !== currentUserId) {
            return c.json({ error: 'Access denied: You can only delete your own reservations' }, 403);
        }
    }
    
    await prisma.reservation.delete({
        where: { id },
    });
    
    return c.body(null, 204);
});

export default app;
