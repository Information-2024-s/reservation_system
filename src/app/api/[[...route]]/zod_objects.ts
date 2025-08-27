import { z } from '@hono/zod-openapi';

// Team Zod Object
export const team = z.object({
    id: z.number().int().positive().openapi({ example: 1, description: 'チームID' }),
    name: z.string().openapi({ example: 'Team Alpha', description: 'チーム名' }),
    headcount: z.number().int().positive().openapi({ example: 5, description: '人数' }),
    createdAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z', description: '作成日' }),
    updatedAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z', description: '更新日' }),
});

export const createTeam = z.object({
    name: z.string().min(1).openapi({ example: 'Team Alpha', description: 'チーム名' }),
    headcount: z.number().int().positive().openapi({ example: 5, description: '人数' }),
});

export const updateTeam = z.object({
    name: z.string().min(1).optional().openapi({ example: 'Team Beta', description: 'チーム名' }),
    headcount: z.number().int().positive().optional().openapi({ example: 6, description: '人数' }),
});

// User Zod Object
export const user = z.object({
    id: z.number().int().positive().openapi({ example: 1, description: 'ユーザーID' }),
    name: z.string().openapi({ example: 'John Doe', description: 'ユーザー名' }),
    teamId: z.number().int().positive().openapi({ example: 1, description: 'チームID' }),
    createdAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z', description: '作成日' }),
    updatedAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z', description: '更新日' }),
});

export const createUser = z.object({
    name: z.string().min(1).openapi({ example: 'John Doe', description: 'ユーザー名' }),
    teamId: z.number().int().positive().openapi({ example: 1, description: 'チームID' }),
});

export const updateUser = z.object({
    name: z.string().min(1).optional().openapi({ example: 'Jane Doe', description: 'ユーザー名' }),
    teamId: z.number().int().positive().optional().openapi({ example: 2, description: 'チームID' }),
});

// GameSession Zod Object
export const gameSession = z.object({
    id: z.number().int().positive().openapi({ example: 1, description: 'ゲームセッションID' }),
    name: z.string().openapi({ example: '第1回大会', description: 'セッション名' }),
    description: z.string().nullable().openapi({ example: '年末大会', description: 'セッション説明' }),
    createdAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z', description: '作成日' }),
    updatedAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z', description: '更新日' }),
});

export const createGameSession = z.object({
    name: z.string().min(1).openapi({ example: '第1回大会', description: 'セッション名' }),
    description: z.string().optional().openapi({ example: '年末大会', description: 'セッション説明' }),
});

export const updateGameSession = z.object({
    name: z.string().min(1).optional().openapi({ example: '第2回大会', description: 'セッション名' }),
    description: z.string().optional().openapi({ example: '春の大会', description: 'セッション説明' }),
});

// TeamScore Zod Object (updated from Score)
export const teamScore = z.object({
    id: z.number().int().positive().openapi({ example: 1, description: 'チームスコアID' }),
    teamId: z.number().int().positive().openapi({ example: 1, description: 'チームID' }),
    score: z.number().int().openapi({ example: 100, description: 'スコア' }),
    gameSessionId: z.number().int().positive().nullable().openapi({ example: 1, description: 'ゲームセッションID' }),
    createdAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z', description: '作成日' }),
    updatedAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z', description: '更新日' }),
});

export const createTeamScore = z.object({
    teamId: z.number().int().positive().openapi({ example: 1, description: 'チームID' }),
    score: z.number().int().openapi({ example: 100, description: 'スコア' }),
    gameSessionId: z.number().int().positive().optional().openapi({ example: 1, description: 'ゲームセッションID' }),
});

export const updateTeamScore = z.object({
    score: z.number().int().optional().openapi({ example: 95, description: 'スコア' }),
    gameSessionId: z.number().int().positive().optional().openapi({ example: 2, description: 'ゲームセッションID' }),
});

// UserScore Zod Object
export const userScore = z.object({
    id: z.number().int().positive().openapi({ example: 1, description: 'ユーザースコアID' }),
    userId: z.number().int().positive().openapi({ example: 1, description: 'ユーザーID' }),
    score: z.number().int().openapi({ example: 25, description: 'スコア' }),
    gameSessionId: z.number().int().positive().nullable().openapi({ example: 1, description: 'ゲームセッションID' }),
    createdAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z', description: '作成日' }),
    updatedAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z', description: '更新日' }),
});

export const createUserScore = z.object({
    userId: z.number().int().positive().openapi({ example: 1, description: 'ユーザーID' }),
    score: z.number().int().openapi({ example: 25, description: 'スコア' }),
    gameSessionId: z.number().int().positive().optional().openapi({ example: 1, description: 'ゲームセッションID' }),
});

export const updateUserScore = z.object({
    score: z.number().int().optional().openapi({ example: 30, description: 'スコア' }),
    gameSessionId: z.number().int().positive().optional().openapi({ example: 2, description: 'ゲームセッションID' }),
});

// Legacy Score for backward compatibility
export const score = teamScore;
export const createScore = createTeamScore;
export const updateScore = updateTeamScore;

// Reservation Zod Object
export const reservation = z.object({
    id: z.number().int().positive().openapi({ example: 1, description: '予約ID' }),
    teamId: z.number().int().positive().openapi({ example: 1, description: 'チームID' }),
    receiptNumber: z.string().openapi({ example: 'R-12345', description: 'レシート番号' }),
    numberOfPeople: z.number().int().positive().openapi({ example: 4, description: '人数' }),
    startTime: z.string().openapi({ example: '2023-01-01T18:00:00.000Z', description: '開始時刻' }),
    endTime: z.string().openapi({ example: '2023-01-01T20:00:00.000Z', description: '終了時刻' }),
    createdAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z', description: '作成日' }),
    updatedAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z', description: '更新日' }),
});

export const createReservation = z.object({
    teamId: z.number().int().positive().openapi({ example: 1, description: 'チームID' }),
    receiptNumber: z.string().min(1).openapi({ example: 'R-12345', description: 'レシート番号' }),
    numberOfPeople: z.number().int().positive().min(1).openapi({ example: 4, description: '人数' }),
    startTime: z.string().openapi({ example: '2023-01-01T18:00:00.000Z', description: '開始時刻' }),
    endTime: z.string().openapi({ example: '2023-01-01T20:00:00.000Z', description: '終了時刻' }),
});

export const updateReservation = z.object({
    receiptNumber: z.string().min(1).optional().openapi({ example: 'R-54321', description: 'レシート番号' }),
    numberOfPeople: z.number().int().positive().min(1).optional().openapi({ example: 2, description: '人数' }),
    startTime: z.string().optional().openapi({ example: '2023-01-01T19:00:00.000Z', description: '開始時刻' }),
    endTime: z.string().optional().openapi({ example: '2023-01-01T21:00:00.000Z', description: '終了時刻' }),
});

// Common parameter objects
export const idParam = z.object({
    id: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()).openapi({ example: '1', description: 'ID' }),
});

// Error response object
export const errorResponse = z.object({
    error: z.string().openapi({ example: 'エラーメッセージ', description: 'エラーメッセージ' }),
    details: z.string().optional().openapi({ example: '詳細なエラー情報', description: 'エラーの詳細' }),
});
