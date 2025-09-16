import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { prisma } from '../../../lib/prisma';
import { teamScore, createTeamScore, updateTeamScore, idParam, errorResponse } from './zod_objects';
import { z } from 'zod';
import { authenticateApiKeyOnly } from './auth-helpers';

const app = new OpenAPIHono();

// 認証ミドルウェアを適用（APIキー認証のみ）
app.use('*', authenticateApiKeyOnly);

// ランキング用のスキーマ定義
const rankingItem = z.object({
  rank: z.number(),
  id: z.number(),
  name: z.string(),
  score: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// チームスコア一覧取得ルート
const getScoresRoute = createRoute({
    path: '/',
    method: 'get',
    tags: ['TeamScores'],
    summary: 'チームスコア一覧を取得',
    request: {
        query: z.object({
            limit: z.string().optional().default('5').transform(val => parseInt(val, 10)),
            gameSessionId: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
        }),
    },
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

app.openapi(getScoresRoute, async (c) => {
    const { limit, gameSessionId } = c.req.valid('query');
    
    const where: { gameSessionId?: number } = {};
    if (gameSessionId) where.gameSessionId = gameSessionId;
    
    const scores = await prisma.teamScore.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
    
    const formattedScores = scores.map(score => ({
        ...score,
        createdAt: score.createdAt.toISOString(),
        updatedAt: score.updatedAt.toISOString(),
    }));
    
    return c.json(formattedScores);
});

// チームスコア詳細取得ルート
const getScoreRoute = createRoute({
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
            description: 'チームスコアが見つかりません',
            content: {
                'application/json': {
                    schema: errorResponse,
                },
            },
        },
    },
});

app.openapi(getScoreRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    const scoreRecord = await prisma.teamScore.findUnique({
        where: { id },
    });
    
    if (!scoreRecord) {
        return c.json({ error: 'チームスコアが見つかりません' }, 404);
    }
    
    const formattedScore = {
        ...scoreRecord,
        createdAt: scoreRecord.createdAt.toISOString(),
        updatedAt: scoreRecord.updatedAt.toISOString(),
    };
    
    return c.json(formattedScore, 200);
});

// チームスコア作成ルート
const createScoreRoute = createRoute({
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
                    schema: errorResponse,
                },
            },
        },
    },
});

app.openapi(createScoreRoute, async (c) => {
    const { teamId, score, gameSessionId } = c.req.valid('json');
    
    try {
        const newScore = await prisma.teamScore.create({
            data: { teamId, score, gameSessionId },
        });
        
        const formattedScore = {
            ...newScore,
            createdAt: newScore.createdAt.toISOString(),
            updatedAt: newScore.updatedAt.toISOString(),
        };
        
        return c.json(formattedScore, 201);
    } catch (error) {
        return c.json({ error: 'チームスコアの作成に失敗しました' }, 400);
    }
});

// チームスコア更新ルート
const updateScoreRoute = createRoute({
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
            description: 'チームスコアが見つかりません',
            content: {
                'application/json': {
                    schema: errorResponse,
                },
            },
        },
    },
});

app.openapi(updateScoreRoute, async (c) => {
    const { id } = c.req.valid('param');
    const updates = c.req.valid('json');
    
    try {
        const updatedScore = await prisma.teamScore.update({
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
            { error: 'チームスコアが見つかりません', details: error instanceof Error ? error.message : undefined },
            404
        );
    }
});

// チームスコア削除ルート
const deleteScoreRoute = createRoute({
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
            description: 'チームスコアが見つかりません',
            content: {
                'application/json': {
                    schema: errorResponse,
                },
            },
        },
    },
});

app.openapi(deleteScoreRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    try {
        await prisma.teamScore.delete({
            where: { id },
        });
        
        return c.body(null, 204);
    } catch (error) {
        return c.json({ error: 'チームスコアが見つかりません' }, 404);
    }
});

// ランキング取得ルート
const getRankingRoute = createRoute({
    path: '/ranking',
    method: 'get',
    tags: ['TeamScores'],
    summary: 'チームランキングを取得',
    request: {
        query: z.object({
            gameSessionId: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
        }),
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: rankingItem.array(),
                },
            },
        },
    },
});

app.openapi(getRankingRoute, async (c) => {
    const { gameSessionId } = c.req.valid('query');
    
    const where: { gameSessionId?: number } = {};
    if (gameSessionId) where.gameSessionId = gameSessionId;
    
    const teams = await prisma.team.findMany({
        include: {
            scores: {
                where,
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
        },
    });
    
    const ranking = teams
        .map(team => ({
            rank: 0,
            id: team.id,
            name: team.name,
            score: team.scores[0]?.score || 0,
            createdAt: team.scores[0]?.createdAt.toISOString() || team.createdAt.toISOString(),
            updatedAt: team.scores[0]?.updatedAt.toISOString() || team.updatedAt.toISOString(),
        }))
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({ ...item, rank: index + 1 }));
    
    return c.json(ranking);
});

export default app;
