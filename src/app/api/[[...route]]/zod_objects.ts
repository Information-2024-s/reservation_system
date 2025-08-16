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

// Score Zod Object
export const score = z.object({
    id: z.number().int().positive().openapi({ example: 1, description: 'スコアID' }),
    teamId: z.number().int().positive().openapi({ example: 1, description: 'チームID' }),
    score: z.number().int().openapi({ example: 100, description: 'スコア' }),
    createdAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z', description: '作成日' }),
    updatedAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z', description: '更新日' }),
});

export const createScore = z.object({
    teamId: z.number().int().positive().openapi({ example: 1, description: 'チームID' }),
    score: z.number().int().openapi({ example: 100, description: 'スコア' }),
});

export const updateScore = z.object({
    score: z.number().int().optional().openapi({ example: 95, description: 'スコア' }),
});

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
