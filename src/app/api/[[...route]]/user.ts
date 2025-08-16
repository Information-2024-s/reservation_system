import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { prisma } from '../../../lib/prisma';
import { user, createUser, updateUser, idParam } from './zod_objects';

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
    
    const formattedUsers = users.map(user => ({
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
        params: idParam,
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
    },
});

app.openapi(getUserRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    const userRecord = await prisma.user.findUnique({
        where: { id },
    });
    
    const formattedUser = {
        ...userRecord!,
        createdAt: userRecord!.createdAt.toISOString(),
        updatedAt: userRecord!.updatedAt.toISOString(),
    };
    
    return c.json(formattedUser);
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
    
    const newUser = await prisma.user.create({
        data,
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
        params: idParam,
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
    },
});

app.openapi(updateUserRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    
    const updatedUser = await prisma.user.update({
        where: { id },
        data,
    });
    
    const formattedUser = {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
    };
    
    return c.json(formattedUser);
});

// ユーザー削除ルート
const deleteUserRoute = createRoute({
    path: '/{id}',
    method: 'delete',
    tags: ['Users'],
    summary: 'ユーザーを削除',
    request: {
        params: idParam,
    },
    responses: {
        204: {
            description: 'No Content',
        },
    },
});

app.openapi(deleteUserRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    await prisma.user.delete({
        where: { id },
    });
    
    return c.body(null, 204);
});

export default app;
