import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prisma } from '@/lib/prisma';
import {
  CreateUserSchema,
  UpdateUserSchema,
  CreateScoreSchema,
  UpdateScoreSchema,
  CreateReservationSchema,
  UpdateReservationSchema,
  IdParamSchema
} from '@/lib/schemas';
import { z } from 'zod';

const app = new Hono();

// ミドルウェア
app.use('*', cors());
app.use('*', logger());

// エラーハンドラー
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// ユーザー関連のルート
const users = new Hono();

// GET /users - 全ユーザー取得
users.get('/', async (c) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        scores: true,
        reservations: true,
      },
    });

    const formattedUsers = users.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      scores: user.scores?.map(score => ({
        ...score,
        createdAt: score.createdAt.toISOString(),
        updatedAt: score.updatedAt.toISOString(),
      })),
      reservations: user.reservations?.map(reservation => ({
        ...reservation,
        startTime: reservation.startTime.toISOString(),
        endTime: reservation.endTime.toISOString(),
        createdAt: reservation.createdAt.toISOString(),
        updatedAt: reservation.updatedAt.toISOString(),
      })),
    }));

    return c.json(formattedUsers);
  } catch (error) {
    return c.json({ error: 'ユーザーの取得に失敗しました' }, 500);
  }
});

// POST /users - ユーザー作成
users.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = CreateUserSchema.parse(body);
    const { name } = validatedData;

    const user = await prisma.user.create({
      data: { name },
      include: {
        scores: true,
        reservations: true,
      },
    });

    const formattedUser = {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      scores: user.scores?.map(score => ({
        ...score,
        createdAt: score.createdAt.toISOString(),
        updatedAt: score.updatedAt.toISOString(),
      })),
      reservations: user.reservations?.map(reservation => ({
        ...reservation,
        startTime: reservation.startTime.toISOString(),
        endTime: reservation.endTime.toISOString(),
        createdAt: reservation.createdAt.toISOString(),
        updatedAt: reservation.updatedAt.toISOString(),
      })),
    };

    return c.json(formattedUser, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'バリデーションエラー',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      }, 400);
    }
    return c.json({ error: 'ユーザーの作成に失敗しました' }, 500);
  }
});

// GET /users/:id - 特定ユーザー取得
users.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const validatedId = IdParamSchema.parse({ id });

    const user = await prisma.user.findUnique({
      where: { id: validatedId.id },
      include: {
        scores: true,
        reservations: true,
      },
    });

    if (!user) {
      return c.json({ error: 'ユーザーが見つかりません' }, 404);
    }

    const formattedUser = {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      scores: user.scores?.map(score => ({
        ...score,
        createdAt: score.createdAt.toISOString(),
        updatedAt: score.updatedAt.toISOString(),
      })),
      reservations: user.reservations?.map(reservation => ({
        ...reservation,
        startTime: reservation.startTime.toISOString(),
        endTime: reservation.endTime.toISOString(),
        createdAt: reservation.createdAt.toISOString(),
        updatedAt: reservation.updatedAt.toISOString(),
      })),
    };

    return c.json(formattedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'バリデーションエラー',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      }, 400);
    }
    return c.json({ error: 'ユーザーの取得に失敗しました' }, 500);
  }
});

// PUT /users/:id - ユーザー更新
users.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const validatedId = IdParamSchema.parse({ id });
    const validatedData = UpdateUserSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: validatedId.id },
      data: validatedData,
    });

    const formattedUser = {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return c.json(formattedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'バリデーションエラー',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      }, 400);
    }
    if ((error as { code?: string })?.code === 'P2025') {
      return c.json({ error: 'ユーザーが見つかりません' }, 404);
    }
    return c.json({ error: 'ユーザーの更新に失敗しました' }, 500);
  }
});

