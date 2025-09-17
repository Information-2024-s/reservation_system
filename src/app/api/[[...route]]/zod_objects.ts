import { z } from "@hono/zod-openapi";

// Team Zod Object
export const team = z.object({
  id: z
    .number()
    .int()
    .positive()
    .openapi({ example: 1, description: "チームID" }),
  name: z.string().openapi({ example: "Team Alpha", description: "チーム名" }),
  headcount: z
    .number()
    .int()
    .positive()
    .openapi({ example: 5, description: "人数" }),
  lineUserId: z.string().nullable().openapi({
    example: "clig1h2k40000qn8l4g4l4g4l",
    description: "LINE ユーザーID",
  }),
  createdAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "作成日" }),
  updatedAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "更新日" }),
});

export const createTeam = z.object({
  name: z
    .string()
    .min(1)
    .openapi({ example: "Team Alpha", description: "チーム名" }),
  headcount: z
    .number()
    .int()
    .positive()
    .openapi({ example: 5, description: "人数" }),
  lineUserId: z.string().optional().openapi({
    example: "clig1h2k40000qn8l4g4l4g4l",
    description: "LINE ユーザーID（NextAuth使用時は自動設定）",
  }),
});

export const updateTeam = z.object({
  name: z
    .string()
    .min(1)
    .optional()
    .openapi({ example: "Team Beta", description: "チーム名" }),
  headcount: z
    .number()
    .int()
    .positive()
    .optional()
    .openapi({ example: 6, description: "人数" }),
});

// User Zod Object
export const user = z.object({
  id: z.string().openapi({
    example: "clig1h2k40000qn8l4g4l4g4l",
    description: "ユーザーID",
  }),
  name: z
    .string()
    .nullable()
    .openapi({ example: "John Doe", description: "ユーザー名" }),
  email: z
    .string()
    .nullable()
    .openapi({ example: "john@example.com", description: "メールアドレス" }),
  teamId: z
    .number()
    .int()
    .positive()
    .nullable()
    .openapi({ example: 1, description: "チームID" }),
  createdAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "作成日" }),
  updatedAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "更新日" }),
});

export const createUser = z.object({
  name: z
    .string()
    .min(1)
    .openapi({ example: "John Doe", description: "ユーザー名" }),
  email: z
    .string()
    .email()
    .openapi({ example: "john@example.com", description: "メールアドレス" }),
  teamId: z
    .number()
    .int()
    .positive()
    .optional()
    .openapi({ example: 1, description: "チームID" }),
});

export const updateUser = z.object({
  name: z
    .string()
    .min(1)
    .optional()
    .openapi({ example: "Jane Doe", description: "ユーザー名" }),
  teamId: z
    .number()
    .int()
    .positive()
    .optional()
    .openapi({ example: 2, description: "チームID" }),
});

// GameSession Zod Object
export const gameSession = z.object({
  id: z
    .number()
    .int()
    .positive()
    .openapi({ example: 1, description: "ゲームセッションID" }),
  name: z
    .string()
    .openapi({ example: "第1回大会", description: "セッション名" }),
  description: z
    .string()
    .nullable()
    .openapi({ example: "年末大会", description: "セッション説明" }),
  createdAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "作成日" }),
  updatedAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "更新日" }),
});

export const createGameSession = z.object({
  name: z
    .string()
    .min(1)
    .openapi({ example: "第1回大会", description: "セッション名" }),
  description: z
    .string()
    .optional()
    .openapi({ example: "年末大会", description: "セッション説明" }),
});

export const updateGameSession = z.object({
  name: z
    .string()
    .min(1)
    .optional()
    .openapi({ example: "第2回大会", description: "セッション名" }),
  description: z
    .string()
    .optional()
    .openapi({ example: "春の大会", description: "セッション説明" }),
});

// TeamScore Zod Object (updated from Score)
export const teamScore = z.object({
  id: z
    .number()
    .int()
    .positive()
    .openapi({ example: 1, description: "チームスコアID" }),
  teamId: z
    .number()
    .int()
    .positive()
    .openapi({ example: 1, description: "チームID" }),
  score: z.number().int().openapi({ example: 100, description: "スコア" }),
  gameSessionId: z
    .number()
    .int()
    .positive()
    .nullable()
    .openapi({ example: 1, description: "ゲームセッションID" }),
  createdAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "作成日" }),
  updatedAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "更新日" }),
});

export const createTeamScore = z.object({
  teamId: z
    .number()
    .int()
    .positive()
    .openapi({ example: 1, description: "チームID" }),
  score: z.number().int().openapi({ example: 100, description: "スコア" }),
  gameSessionId: z
    .number()
    .int()
    .positive()
    .optional()
    .openapi({ example: 1, description: "ゲームセッションID" }),
});

export const updateTeamScore = z.object({
  score: z
    .number()
    .int()
    .optional()
    .openapi({ example: 95, description: "スコア" }),
  gameSessionId: z
    .number()
    .int()
    .positive()
    .optional()
    .openapi({ example: 2, description: "ゲームセッションID" }),
});

