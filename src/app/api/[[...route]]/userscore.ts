import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { prisma } from '../../../lib/prisma';
import { userScore, createUserScore, updateUserScore, idParam, errorResponse } from './zod_objects';
import { z } from 'zod';

const app = new OpenAPIHono();

// ユーザースコア一覧取得ルート
const getUserScoresRoute = createRoute({
    path: '/',
    method: 'get',
    tags: ['UserScores'],
    summary: 'ユーザースコア一覧を取得',
    request: {
        query: z.object({
            userId: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
            gameSessionId: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
            limit: z.string().optional().default('10').transform(val => parseInt(val, 10)),
        }),
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: userScore.array(),
                },
            },
        },
    },
});

app.openapi(getUserScoresRoute, async (c) => {
    const { userId, gameSessionId, limit } = c.req.valid('query');
    
    const where: any = {};
    if (userId) where.userId = userId;
    if (gameSessionId) where.gameSessionId = gameSessionId;
    
    const userScores = await prisma.userScore.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
    
    const formattedUserScores = userScores.map(score => ({
        ...score,
        createdAt: score.createdAt.toISOString(),
        updatedAt: score.updatedAt.toISOString(),
    }));
    
    return c.json(formattedUserScores);
});

// ユーザースコア詳細取得ルート
const getUserScoreRoute = createRoute({
    path: '/{id}',
    method: 'get',
    tags: ['UserScores'],
    summary: 'ユーザースコア詳細を取得',
    request: {
        params: idParam,
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: userScore,
                },
            },
        },
        404: {
            description: 'ユーザースコアが見つかりません',
            content: {
                'application/json': {
                    schema: errorResponse,
                },
            },
        },
    },
});

app.openapi(getUserScoreRoute, async (c) => {
    const { id } = c.req.valid('param');

    const scoreRecord = await prisma.userScore.findUnique({
        where: { id },
    });

    if (!scoreRecord) {
        return c.json({ error: 'ユーザースコアが見つかりません', details: undefined }, 404);
    }

    const formattedScore = {
        ...scoreRecord,
        createdAt: scoreRecord.createdAt.toISOString(),
        updatedAt: scoreRecord.updatedAt.toISOString(),
    };

    return c.json(formattedScore, 200);
});

// ユーザースコア作成ルート
const createUserScoreRoute = createRoute({
    path: '/',
    method: 'post',
    tags: ['UserScores'],
    summary: 'ユーザースコアを作成',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createUserScore,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Created',
            content: {
                'application/json': {
                    schema: userScore,
                },
            },
        },
        400: {
            description: 'Bad Request',
            content: {
                'application/json': {
                    schema: errorResponse,
                },
            },
        },
    },
});

app.openapi(createUserScoreRoute, async (c) => {
    const { userId, score, gameSessionId } = c.req.valid('json');
    
    try {
        const newUserScore = await prisma.userScore.create({
            data: { userId, score, gameSessionId },
        });
        
        const formattedScore = {
            ...newUserScore,
            createdAt: newUserScore.createdAt.toISOString(),
            updatedAt: newUserScore.updatedAt.toISOString(),
        };
        
        return c.json(formattedScore, 201);
    } catch (error) {
        return c.json({ error: 'ユーザースコアの作成に失敗しました' }, 400);
    }
});

// ユーザースコア更新ルート
const updateUserScoreRoute = createRoute({
    path: '/{id}',
    method: 'patch',
    tags: ['UserScores'],
    summary: 'ユーザースコアを更新',
    request: {
        params: idParam,
        body: {
            content: {
                'application/json': {
                    schema: updateUserScore,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: userScore,
                },
            },
        },
        404: {
            description: 'ユーザースコアが見つかりません',
            content: {
                'application/json': {
                    schema: errorResponse,
                },
            },
        },
    },
});

app.openapi(updateUserScoreRoute, async (c) => {
    const { id } = c.req.valid('param');
    const updates = c.req.valid('json');

    try {
        const updatedScore = await prisma.userScore.update({
            where: { id },
            data: updates,
        });

        const formattedScore = {
            ...updatedScore,
            createdAt: updatedScore.createdAt.toISOString(),
            updatedAt: updatedScore.updatedAt.toISOString(),
        };

        return c.json(formattedScore, 200);
    } catch (error) {
        return c.json(
            { error: 'ユーザースコアが見つかりません', details: error instanceof Error ? error.message : undefined },
            404
        );
    }
});

// ユーザースコア削除ルート
const deleteUserScoreRoute = createRoute({
    path: '/{id}',
    method: 'delete',
    tags: ['UserScores'],
    summary: 'ユーザースコアを削除',
    request: {
        params: idParam,
    },
    responses: {
        204: {
            description: 'No Content',
        },
        404: {
            description: 'ユーザースコアが見つかりません',
            content: {
                'application/json': {
                    schema: errorResponse,
                },
            },
        },
    },
});

app.openapi(deleteUserScoreRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    try {
        await prisma.userScore.delete({
            where: { id },
        });
        
        return c.body(null, 204);
    } catch (error) {
        return c.json({ error: 'ユーザースコアが見つかりません' }, 404);
    }
});

export default app;
