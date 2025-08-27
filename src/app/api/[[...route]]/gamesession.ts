import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { prisma } from '../../../lib/prisma';
import { gameSession, createGameSession, updateGameSession, idParam, errorResponse } from './zod_objects';

const app = new OpenAPIHono();

// ゲームセッション一覧取得ルート
const getGameSessionsRoute = createRoute({
    path: '/',
    method: 'get',
    security: [
        {
        ApiKey: []  // 登録したセキュリティスキーム名
        }
    ],
    tags: ['GameSessions'],
    summary: 'ゲームセッション一覧を取得',
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: gameSession.array(),
                },
            },
        },
    },
});

app.openapi(getGameSessionsRoute, async (c) => {
    const gameSessions = await prisma.gameSession.findMany({
        orderBy: { createdAt: 'desc' },
    });
    
    const formattedGameSessions = gameSessions.map((session) => ({
        ...session,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
    }));
    
    return c.json(formattedGameSessions);
});

// ゲームセッション詳細取得ルート
const getGameSessionRoute = createRoute({
    path: '/{id}',
    method: 'get',
    tags: ['GameSessions'],
    summary: 'ゲームセッション詳細を取得',
    request: {
        params: idParam,
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: gameSession,
                },
            },
        },
        404: {
            description: 'ゲームセッションが見つかりません',
            content: {
                'application/json': {
                    schema: errorResponse,
                },
            },
        },
    },
});

app.openapi(getGameSessionRoute, async (c) => {
    const { id } = c.req.valid('param');

    const sessionRecord = await prisma.gameSession.findUnique({
        where: { id },
    });

    if (!sessionRecord) {
        return c.json({ error: 'ゲームセッションが見つかりません', details: undefined }, 404);
    }

    const formattedSession = {
        ...sessionRecord,
        createdAt: sessionRecord.createdAt.toISOString(),
        updatedAt: sessionRecord.updatedAt.toISOString(),
    };

    // Always return 200 with the correct schema, and 404 only with the error schema
    return c.json(formattedSession, 200);
});

// ゲームセッション作成ルート
const createGameSessionRoute = createRoute({
    path: '/',
    method: 'post',
    tags: ['GameSessions'],
    summary: 'ゲームセッションを作成',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createGameSession,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Created',
            content: {
                'application/json': {
                    schema: gameSession,
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

app.openapi(createGameSessionRoute, async (c) => {
    const { name, description } = c.req.valid('json');
    
    try {
        const newSession = await prisma.gameSession.create({
            data: { name, description },
        });
        
        const formattedSession = {
            ...newSession,
            createdAt: newSession.createdAt.toISOString(),
            updatedAt: newSession.updatedAt.toISOString(),
        };
        
        return c.json(formattedSession, 201);
    } catch (error) {
        return c.json({ error: 'ゲームセッションの作成に失敗しました', details: error instanceof Error ? error.message : undefined }, 400);
    }
});

// ゲームセッション更新ルート
const updateGameSessionRoute = createRoute({
    path: '/{id}',
    method: 'patch',
    tags: ['GameSessions'],
    summary: 'ゲームセッションを更新',
    request: {
        params: idParam,
        body: {
            content: {
                'application/json': {
                    schema: updateGameSession,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: gameSession,
                },
            },
        },
        404: {
            description: 'ゲームセッションが見つかりません',
            content: {
                'application/json': {
                    schema: errorResponse,
                },
            },
        },
    },
});

app.openapi(updateGameSessionRoute, async (c) => {
    const { id } = c.req.valid('param');
    const updates = c.req.valid('json');

    try {
        const updatedSession = await prisma.gameSession.update({
            where: { id },
            data: updates,
        });

        const formattedSession = {
            ...updatedSession,
            createdAt: updatedSession.createdAt.toISOString(),
            updatedAt: updatedSession.updatedAt.toISOString(),
        };

        return c.json(formattedSession, 200);
    } catch (error) {
        // If the error is because the record does not exist, return 404 with error schema
        return c.json({ error: 'ゲームセッションが見つかりません', details: error instanceof Error ? error.message : undefined }, 404);
    }
});

// ゲームセッション削除ルート
const deleteGameSessionRoute = createRoute({
    path: '/{id}',
    method: 'delete',
    tags: ['GameSessions'],
    summary: 'ゲームセッションを削除',
    request: {
        params: idParam,
    },
    responses: {
        204: {
            description: 'No Content',
        },
        404: {
            description: 'ゲームセッションが見つかりません',
            content: {
                'application/json': {
                    schema: errorResponse,
                },
            },
        },
    },
});

app.openapi(deleteGameSessionRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    try {
        await prisma.gameSession.delete({
            where: { id },
        });
        
        return c.body(null, 204);
    } catch (error) {
        return c.json({ error: 'ゲームセッションが見つかりません' }, 404);
    }
});

export default app;
