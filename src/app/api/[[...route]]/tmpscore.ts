import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { prisma } from "../../../lib/prisma";
import { tmpScore, createTmpScore, updateTmpScore } from "./zod_objects";
import { authenticateCombined } from "./auth-helpers";
import { z } from "zod";
import { Stage } from "@prisma/client";

const app = new OpenAPIHono();

// POST, PATCH, DELETE のみ認証を適用
app.use("/", async (c, next) => {
  if (c.req.method !== "GET") {
    return authenticateCombined(c, next);
  }
  return next();
});

app.use("/:id/:stage", async (c, next) => {
  if (c.req.method !== "GET") {
    return authenticateCombined(c, next);
  }
  return next();
});

// TmpScore 一覧取得
const getTmpScoresRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["TmpScores"],
  summary: "TmpScore 一覧を取得",
  request: {
    query: z.object({
      stage: z.enum(["First", "Second", "Third"]).optional().openapi({ description: "フィルター: ステージ" }),
      page: z.string().optional().default("1").openapi({ description: "ページ番号" }),
      limit: z.string().optional().default("10").openapi({ description: "1ページあたりの件数" }),
      sortBy: z.enum(["id", "score", "createdAt"]).optional().default("createdAt").openapi({ description: "ソート項目" }),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc").openapi({ description: "ソート順" }),
    }),
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({
            data: tmpScore.array(),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
  },
});

app.openapi(getTmpScoresRoute, async (c) => {
  const { stage, page, limit, sortBy, sortOrder } = c.req.valid("query");
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  const where = stage ? { stage: stage as Stage } : {};
  const orderBy: Record<string, "asc" | "desc"> = {};
  orderBy[sortBy] = sortOrder as "asc" | "desc";
  const total = await prisma.tmpScore.count({ where });
  const data = await prisma.tmpScore.findMany({ where, orderBy, skip, take: limitNum });
  return c.json(
    {
      data: data.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
    200
  );
});

// TmpScore 単件取得
const getTmpScoreRoute = createRoute({
  path: "/:id/:stage",
  method: "get",
  tags: ["TmpScores"],
  summary: "TmpScore を ID とステージで取得",
  request: {
    params: z.object({
      id: z.coerce.number().int().positive().openapi({ example: 1, description: "ID" }),
      stage: z.enum(["First", "Second", "Third"]).openapi({ example: "First", description: "ステージ" }),
    }),
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: tmpScore,
        },
      },
    },
    404: {
      description: "Not Found",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});

app.openapi(getTmpScoreRoute, async (c) => {
  const { id, stage } = c.req.valid("param");
  const data = await prisma.tmpScore.findUnique({
    where: { id_stage: { id, stage: stage as Stage } },
  });
  if (!data) {
    return c.json({ error: "TmpScore が見つかりません" }, 404);
  }
  return c.json(
    {
      ...data,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    },
    200
  );
});

// TmpScore 作成
const createTmpScoreRoute = createRoute({
  path: "/",
  method: "post",
  tags: ["TmpScores"],
  summary: "TmpScore を作成",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createTmpScore,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: {
        "application/json": {
          schema: tmpScore,
        },
      },
    },
    409: {
      description: "Conflict",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});

app.openapi(createTmpScoreRoute, async (c) => {
  const body = c.req.valid("json");
  const existing = await prisma.tmpScore.findUnique({
    where: { id_stage: { id: body.id, stage: body.stage as Stage } },
  });
  if (existing) {
    return c.json(
      { error: "この ID とステージの組み合わせは既に存在します" },
      409
    );
  }
  const data = await prisma.tmpScore.create({
    data: {
      id: body.id,
      stage: body.stage as Stage,
      score: body.score,
    },
  });
  return c.json(
    {
      ...data,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    },
    201
  );
});

// TmpScore 更新
const updateTmpScoreRoute = createRoute({
  path: "/:id/:stage",
  method: "patch",
  tags: ["TmpScores"],
  summary: "TmpScore を更新",
  request: {
    params: z.object({
      id: z.coerce.number().int().positive().openapi({ example: 1, description: "ID" }),
      stage: z.enum(["First", "Second", "Third"]).openapi({ example: "First", description: "ステージ" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateTmpScore,
        },
      },
    },
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: tmpScore,
        },
      },
    },
    404: {
      description: "Not Found",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});

app.openapi(updateTmpScoreRoute, async (c) => {
  const { id, stage } = c.req.valid("param");
  const body = c.req.valid("json");
  const existing = await prisma.tmpScore.findUnique({
    where: { id_stage: { id, stage: stage as Stage } },
  });
  if (!existing) {
    return c.json({ error: "TmpScore が見つかりません" }, 404);
  }
  const data = await prisma.tmpScore.update({
    where: { id_stage: { id, stage: stage as Stage } },
    data: body,
  });
  return c.json(
    {
      ...data,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    },
    200
  );
});

// TmpScore 削除
const deleteTmpScoreRoute = createRoute({
  path: "/:id/:stage",
  method: "delete",
  tags: ["TmpScores"],
  summary: "TmpScore を削除",
  request: {
    params: z.object({
      id: z.coerce.number().int().positive().openapi({ example: 1, description: "ID" }),
      stage: z.enum(["First", "Second", "Third"]).openapi({ example: "First", description: "ステージ" }),
    }),
  },
  responses: {
    204: {
      description: "No Content",
    },
    404: {
      description: "Not Found",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});

app.openapi(deleteTmpScoreRoute, async (c) => {
  const { id, stage } = c.req.valid("param");
  const existing = await prisma.tmpScore.findUnique({
    where: { id_stage: { id, stage: stage as Stage } },
  });
  if (!existing) {
    return c.json({ error: "TmpScore が見つかりません" }, 404);
  }
  await prisma.tmpScore.delete({
    where: { id_stage: { id, stage: stage as Stage } },
  });
  return c.body(null, 204);
});

export default app;