// DELETE /users/:id - ユーザー削除
users.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const validatedId = IdParamSchema.parse({ id });

    await prisma.user.delete({
      where: { id: validatedId.id },
    });

    return c.json({ message: 'ユーザーを削除しました' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'バリデーションエラー',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      }, 400);
    }
    if ((error as { code?: string })?.code === 'P2025') {
      return c.json({ error: 'ユーザーが見つかりません' }, 404);
    }
    return c.json({ error: 'ユーザーの削除に失敗しました' }, 500);
  }
});

// スコア関連のルート
const scores = new Hono();

// GET /scores - 全スコア取得
scores.get('/', async (c) => {
  try {
    const scores = await prisma.score.findMany({
      include: {
        user: true,
      },
    });

    const formattedScores = scores.map(score => ({
      ...score,
      createdAt: score.createdAt.toISOString(),
      updatedAt: score.updatedAt.toISOString(),
      user: score.user ? {
        ...score.user,
        createdAt: score.user.createdAt.toISOString(),
        updatedAt: score.user.updatedAt.toISOString(),
      } : null,
    }));

    return c.json(formattedScores);
  } catch (error) {
    return c.json({ error: 'スコアの取得に失敗しました' }, 500);
  }
});

// POST /scores - スコア作成
scores.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = CreateScoreSchema.parse(body);
    const { userId, score } = validatedData;

    const scoreRecord = await prisma.score.create({
      data: { userId, score },
      include: {
        user: true,
      },
    });

    const formattedScore = {
      ...scoreRecord,
      createdAt: scoreRecord.createdAt.toISOString(),
      updatedAt: scoreRecord.updatedAt.toISOString(),
      user: scoreRecord.user ? {
        ...scoreRecord.user,
        createdAt: scoreRecord.user.createdAt.toISOString(),
        updatedAt: scoreRecord.user.updatedAt.toISOString(),
      } : null,
    };

    return c.json(formattedScore, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'バリデーションエラー',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      }, 400);
    }
    if ((error as { code?: string })?.code === 'P2003') {
      return c.json({ error: '指定されたユーザーIDが存在しません' }, 400);
    }
    return c.json({ error: 'スコアの作成に失敗しました' }, 500);
  }
});

// GET /scores/:id - 特定スコア取得
scores.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const validatedId = IdParamSchema.parse({ id });

    const score = await prisma.score.findUnique({
      where: { id: validatedId.id },
      include: {
        user: true,
      },
    });

    if (!score) {
      return c.json({ error: 'スコアが見つかりません' }, 404);
    }

    const formattedScore = {
      ...score,
      createdAt: score.createdAt.toISOString(),
      updatedAt: score.updatedAt.toISOString(),
      user: score.user ? {
        ...score.user,
        createdAt: score.user.createdAt.toISOString(),
        updatedAt: score.user.updatedAt.toISOString(),
      } : null,
    };

    return c.json(formattedScore);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'バリデーションエラー',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      }, 400);
    }
    return c.json({ error: 'スコアの取得に失敗しました' }, 500);
  }
});

// PUT /scores/:id - スコア更新
scores.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const validatedId = IdParamSchema.parse({ id });
    const validatedData = UpdateScoreSchema.parse(body);

    const scoreRecord = await prisma.score.update({
      where: { id: validatedId.id },
      data: validatedData,
      include: {
        user: true,
      },
    });

    const formattedScore = {
      ...scoreRecord,
      createdAt: scoreRecord.createdAt.toISOString(),
      updatedAt: scoreRecord.updatedAt.toISOString(),
      user: scoreRecord.user ? {
        ...scoreRecord.user,
        createdAt: scoreRecord.user.createdAt.toISOString(),
        updatedAt: scoreRecord.user.updatedAt.toISOString(),
      } : null,
    };

    return c.json(formattedScore);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'バリデーションエラー',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      }, 400);
    }
    if ((error as { code?: string })?.code === 'P2025') {
      return c.json({ error: 'スコアが見つかりません' }, 404);
    }
    return c.json({ error: 'スコアの更新に失敗しました' }, 500);
  }
});

