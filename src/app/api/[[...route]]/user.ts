import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { prisma } from '../../../lib/prisma';
import { user, createUser, updateUser } from './zod_objects';
import { authenticateCombined, getCurrentUserId } from './auth-helpers';
import { z } from '@hono/zod-openapi';

const app = new OpenAPIHono();

// ユーザー一覧取得ルート
const getUsersRoute = createRoute({
    path: '/',
    method: 'get',
    tags: ['Users'],
    summary: 'ユーザー一覧を取得',
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: user.array(),
                },
            },
        },
    },
});

app.openapi(getUsersRoute, async (c) => {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
    });
    
    const formattedUsers = users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    }));
    
    return c.json(formattedUsers);
});

// ユーザー詳細取得ルート  
const getUserRoute = createRoute({
    path: '/{id}',
    method: 'get',
    tags: ['Users'],
    summary: 'ユーザー詳細を取得',
    request: {
        params: z.object({
            id: z.string().openapi({ example: 'clig1h2k40000qn8l4g4l4g4l', description: 'ユーザーID' }),
        }),
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: user,
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

app.openapi(getUserRoute, async (c) => {
    const { id } = c.req.valid('param');

    const userRecord = await prisma.user.findUnique({
        where: { id },
    });

    if (!userRecord) {
        return c.json({ error: 'ユーザーが見つかりません' }, 404);
    }

    const formattedUser = {
        ...userRecord,
        createdAt: userRecord.createdAt.toISOString(),
        updatedAt: userRecord.updatedAt.toISOString(),
    };

    return c.json(formattedUser, 200);
});

// ユーザー作成ルート
const createUserRoute = createRoute({
    path: '/',
    method: 'post',
    tags: ['Users'],
    summary: 'ユーザーを作成',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createUser,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Created',
            content: {
                'application/json': {
                    schema: user,
                },
            },
        },
    },
});

app.openapi(createUserRoute, async (c) => {
    const data = c.req.valid('json');
    
    // 現在認証されているユーザーIDを取得
    const currentUserId = await getCurrentUserId(c);
    
    const userData = {
        name: data.name,
        email: data.email,
        teamId: data.teamId || null,
        id: currentUserId || undefined, // NextAuth認証の場合は認証されたユーザーIDを使用
    };
    
    const newUser = await prisma.user.create({
        data: userData,
    });

    const formattedUser = {
        ...newUser,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString(),
    };

    return c.json(formattedUser, 201);
});

// ユーザー更新ルート
const updateUserRoute = createRoute({
    path: '/{id}',
    method: 'patch',
    tags: ['Users'],
    summary: 'ユーザーを更新',
    request: {
        params: z.object({
            id: z.string().openapi({ example: 'clig1h2k40000qn8l4g4l4g4l', description: 'ユーザーID' }),
        }),
        body: {
            content: {
                'application/json': {
                    schema: updateUser,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: user,
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

app.openapi(updateUserRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');

    const currentUserId = await getCurrentUserId(c);

    // ユーザーが存在するかチェック
    const existingUser = await prisma.user.findUnique({
        where: { id },
    });

    if (!existingUser) {
        return c.json({ error: 'ユーザーが見つかりません' }, 404);
    }

    // NextAuth認証の場合、自分のユーザー情報のみ更新可能
    if (currentUserId && existingUser.id !== currentUserId) {
        return c.json({ error: 'このユーザーを更新する権限がありません' }, 403);
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data,
        });

        const formattedUser = {
            ...updatedUser,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString(),
        };

        return c.json(formattedUser, 200);
    } catch (error) {
        // 万が一更新失敗時は404でエラー返却
        return c.json({ error: 'ユーザーが見つかりません' }, 404);
    }
});

// ユーザー削除ルート
const deleteUserRoute = createRoute({
    path: '/{id}',
    method: 'delete',
    tags: ['Users'],
    summary: 'ユーザーを削除',
    request: {
        params: z.object({
            id: z.string().openapi({ example: 'clig1h2k40000qn8l4g4l4g4l', description: 'ユーザーID' }),
        }),
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

app.openapi(deleteUserRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    const currentUserId = await getCurrentUserId(c);
    
    // ユーザーが存在するかチェック
    const existingUser = await prisma.user.findUnique({
        where: { id },
    });

    if (!existingUser) {
        return c.json({ error: 'ユーザーが見つかりません' }, 404);
    }

    // NextAuth認証の場合、自分のユーザー情報のみ削除可能
    if (currentUserId && existingUser.id !== currentUserId) {
        return c.json({ error: 'このユーザーを削除する権限がありません' }, 403);
    }
    
    await prisma.user.delete({
        where: { id },
    });
    
    return c.body(null, 204);
});

// 認証ミドルウェアを適用
app.use('*', authenticateCombined);

export default app;