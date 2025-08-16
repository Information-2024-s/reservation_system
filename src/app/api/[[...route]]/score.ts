import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { prisma } from '../../../lib/prisma';
import { score, createScore, updateScore, idParam } from './zod_objects';

const app = new OpenAPIHono();

// スコア一覧取得ルート
const getScoresRoute = createRoute({
    path: '/',
    method: 'get',
    tags: ['Scores'],
    summary: 'スコア一覧を取得',
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: score.array(),
                },
            },
        },
    },
});

app.openapi(getScoresRoute, async (c) => {
    const scores = await prisma.score.findMany({
        orderBy: { createdAt: 'desc' },
    });
    
    const formattedScores = scores.map(score => ({
        ...score,
        createdAt: score.createdAt.toISOString(),
        updatedAt: score.updatedAt.toISOString(),
    }));
    
    return c.json(formattedScores);
});

// スコア詳細取得ルート
const getScoreRoute = createRoute({
    path: '/{id}',
    method: 'get',
    tags: ['Scores'],
    summary: 'スコア詳細を取得',
    request: {
        params: idParam,
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: score,
                },
            },
        },
    },
});

app.openapi(getScoreRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    const scoreRecord = await prisma.score.findUnique({
        where: { id },
    });
    
    const formattedScore = {
        ...scoreRecord!,
        createdAt: scoreRecord!.createdAt.toISOString(),
        updatedAt: scoreRecord!.updatedAt.toISOString(),
    };
    
    return c.json(formattedScore);
});

// スコア作成ルート
const createScoreRoute = createRoute({
    path: '/',
    method: 'post',
    tags: ['Scores'],
    summary: 'スコアを作成',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createScore,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Created',
            content: {
                'application/json': {
                    schema: score,
                },
            },
        },
    },
});

app.openapi(createScoreRoute, async (c) => {
    const data = c.req.valid('json');
    
    const newScore = await prisma.score.create({
        data,
    });
    
    const formattedScore = {
        ...newScore,
        createdAt: newScore.createdAt.toISOString(),
        updatedAt: newScore.updatedAt.toISOString(),
    };
    
    return c.json(formattedScore, 201);
});

// スコア更新ルート
const updateScoreRoute = createRoute({
    path: '/{id}',
    method: 'patch',
    tags: ['Scores'],
    summary: 'スコアを更新',
    request: {
        params: idParam,
        body: {
            content: {
                'application/json': {
                    schema: updateScore,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: score,
                },
            },
        },
    },
});

app.openapi(updateScoreRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    
    const updatedScore = await prisma.score.update({
        where: { id },
        data,
    });
    
    const formattedScore = {
        ...updatedScore,
        createdAt: updatedScore.createdAt.toISOString(),
        updatedAt: updatedScore.updatedAt.toISOString(),
    };
    
    return c.json(formattedScore);
});

// スコア削除ルート
const deleteScoreRoute = createRoute({
    path: '/{id}',
    method: 'delete',
    tags: ['Scores'],
    summary: 'スコアを削除',
    request: {
        params: idParam,
    },
    responses: {
        204: {
            description: 'No Content',
        },
    },
});

app.openapi(deleteScoreRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    await prisma.score.delete({
        where: { id },
    });
    
    return c.body(null, 204);
});

export default app;
