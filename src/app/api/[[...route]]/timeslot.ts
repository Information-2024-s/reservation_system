import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { prisma } from '../../../lib/prisma';
import { timeSlot, createTimeSlot, updateTimeSlot, idParam } from './zod_objects';
import { authenticateCombined, noAuthentication } from './auth-helpers';

const app = new OpenAPIHono();

// 取得系ルート（GET）は認証なし、それ以外は認証が必要
app.use('*', async (c, next) => {
    if (c.req.method === 'GET') {
        await noAuthentication(c, next);
    } else {
        await authenticateCombined(c, next);
    }
});

// タイムスロット一覧取得ルート
const getTimeSlotsRoute = createRoute({
    path: '/',
    method: 'get',
    tags: ['TimeSlots'],
    summary: 'タイムスロット一覧を取得',
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: timeSlot.array(),
                },
            },
        },
    },
});

app.openapi(getTimeSlotsRoute, async (c) => {
    // クエリパラメータを取得
    const date = c.req.query('date'); // YYYY-MM-DD形式
    const startHour = c.req.query('startHour'); // 数値（10など）
    const endHour = c.req.query('endHour'); // 数値（16など）

    let whereConditions: any = {};

    // 日付フィルタ
    if (date) {
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);
        whereConditions.slotTime = {
            gte: startOfDay,
            lte: endOfDay,
        };
    }

    // 時刻フィルタ（日付フィルタと組み合わせる場合）
    if (date && startHour && endHour) {
        const startTime = new Date(`${date}T${startHour.padStart(2, '0')}:00:00.000Z`);
        const endTime = new Date(`${date}T${endHour.padStart(2, '0')}:59:59.999Z`);
        whereConditions.slotTime = {
            gte: startTime,
            lte: endTime,
        };
    }

    const timeSlots = await prisma.timeSlot.findMany({
        where: whereConditions,
        orderBy: { slotTime: 'asc' },
    });

    const formattedTimeSlots = timeSlots.map(slot => ({
        id: slot.id,
        slotTime: slot.slotTime.toISOString(),
        slotType: slot.slotType,
        status: slot.status,
        createdAt: slot.createdAt.toISOString(),
        updatedAt: slot.updatedAt.toISOString(),
    }));

    return c.json(formattedTimeSlots);
});

// タイムスロット詳細取得ルート
const getTimeSlotRoute = createRoute({
    path: '/{id}',
    method: 'get',
    tags: ['TimeSlots'],
    summary: 'タイムスロット詳細を取得',
    request: {
        params: idParam,
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: timeSlot,
                },
            },
        },
    },
});

app.openapi(getTimeSlotRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    const timeSlotRecord = await prisma.timeSlot.findUnique({
        where: { id },
    });
    
    const formattedTimeSlot = {
        ...timeSlotRecord!,
        slotTime: timeSlotRecord!.slotTime.toISOString(),
        createdAt: timeSlotRecord!.createdAt.toISOString(),
        updatedAt: timeSlotRecord!.updatedAt.toISOString(),
    };
    
    return c.json(formattedTimeSlot);
});

// タイムスロット作成ルート
const createTimeSlotRoute = createRoute({
    path: '/',
    method: 'post',
    tags: ['TimeSlots'],
    summary: 'タイムスロットを作成',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createTimeSlot,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Created',
            content: {
                'application/json': {
                    schema: timeSlot,
                },
            },
        },
    },
});

app.openapi(createTimeSlotRoute, async (c) => {
    const data = c.req.valid('json');
    
    const timeSlotData = {
        ...data,
        slotTime: new Date(data.slotTime),
        status: data.status || 'AVAILABLE',
    };
    
    const newTimeSlot = await prisma.timeSlot.create({
        data: timeSlotData,
    });
    
    const formattedTimeSlot = {
        ...newTimeSlot,
        slotTime: newTimeSlot.slotTime.toISOString(),
        createdAt: newTimeSlot.createdAt.toISOString(),
        updatedAt: newTimeSlot.updatedAt.toISOString(),
    };
    
    return c.json(formattedTimeSlot, 201);
});

// タイムスロット更新ルート
const updateTimeSlotRoute = createRoute({
    path: '/{id}',
    method: 'patch',
    tags: ['TimeSlots'],
    summary: 'タイムスロットを更新',
    request: {
        params: idParam,
        body: {
            content: {
                'application/json': {
                    schema: updateTimeSlot,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: timeSlot,
                },
            },
        },
    },
});

app.openapi(updateTimeSlotRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    
    const updateData = {
        ...data,
        ...(data.slotTime && { slotTime: new Date(data.slotTime) }),
    };
    
    const updatedTimeSlot = await prisma.timeSlot.update({
        where: { id },
        data: updateData,
    });
    
    const formattedTimeSlot = {
        ...updatedTimeSlot,
        slotTime: updatedTimeSlot.slotTime.toISOString(),
        createdAt: updatedTimeSlot.createdAt.toISOString(),
        updatedAt: updatedTimeSlot.updatedAt.toISOString(),
    };
    
    return c.json(formattedTimeSlot);
});

// タイムスロット削除ルート
const deleteTimeSlotRoute = createRoute({
    path: '/{id}',
    method: 'delete',
    tags: ['TimeSlots'],
    summary: 'タイムスロットを削除',
    request: {
        params: idParam,
    },
    responses: {
        204: {
            description: 'No Content',
        },
    },
});

app.openapi(deleteTimeSlotRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    await prisma.timeSlot.delete({
        where: { id },
    });
    
    return c.body(null, 204);
});

// 利用可能なタイムスロット取得ルート
const getAvailableTimeSlotsRoute = createRoute({
    path: '/available',
    method: 'get',
    tags: ['TimeSlots'],
    summary: '利用可能なタイムスロット一覧を取得',
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: timeSlot.array(),
                },
            },
        },
    },
});

app.openapi(getAvailableTimeSlotsRoute, async (c) => {
    const availableTimeSlots = await prisma.timeSlot.findMany({
        where: {
            status: 'AVAILABLE',
        },
        orderBy: { slotTime: 'asc' },
    });

    const formattedTimeSlots = availableTimeSlots.map(slot => ({
        id: slot.id,
        slotTime: slot.slotTime.toISOString(),
        slotType: slot.slotType,
        status: slot.status,
        createdAt: slot.createdAt.toISOString(),
        updatedAt: slot.updatedAt.toISOString(),
    }));

    return c.json(formattedTimeSlots);
});

export default app;