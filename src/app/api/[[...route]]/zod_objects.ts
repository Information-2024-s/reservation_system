import { z } from "@hono/zod-openapi";


// TeamScore Zod Object (updated from Score)
export const teamScore = z.object({
  id: z
    .number()
    .int()
    .positive()
    .openapi({ example: 1, description: "チームスコアID" }),
  teamName: z.string().openapi({ example: "チームA", description: "チーム名" }),
  headcount: z
    .number()
    .int()
    .positive()
    .openapi({ example: 4, description: "人数" }),
  description: z
    .string()
    .nullable()
    .optional()
    .openapi({ example: "説明テキスト", description: "説明" }),
  score: z.number().int().openapi({ example: 100, description: "スコア" }),
  createdAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "作成日" }),
  updatedAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "更新日" }),
});

export const createTeamScore = z.object({
  teamName: z.string().openapi({ example: "チームA", description: "チーム名" }),
  headcount: z
    .number()
    .int()
    .positive()
    .openapi({ example: 4, description: "人数" }),
  description: z
    .string()
    .nullable()
    .optional()
    .openapi({ example: "説明テキスト", description: "説明" }),
  score: z.number().int().openapi({ example: 100, description: "スコア" }),
});

export const updateTeamScore = z.object({
  teamName: z
    .string()
    .optional()
    .openapi({ example: "チームB", description: "チーム名" }),
  headcount: z
    .number()
    .int()
    .positive()
    .optional()
    .openapi({ example: 5, description: "人数" }),
  description: z
    .string()
    .nullable()
    .optional()
    .openapi({ example: "更新された説明", description: "説明" }),
  score: z
    .number()
    .int()
    .optional()
    .openapi({ example: 95, description: "スコア" }),
});

// UserScore Zod Object (PlayerScore対応)
export const playerScore = z.object({
  id: z
    .number()
    .int()
    .positive()
    .openapi({ example: 1, description: "プレイヤースコアID" }),
  playerName: z
    .string()
    .openapi({ example: "太郎", description: "プレイヤー名" }),
  team_score_id: z
    .number()
    .int()
    .positive()
    .openapi({ example: 1, description: "チームスコアID" }),
  score: z.number().int().openapi({ example: 25, description: "スコア" }),
  createdAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "作成日" }),
  updatedAt: z
    .string()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "更新日" }),
});

export const createPlayerScore = z.object({
  playerName: z
    .string()
    .openapi({ example: "太郎", description: "プレイヤー名" }),
  team_score_id: z
    .number()
    .int()
    .positive()
    .openapi({ example: 1, description: "チームスコアID" }),
  score: z.number().int().openapi({ example: 25, description: "スコア" }),
});

export const updatePlayerScore = z.object({
  playerName: z
    .string()
    .optional()
    .openapi({ example: "次郎", description: "プレイヤー名" }),
  score: z
    .number()
    .int()
    .optional()
    .openapi({ example: 30, description: "スコア" }),
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
  name: z.string().openapi({ example: "山田太郎", description: "予約者名" }),
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

// TimeSlot情報を含む予約レスポンス用スキーマ
export const reservationWithTimeSlot = reservation.extend({
  timeSlot: z
    .object({
      id: z.number().int().positive(),
      slotTime: z.string(),
      slotType: z.enum(["RESERVABLE", "WALK_IN"]),
      status: z.enum(["AVAILABLE", "BOOKED", "UNAVAILABLE"]),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
    .nullable()
    .optional()
    .openapi({
      description: "関連するタイムスロット情報",
    }),
});

export const createReservation = z.object({
  name: z
    .string()
    .min(1, "名前は必須です")
    .openapi({ example: "山田太郎", description: "予約者名" }),
  lineUserId: z.string().optional().openapi({
    example: "clig1h2k40000qn8l4g4l4g4l",
    description: "LINE ユーザーID（NextAuth使用時は自動設定）",
  }),
  timeSlotId: z
    .number()
    .int()
    .positive()
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

// 既存予約にチーム追加用のスキーマ
export const addTeamToReservation = z.object({
  name: z
    .string()
    .min(1)
    .openapi({ example: "チーム名", description: "チーム名" }),
  headcount: z
    .number()
    .int()
    .min(1)
    .max(10)
    .openapi({ example: 2, description: "メンバー数（1-10人）" }),
  memberNames: z
    .array(z.string().min(1))
    .min(1)
    .max(10)
    .openapi({
      example: ["太郎", "花子"],
      description: "メンバー名リスト",
    }),
});

// TimeSlot Zod Object
export const slotType = z
  .enum(["RESERVABLE", "WALK_IN"])
  .openapi({ example: "RESERVABLE", description: "枠の種類" });
export const slotStatus = z
  .enum(["AVAILABLE", "BOOKED", "UNAVAILABLE"])
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

// TmpScore Zod Object
export const tmpScore = z.object({
  id: z.number().int().positive().openapi({ example: 1, description: "ID" }),
  stage: z
    .enum(["First", "Second", "Third"])
    .openapi({ example: "First", description: "ステージ" }),
  score: z
    .number()
    .int()
    .nonnegative()
    .openapi({ example: 12500, description: "スコア" }),
  createdAt: z
    .string()
    .datetime()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "作成日" }),
  updatedAt: z
    .string()
    .datetime()
    .openapi({ example: "2023-01-01T00:00:00.000Z", description: "更新日" }),
});

export const createTmpScore = z.object({
  id: z.number().int().positive().openapi({ example: 1, description: "ID" }),
  stage: z
    .enum(["First", "Second", "Third"])
    .openapi({ example: "First", description: "ステージ" }),
  score: z
    .number()
    .int()
    .nonnegative()
    .openapi({ example: 12500, description: "スコア" }),
});

export const updateTmpScore = z.object({
  score: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .openapi({ example: 15000, description: "スコア" }),
});