// UserScore Zod Object
export const userScore = z.object({
  id: z
    .number()
    .int()
    .positive()
    .openapi({ example: 1, description: "ユーザースコアID" }),
  userId: z.string().openapi({
    example: "clig1h2k40000qn8l4g4l4g4l",
    description: "ユーザーID",
  }),
  score: z.number().int().openapi({ example: 25, description: "スコア" }),
  gameSessionId: z
    .number()
    .int()
    .positive()
    .nullable()
    .openapi({ example: 1, description: "ゲームセッションID" }),
  createdAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "作成日" }),
  updatedAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "更新日" }),
});

export const createUserScore = z.object({
  userId: z.string().openapi({
    example: "clig1h2k40000qn8l4g4l4g4l",
    description: "ユーザーID",
  }),
  score: z.number().int().openapi({ example: 25, description: "スコア" }),
  gameSessionId: z
    .number()
    .int()
    .positive()
    .optional()
    .openapi({ example: 1, description: "ゲームセッションID" }),
});

export const updateUserScore = z.object({
  score: z
    .number()
    .int()
    .optional()
    .openapi({ example: 30, description: "スコア" }),
  gameSessionId: z
    .number()
    .int()
    .positive()
    .optional()
    .openapi({ example: 2, description: "ゲームセッションID" }),
});

// Legacy Score for backward compatibility
export const score = teamScore;
export const createScore = createTeamScore;
export const updateScore = updateTeamScore;

// Reservation Zod Object
export const reservation = z.object({
  id: z
    .number()
    .int()
    .positive()
    .openapi({ example: 1, description: "予約ID" }),
  teamId: z
    .number()
    .int()
    .positive()
    .openapi({ example: 1, description: "チームID" }),
  lineUserId: z.string().nullable().openapi({
    example: "clig1h2k40000qn8l4g4l4g4l",
    description: "LINE ユーザーID",
  }),
  startTime: z
    .string()
    .openapi({ example: "2023-01-01T18:00:00.000Z", description: "開始時刻" }),
  timeSlotId: z
    .number()
    .int()
    .positive()
    .nullable()
    .openapi({ example: 1, description: "タイムスロットID" }),
  createdAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "作成日" }),
  updatedAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "更新日" }),
});

export const createReservation = z.object({
  teamId: z
    .number()
    .int()
    .positive()
    .openapi({ example: 1, description: "チームID" }),
  lineUserId: z.string().optional().openapi({
    example: "clig1h2k40000qn8l4g4l4g4l",
    description: "LINE ユーザーID（NextAuth使用時は自動設定）",
  }),
  startTime: z
    .string()
    .openapi({ example: "2023-01-01T18:00:00.000Z", description: "開始時刻" }),
  timeSlotId: z
    .number()
    .int()
    .positive()
    .optional()
    .openapi({ example: 1, description: "タイムスロットID" }),
});

export const updateReservation = z.object({
  startTime: z
    .string()
    .optional()
    .openapi({ example: "2023-01-01T19:00:00.000Z", description: "開始時刻" }),
  timeSlotId: z
    .number()
    .int()
    .positive()
    .optional()
    .openapi({ example: 1, description: "タイムスロットID" }),
});

// チーム登録付き予約作成用のスキーマ
export const createReservationWithTeam = z.object({
  timeSlotId: z
    .number()
    .int()
    .positive()
    .openapi({ example: 1, description: "タイムスロットID" }),
  teamName: z
    .string()
    .min(1)
    .openapi({ example: "チーム名", description: "チーム名" }),
  memberCount: z
    .number()
    .int()
    .min(1)
    .max(4)
    .openapi({ example: 2, description: "メンバー数（1-4人）" }),
  memberNames: z
    .array(z.string().min(1))
    .min(1)
    .max(4)
    .openapi({
      example: ["たろう", "はなこ"],
      description: "メンバー名リスト（ひらがな）",
    }),
});

// TimeSlot Zod Object
export const slotType = z
  .enum(["RESERVABLE", "WALK_IN"])
  .openapi({ example: "RESERVABLE", description: "枠の種類" });
export const slotStatus = z
  .enum(["AVAILABLE", "BOOKED"])
  .openapi({ example: "AVAILABLE", description: "予約状況" });

export const timeSlot = z.object({
  id: z
    .number()
    .int()
    .positive()
    .openapi({ example: 1, description: "タイムスロットID" }),
  slotTime: z.string().openapi({
    example: "2023-01-01T18:00:00.000Z",
    description: "予約枠の開始時刻",
  }),
  slotType: slotType,
  status: slotStatus,
  createdAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "作成日" }),
  updatedAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "更新日" }),
});

export const createTimeSlot = z.object({
  slotTime: z.string().openapi({
    example: "2023-01-01T18:00:00.000Z",
    description: "予約枠の開始時刻",
  }),
  slotType: slotType,
  status: slotStatus.optional(),
});

export const updateTimeSlot = z.object({
  slotTime: z.string().optional().openapi({
    example: "2023-01-01T19:00:00.000Z",
    description: "予約枠の開始時刻",
  }),
  slotType: slotType.optional(),
  status: slotStatus.optional(),
});

// Common parameter objects
export const idParam = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .openapi({ example: "1", description: "ID" }),
});

// Error response object
export const errorResponse = z.object({
  error: z
    .string()
    .openapi({ example: "エラーメッセージ", description: "エラーメッセージ" }),
  details: z
    .string()
    .optional()
    .openapi({ example: "詳細なエラー情報", description: "エラーの詳細" }),
});
