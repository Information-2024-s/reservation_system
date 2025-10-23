import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { prisma } from '../../../lib/prisma';
import { teamScore, createTeamScore, updateTeamScore, idParam } from './zod_objects';
import { authenticateCombined } from './auth-helpers';
import { z } from 'zod';

const app = new OpenAPIHono();

// 全てのルートに認証を適用
app.use('*', authenticateCombined);

// チームスコア一覧取得ルート
const getTeamScoresRoute = createRoute({
    path: '/',
    method: 'get',
    tags: ['TeamScores'],
    summary: 'チームスコア一覧を取得',
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: teamScore.array(),
                },
            },
        },
    },
});

app.openapi(getTeamScoresRoute, async (c) => {
    const teamScores = await prisma.teamScore.findMany({
        include: {
            playerScores: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    const formattedTeamScores = teamScores.map((teamScore) => ({
        ...teamScore,
        createdAt: teamScore.createdAt.toISOString(),
        updatedAt: teamScore.updatedAt.toISOString(),
    }));

    return c.json(formattedTeamScores);
});

// チームスコア詳細取得ルート
const getTeamScoreRoute = createRoute({
    path: '/{id}',
    method: 'get',
    tags: ['TeamScores'],
    summary: 'チームスコア詳細を取得',
    request: {
        params: idParam,
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: teamScore,
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

app.openapi(getTeamScoreRoute, async (c) => {
    const { id } = c.req.valid('param');

    const teamScoreRecord = await prisma.teamScore.findUnique({
        where: { id },
        include: {
            playerScores: true,
        },
    });

    if (!teamScoreRecord) {
        return c.json({ error: 'チームスコアが見つかりません' }, 404);
    }

    const formattedTeamScore = {
        ...teamScoreRecord,
        createdAt: teamScoreRecord.createdAt.toISOString(),
        updatedAt: teamScoreRecord.updatedAt.toISOString(),
    };

    return c.json(formattedTeamScore, 200);
});

// チームスコア作成ルート
const createTeamScoreRoute = createRoute({
    path: '/',
    method: 'post',
    tags: ['TeamScores'],
    summary: 'チームスコアを作成',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createTeamScore,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Created',
            content: {
                'application/json': {
                    schema: teamScore,
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

app.openapi(createTeamScoreRoute, async (c) => {
    const data = c.req.valid('json');

    const newTeamScore = await prisma.teamScore.create({
        data,
    });

    const formattedTeamScore = {
        ...newTeamScore,
        createdAt: newTeamScore.createdAt.toISOString(),
        updatedAt: newTeamScore.updatedAt.toISOString(),
    };

    return c.json(formattedTeamScore, 201);
});

// チームスコア更新ルート
const updateTeamScoreRoute = createRoute({
    path: '/{id}',
    method: 'patch',
    tags: ['TeamScores'],
    summary: 'チームスコアを更新',
    request: {
        params: idParam,
        body: {
            content: {
                'application/json': {
                    schema: updateTeamScore,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: teamScore,
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

app.openapi(updateTeamScoreRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    
    // チームスコアが存在するかチェック
    const existingTeamScore = await prisma.teamScore.findUnique({
        where: { id },
    });

    if (!existingTeamScore) {
        return c.json({ error: 'チームスコアが見つかりません' }, 404);
    }

    const updatedTeamScore = await prisma.teamScore.update({
        where: { id },
        data,
    });

    const formattedTeamScore = {
        ...updatedTeamScore,
        createdAt: updatedTeamScore.createdAt.toISOString(),
        updatedAt: updatedTeamScore.updatedAt.toISOString(),
    };

    return c.json(formattedTeamScore, 200);
});

// チームスコア削除ルート
const deleteTeamScoreRoute = createRoute({
    path: '/{id}',
    method: 'delete',
    tags: ['TeamScores'],
    summary: 'チームスコアを削除',
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

app.openapi(deleteTeamScoreRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    // チームスコアが存在するかチェック
    const existingTeamScore = await prisma.teamScore.findUnique({
        where: { id },
    });

    if (!existingTeamScore) {
        return c.json({ error: 'チームスコアが見つかりません' }, 404);
    }
    
    await prisma.teamScore.delete({
        where: { id },
    });
    
    return c.body(null, 204);
});

export default app;