// DELETE /scores/:id - スコア削除
scores.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const validatedId = IdParamSchema.parse({ id });

    await prisma.score.delete({
      where: { id: validatedId.id },
    });

    return c.json({ message: 'スコアを削除しました' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'バリデーションエラー',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      }, 400);
    }
    if ((error as { code?: string })?.code === 'P2025') {
      return c.json({ error: 'スコアが見つかりません' }, 404);
    }
    return c.json({ error: 'スコアの削除に失敗しました' }, 500);
  }
});

// 予約関連のルート
const reservations = new Hono();

// GET /reservations - 全予約取得
reservations.get('/', async (c) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        user: true,
      },
    });

    const formattedReservations = reservations.map(reservation => ({
      ...reservation,
      startTime: reservation.startTime.toISOString(),
      endTime: reservation.endTime.toISOString(),
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
      user: reservation.user ? {
        ...reservation.user,
        createdAt: reservation.user.createdAt.toISOString(),
        updatedAt: reservation.user.updatedAt.toISOString(),
      } : null,
    }));

    return c.json(formattedReservations);
  } catch (error) {
    return c.json({ error: '予約の取得に失敗しました' }, 500);
  }
});

// POST /reservations - 予約作成
reservations.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = CreateReservationSchema.parse(body);
    const { userId, receiptNumber, numberOfPeople, startTime, endTime } = validatedData;

    // 時刻の妥当性チェック
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (start >= end) {
      return c.json({ error: '終了時刻は開始時刻より後である必要があります' }, 400);
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId,
        receiptNumber,
        numberOfPeople,
        startTime: start,
        endTime: end,
      },
      include: {
        user: true,
      },
    });

    const formattedReservation = {
      ...reservation,
      startTime: reservation.startTime.toISOString(),
      endTime: reservation.endTime.toISOString(),
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
      user: reservation.user ? {
        ...reservation.user,
        createdAt: reservation.user.createdAt.toISOString(),
        updatedAt: reservation.user.updatedAt.toISOString(),
      } : null,
    };

    return c.json(formattedReservation, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'バリデーションエラー',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      }, 400);
    }
    if ((error as { code?: string })?.code === 'P2003') {
      return c.json({ error: '指定されたユーザーIDが存在しません' }, 400);
    }
    return c.json({ error: '予約の作成に失敗しました' }, 500);
  }
});

// GET /reservations/:id - 特定予約取得
reservations.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const validatedId = IdParamSchema.parse({ id });

    const reservation = await prisma.reservation.findUnique({
      where: { id: validatedId.id },
      include: {
        user: true,
      },
    });

    if (!reservation) {
      return c.json({ error: '予約が見つかりません' }, 404);
    }

    const formattedReservation = {
      ...reservation,
      startTime: reservation.startTime.toISOString(),
      endTime: reservation.endTime.toISOString(),
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
      user: reservation.user ? {
        ...reservation.user,
        createdAt: reservation.user.createdAt.toISOString(),
        updatedAt: reservation.user.updatedAt.toISOString(),
      } : null,
    };

    return c.json(formattedReservation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'バリデーションエラー',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      }, 400);
    }
    return c.json({ error: '予約の取得に失敗しました' }, 500);
  }
});

