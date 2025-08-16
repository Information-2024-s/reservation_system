import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { prisma } from '../../../lib/prisma';
import { reservation, createReservation, updateReservation, idParam } from './zod_objects';

const app = new OpenAPIHono();

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
    const reservations = await prisma.reservation.findMany({
        orderBy: { createdAt: 'desc' },
    });
    
    const formattedReservations = reservations.map(reservation => ({
        ...reservation,
        startTime: reservation.startTime.toISOString(),
        endTime: reservation.endTime.toISOString(),
        createdAt: reservation.createdAt.toISOString(),
        updatedAt: reservation.updatedAt.toISOString(),
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
        startTime: reservationRecord!.startTime.toISOString(),
        endTime: reservationRecord!.endTime.toISOString(),
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
    },
});

app.openapi(createReservationRoute, async (c) => {
    const data = c.req.valid('json');
    
    const reservationData = {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
    };
    
    const newReservation = await prisma.reservation.create({
        data: reservationData,
    });
    
    const formattedReservation = {
        ...newReservation,
        startTime: newReservation.startTime.toISOString(),
        endTime: newReservation.endTime.toISOString(),
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
    },
});

app.openapi(updateReservationRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    
    const updateData = {
        ...data,
        ...(data.startTime && { startTime: new Date(data.startTime) }),
        ...(data.endTime && { endTime: new Date(data.endTime) }),
    };
    
    const updatedReservation = await prisma.reservation.update({
        where: { id },
        data: updateData,
    });
    
    const formattedReservation = {
        ...updatedReservation,
        startTime: updatedReservation.startTime.toISOString(),
        endTime: updatedReservation.endTime.toISOString(),
        createdAt: updatedReservation.createdAt.toISOString(),
        updatedAt: updatedReservation.updatedAt.toISOString(),
    };
    
    return c.json(formattedReservation);
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
    },
});

app.openapi(deleteReservationRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    await prisma.reservation.delete({
        where: { id },
    });
    
    return c.body(null, 204);
});

export default app;
