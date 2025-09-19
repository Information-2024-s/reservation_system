import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { prisma } from '../../../lib/prisma';
import { player, createPlayer, updatePlayer, idParam } from './zod_objects';
import { authenticateCombined } from './auth-helpers';
import { z } from 'zod';

const app = new OpenAPIHono();

// 全てのルートに認証を適用
app.use('*', authenticateCombined);

// プレイヤー一覧取得ルート
const getPlayersRoute = createRoute({
    path: '/',
    method: 'get',
    tags: ['Players'],
    summary: 'プレイヤー一覧を取得',
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: player.array(),
                },
            },
        },
    },
});

app.openapi(getPlayersRoute, async (c) => {
    const players = await prisma.player.findMany({
        orderBy: { createdAt: 'desc' },
    });

    const formattedPlayers = players.map((player) => ({
        ...player,
        createdAt: player.createdAt.toISOString(),
        updatedAt: player.updatedAt.toISOString(),
    }));

    return c.json(formattedPlayers);
});

// プレイヤー詳細取得ルート
const getPlayerRoute = createRoute({
    path: '/{id}',
    method: 'get',
    tags: ['Players'],
    summary: 'プレイヤー詳細を取得',
    request: {
        params: idParam,
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: player,
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

app.openapi(getPlayerRoute, async (c) => {
    const { id } = c.req.valid('param');

    const playerRecord = await prisma.player.findUnique({
        where: { id },
    });

    if (!playerRecord) {
        return c.json({ error: 'プレイヤーが見つかりません' }, 404);
    }

    const formattedPlayer = {
        ...playerRecord,
        createdAt: playerRecord.createdAt.toISOString(),
        updatedAt: playerRecord.updatedAt.toISOString(),
    };

    return c.json(formattedPlayer, 200);
});

// プレイヤー作成ルート
const createPlayerRoute = createRoute({
    path: '/',
    method: 'post',
    tags: ['Players'],
    summary: 'プレイヤーを作成',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createPlayer,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Created',
            content: {
                'application/json': {
                    schema: player,
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

app.openapi(createPlayerRoute, async (c) => {
    const data = c.req.valid('json');

    const newPlayer = await prisma.player.create({
        data,
    });

    const formattedPlayer = {
        ...newPlayer,
        createdAt: newPlayer.createdAt.toISOString(),
        updatedAt: newPlayer.updatedAt.toISOString(),
    };

    return c.json(formattedPlayer, 201);
});

// プレイヤー更新ルート
const updatePlayerRoute = createRoute({
    path: '/{id}',
    method: 'patch',
    tags: ['Players'],
    summary: 'プレイヤーを更新',
    request: {
        params: idParam,
        body: {
            content: {
                'application/json': {
                    schema: updatePlayer,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: player,
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

app.openapi(updatePlayerRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    
    // プレイヤーが存在するかチェック
    const existingPlayer = await prisma.player.findUnique({
        where: { id },
    });

    if (!existingPlayer) {
        return c.json({ error: 'プレイヤーが見つかりません' }, 404);
    }

    const updatedPlayer = await prisma.player.update({
        where: { id },
        data,
    });

    const formattedPlayer = {
        ...updatedPlayer,
        createdAt: updatedPlayer.createdAt.toISOString(),
        updatedAt: updatedPlayer.updatedAt.toISOString(),
    };

    return c.json(formattedPlayer, 200);
});

// プレイヤー削除ルート
const deletePlayerRoute = createRoute({
    path: '/{id}',
    method: 'delete',
    tags: ['Players'],
    summary: 'プレイヤーを削除',
    request: {
        params: idParam,
    },
    responses: {
        204: {
            description: 'No Content',
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

app.openapi(deletePlayerRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    // プレイヤーが存在するかチェック
    const existingPlayer = await prisma.player.findUnique({
        where: { id },
    });

    if (!existingPlayer) {
        return c.json({ error: 'プレイヤーが見つかりません' }, 404);
    }
    
    await prisma.player.delete({
        where: { id },
    });
    
    return c.body(null, 204);
});

export default app;