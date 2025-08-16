import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { prisma } from '../../../lib/prisma';
import { team, createTeam, updateTeam, idParam } from './zod_objects';

const app = new OpenAPIHono();

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
        ...team,
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
    },
});

app.openapi(getTeamRoute, async (c) => {
    const { id } = c.req.valid('param');

    const teamRecord = await prisma.team.findUnique({
        where: { id },
    });

    const formattedTeam = {
        ...teamRecord!,
        createdAt: teamRecord!.createdAt.toISOString(),
        updatedAt: teamRecord!.updatedAt.toISOString(),
    };

    return c.json(formattedTeam);
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
    },
});

app.openapi(createTeamRoute, async (c) => {
    const data = c.req.valid('json');

    const newTeam = await prisma.team.create({
        data,
    });

    const formattedTeam = {
        ...newTeam,
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
    },
});

app.openapi(updateTeamRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');

    const updatedTeam = await prisma.team.update({
        where: { id },
        data,
    });

    const formattedTeam = {
        ...updatedTeam,
        createdAt: updatedTeam.createdAt.toISOString(),
        updatedAt: updatedTeam.updatedAt.toISOString(),
    };

    return c.json(formattedTeam);
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
    },
});

app.openapi(deleteTeamRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    await prisma.team.delete({
        where: { id },
    });
    
    return c.body(null, 204);
});

export default app;
