import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { prisma } from '../../../lib/prisma';
import { team, createTeam, updateTeam, idParam } from './zod_objects';
import { authenticateCombined, getCurrentUserId } from './auth-helpers';
import { z } from 'zod';

const app = new OpenAPIHono();

// 全てのルートに認証を適用
app.use('*', authenticateCombined);

// チーム一覧取得ルート
const getTeamsRoute = createRoute({
    path: '/',
    method: 'get',
    tags: ['Teams'],
    summary: 'チーム一覧を取得',
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: team.array(),
                },
            },
        },
    },
});

app.openapi(getTeamsRoute, async (c) => {
    const teams = await prisma.team.findMany({
        orderBy: { createdAt: 'desc' },
    });

    const formattedTeams = teams.map((team) => ({
        id: team.id,
        name: team.name,
        headcount: team.headcount,
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
    }));

    return c.json(formattedTeams);
});

// チーム詳細取得ルート
const getTeamRoute = createRoute({
    path: '/{id}',
    method: 'get',
    tags: ['Teams'],
    summary: 'チーム詳細を取得',
    request: {
        params: idParam,
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: team,
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

app.openapi(getTeamRoute, async (c) => {
    const { id } = c.req.valid('param');

    const teamRecord = await prisma.team.findUnique({
        where: { id },
    });

    if (!teamRecord) {
        return c.json({ error: 'チームが見つかりません' }, 404);
    }

    const formattedTeam = {
        id: teamRecord.id,
        name: teamRecord.name,
        headcount: teamRecord.headcount,
        createdAt: teamRecord.createdAt.toISOString(),
        updatedAt: teamRecord.updatedAt.toISOString(),
    };

    return c.json(formattedTeam, 200);
});

// チーム作成ルート
const createTeamRoute = createRoute({
    path: '/',
    method: 'post',
    tags: ['Teams'],
    summary: 'チームを作成',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createTeam,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Created',
            content: {
                'application/json': {
                    schema: team,
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

app.openapi(createTeamRoute, async (c) => {
    const data = c.req.valid('json');
    
    // 現在認証されているユーザーIDを取得
    const currentUserId = await getCurrentUserId(c);
    
    const teamData = {
        name: data.name,
        headcount: data.headcount,
    };
    
    const newTeam = await prisma.team.create({
        data: teamData,
    });

    const formattedTeam = {
        id: newTeam.id,
        name: newTeam.name,
        headcount: newTeam.headcount,
        createdAt: newTeam.createdAt.toISOString(),
        updatedAt: newTeam.updatedAt.toISOString(),
    };

    return c.json(formattedTeam, 201);
});

// チーム更新ルート
const updateTeamRoute = createRoute({
    path: '/{id}',
    method: 'patch',
    tags: ['Teams'],
    summary: 'チームを更新',
    request: {
        params: idParam,
        body: {
            content: {
                'application/json': {
                    schema: updateTeam,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: team,
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

app.openapi(updateTeamRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');

    const currentUserId = await getCurrentUserId(c);
    
    // チームが存在するかチェック
    const existingTeam = await prisma.team.findUnique({
        where: { id },
    });

    if (!existingTeam) {
        return c.json({ error: 'チームが見つかりません' }, 404);
    }

    // memberNamesを分離して処理
    const { memberNames, ...teamData } = data;

    const updatedTeam = await prisma.team.update({
        where: { id },
        data: teamData,
    });

    // memberNamesが提供されている場合は更新
    if (memberNames) {
        // 既存のプレイヤーを削除
        await prisma.player.deleteMany({
            where: { team_id: id },
        });

        // 新しいプレイヤーを追加
        if (memberNames.length > 0) {
            await prisma.player.createMany({
                data: memberNames.map((name: string) => ({
                    team_id: id,
                    name,
                })),
            });
        }
    }

    const formattedTeam = {
        id: updatedTeam.id,
        name: updatedTeam.name,
        headcount: updatedTeam.headcount,
        createdAt: updatedTeam.createdAt.toISOString(),
        updatedAt: updatedTeam.updatedAt.toISOString(),
    };

    return c.json(formattedTeam, 200);
});

// チーム削除ルート
const deleteTeamRoute = createRoute({
    path: '/{id}',
    method: 'delete',
    tags: ['Teams'],
    summary: 'チームを削除',
    request: {
        params: idParam,
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

app.openapi(deleteTeamRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    // チームが存在するかチェック
    const existingTeam = await prisma.team.findUnique({
        where: { id },
    });

    if (!existingTeam) {
        return c.json({ error: 'チームが見つかりません' }, 404);
    }
    
    await prisma.team.delete({
        where: { id },
    });
    
    return c.body(null, 204);
});

// 認証ミドルウェアを適用
app.use('*', authenticateCombined);

export default app;
