import { z } from 'zod';

// User スキーマ
export const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'ユーザー名は必須です'),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1, 'ユーザー名は必須です').optional(),
});

// Score スキーマ
export const ScoreSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  score: z.number().int(),
  user: UserSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateScoreSchema = z.object({
  userId: z.number().int().positive(),
  score: z.number().int(),
});

export const UpdateScoreSchema = z.object({
  score: z.number().int().optional(),
});

// Reservation スキーマ
export const ReservationSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  receiptNumber: z.string().min(1),
  numberOfPeople: z.number().int().positive(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  user: UserSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateReservationSchema = z.object({
  userId: z.number().int().positive(),
  receiptNumber: z.string().min(1, 'レシート番号は必須です'),
  numberOfPeople: z.number().int().positive().min(1, '人数は1人以上である必要があります'),
  startTime: z.string().datetime('有効な開始時刻を指定してください'),
  endTime: z.string().datetime('有効な終了時刻を指定してください'),
});

export const UpdateReservationSchema = z.object({
  receiptNumber: z.string().min(1, 'レシート番号は必須です').optional(),
  numberOfPeople: z.number().int().positive().min(1, '人数は1人以上である必要があります').optional(),
  startTime: z.string().datetime('有効な開始時刻を指定してください').optional(),
  endTime: z.string().datetime('有効な終了時刻を指定してください').optional(),
});

// エラーレスポンススキーマ
export const ErrorSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
});

// パラメータスキーマ
export const IdParamSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()),
});

// 型定義のエクスポート
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export type Score = z.infer<typeof ScoreSchema>;
export type CreateScore = z.infer<typeof CreateScoreSchema>;
export type UpdateScore = z.infer<typeof UpdateScoreSchema>;

export type Reservation = z.infer<typeof ReservationSchema>;
export type CreateReservation = z.infer<typeof CreateReservationSchema>;
export type UpdateReservation = z.infer<typeof UpdateReservationSchema>;

export type ErrorResponse = z.infer<typeof ErrorSchema>;
export type IdParam = z.infer<typeof IdParamSchema>;