// PUT /reservations/:id - 予約更新
reservations.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const validatedId = IdParamSchema.parse({ id });
    const validatedData = UpdateReservationSchema.parse(body);

    // 部分的な更新データを構築
    const updateData: {
      receiptNumber?: string;
      numberOfPeople?: number;
      startTime?: Date;
      endTime?: Date;
    } = {};
    
    if (validatedData.receiptNumber !== undefined) {
      updateData.receiptNumber = validatedData.receiptNumber;
    }
    if (validatedData.numberOfPeople !== undefined) {
      updateData.numberOfPeople = validatedData.numberOfPeople;
    }
    if (validatedData.startTime !== undefined) {
      updateData.startTime = new Date(validatedData.startTime);
    }
    if (validatedData.endTime !== undefined) {
      updateData.endTime = new Date(validatedData.endTime);
    }

    // 時刻の妥当性チェック（両方の時刻が提供されている場合）
    if (updateData.startTime && updateData.endTime) {
      if (updateData.startTime >= updateData.endTime) {
        return c.json({ error: '終了時刻は開始時刻より後である必要があります' }, 400);
      }
    }

    const reservation = await prisma.reservation.update({
      where: { id: validatedId.id },
      data: updateData,
      include: {
        user: true,
      },
    });

    const formattedReservation = {
      ...reservation,
      startTime: reservation.startTime.toISOString(),
      endTime: reservation.endTime.toISOString(),
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
      user: reservation.user ? {
        ...reservation.user,
        createdAt: reservation.user.createdAt.toISOString(),
        updatedAt: reservation.user.updatedAt.toISOString(),
      } : null,
    };

    return c.json(formattedReservation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'バリデーションエラー',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      }, 400);
    }
    if ((error as { code?: string })?.code === 'P2025') {
      return c.json({ error: '予約が見つかりません' }, 404);
    }
    return c.json({ error: '予約の更新に失敗しました' }, 500);
  }
});

// DELETE /reservations/:id - 予約削除
reservations.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const validatedId = IdParamSchema.parse({ id });

    await prisma.reservation.delete({
      where: { id: validatedId.id },
    });

    return c.json({ message: '予約を削除しました' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'バリデーションエラー',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      }, 400);
    }
    if ((error as { code?: string })?.code === 'P2025') {
      return c.json({ error: '予約が見つかりません' }, 404);
    }
    return c.json({ error: '予約の削除に失敗しました' }, 500);
  }
});

// 特定ユーザーの予約とスコア取得
// GET /users/reservations?userId=1
app.get('/users/reservations', async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'ユーザーIDは必須です' }, 400);
    }

    const UserIdQuerySchema = z.object({
      userId: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()),
    });

    const validatedQuery = UserIdQuerySchema.parse({ userId });

    const reservations = await prisma.reservation.findMany({
      where: {
        userId: validatedQuery.userId,
      },
      include: {
        user: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    const formattedReservations = reservations.map(reservation => ({
      ...reservation,
      startTime: reservation.startTime.toISOString(),
      endTime: reservation.endTime.toISOString(),
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
      user: reservation.user ? {
        ...reservation.user,
        createdAt: reservation.user.createdAt.toISOString(),
        updatedAt: reservation.user.updatedAt.toISOString(),
      } : null,
    }));

    return c.json(formattedReservations);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'バリデーションエラー',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      }, 400);
    }
    return c.json({ error: '予約の取得に失敗しました' }, 500);
  }
});

// GET /users/scores?userId=1
app.get('/users/scores', async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'ユーザーIDは必須です' }, 400);
    }

    const UserIdQuerySchema = z.object({
      userId: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()),
    });

    const validatedQuery = UserIdQuerySchema.parse({ userId });

    const scores = await prisma.score.findMany({
      where: {
        userId: validatedQuery.userId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedScores = scores.map(score => ({
      ...score,
      createdAt: score.createdAt.toISOString(),
      updatedAt: score.updatedAt.toISOString(),
      user: score.user ? {
        ...score.user,
        createdAt: score.user.createdAt.toISOString(),
        updatedAt: score.user.updatedAt.toISOString(),
      } : null,
    }));

    return c.json(formattedScores);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'バリデーションエラー',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      }, 400);
    }
    return c.json({ error: 'スコアの取得に失敗しました' }, 500);
  }
});

// ルートをマウント
app.route('/users', users);
app.route('/scores', scores);
app.route('/reservations', reservations);

// OpenAPI仕様エンドポイント
app.get('/openapi', async (c) => {
  try {
    const { getOpenApiSpec } = await import('@/lib/openapi');
    const spec = getOpenApiSpec();
    return c.json(spec);
  } catch (error) {
    return c.json({ error: 'OpenAPI仕様の取得に失敗しました' }, 500);
  }
});

export default app;
