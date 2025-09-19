import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { prisma } from '../../../lib/prisma';
import { playerScore, createPlayerScore, updatePlayerScore, idParam } from './zod_objects';
import { authenticateCombined } from './auth-helpers';
import { z } from 'zod';

const app = new OpenAPIHono();

// 全てのルートに認証を適用
app.use('*', authenticateCombined);

// プレイヤースコア一覧取得ルート
const getPlayerScoresRoute = createRoute({
    path: '/',
    method: 'get',
    tags: ['PlayerScores'],
    summary: 'プレイヤースコア一覧を取得',
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: playerScore.array(),
                },
            },
        },
    },
});

app.openapi(getPlayerScoresRoute, async (c) => {
    const playerScores = await prisma.playerScore.findMany({
        include: {
            player: true,
            teamScore: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    const formattedPlayerScores = playerScores.map((playerScore) => ({
        ...playerScore,
        createdAt: playerScore.createdAt.toISOString(),
        updatedAt: playerScore.updatedAt.toISOString(),
    }));

    return c.json(formattedPlayerScores);
});

// プレイヤースコア詳細取得ルート
const getPlayerScoreRoute = createRoute({
    path: '/{id}',
    method: 'get',
    tags: ['PlayerScores'],
    summary: 'プレイヤースコア詳細を取得',
    request: {
        params: idParam,
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: playerScore,
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

app.openapi(getPlayerScoreRoute, async (c) => {
    const { id } = c.req.valid('param');

    const playerScoreRecord = await prisma.playerScore.findUnique({
        where: { id },
        include: {
            player: true,
            teamScore: true,
        },
    });

    if (!playerScoreRecord) {
        return c.json({ error: 'プレイヤースコアが見つかりません' }, 404);
    }

    const formattedPlayerScore = {
        ...playerScoreRecord,
        createdAt: playerScoreRecord.createdAt.toISOString(),
        updatedAt: playerScoreRecord.updatedAt.toISOString(),
    };

    return c.json(formattedPlayerScore, 200);
});

// プレイヤースコア作成ルート
const createPlayerScoreRoute = createRoute({
    path: '/',
    method: 'post',
    tags: ['PlayerScores'],
    summary: 'プレイヤースコアを作成',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createPlayerScore,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Created',
            content: {
                'application/json': {
                    schema: playerScore,
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

app.openapi(createPlayerScoreRoute, async (c) => {
    const data = c.req.valid('json');

    const newPlayerScore = await prisma.playerScore.create({
        data,
    });

    const formattedPlayerScore = {
        ...newPlayerScore,
        createdAt: newPlayerScore.createdAt.toISOString(),
        updatedAt: newPlayerScore.updatedAt.toISOString(),
    };

    return c.json(formattedPlayerScore, 201);
});

// プレイヤースコア更新ルート
const updatePlayerScoreRoute = createRoute({
    path: '/{id}',
    method: 'patch',
    tags: ['PlayerScores'],
    summary: 'プレイヤースコアを更新',
    request: {
        params: idParam,
        body: {
            content: {
                'application/json': {
                    schema: updatePlayerScore,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: playerScore,
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

app.openapi(updatePlayerScoreRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    
    // プレイヤースコアが存在するかチェック
    const existingPlayerScore = await prisma.playerScore.findUnique({
        where: { id },
    });

    if (!existingPlayerScore) {
        return c.json({ error: 'プレイヤースコアが見つかりません' }, 404);
    }

    const updatedPlayerScore = await prisma.playerScore.update({
        where: { id },
        data,
    });

    const formattedPlayerScore = {
        ...updatedPlayerScore,
        createdAt: updatedPlayerScore.createdAt.toISOString(),
        updatedAt: updatedPlayerScore.updatedAt.toISOString(),
    };

    return c.json(formattedPlayerScore, 200);
});

// プレイヤースコア削除ルート
const deletePlayerScoreRoute = createRoute({
    path: '/{id}',
    method: 'delete',
    tags: ['PlayerScores'],
    summary: 'プレイヤースコアを削除',
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

app.openapi(deletePlayerScoreRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    // プレイヤースコアが存在するかチェック
    const existingPlayerScore = await prisma.playerScore.findUnique({
        where: { id },
    });

    if (!existingPlayerScore) {
        return c.json({ error: 'プレイヤースコアが見つかりません' }, 404);
    }
    
    await prisma.playerScore.delete({
        where: { id },
    });
    
    return c.body(null, 204);
});

export default app;