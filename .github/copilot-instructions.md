# Copilot Instructions for reservation_system

## 概要
このプロジェクトは Next.js 15、Hono（API）、Zod（バリデーション）、Prisma（DB）、Swagger UI（APIドキュメント）を用いた予約システムです。API/DB/フロントが密接に連携しています。

## 主要構成
- `src/app/api/` : Hono で実装された REST API 各種（例: `users`, `reservations`, `scores`）
- `prisma/schema.prisma` : DBスキーマ。変更時は `npx prisma migrate dev` を実行
- `src/lib/prisma.ts` : Prisma クライアント初期化
- `src/lib/schemas.ts` : Zod スキーマ定義
- `src/app/` : Next.js アプリ本体

## 開発ワークフロー
- 依存追加: `npm install`
- DBマイグレーション: `npx prisma migrate dev --name <desc>`
- 開発サーバ: `npm run dev`
- Prisma Studio: `npx prisma studio` でDBをGUI確認
- Swagger UI: `http://localhost:3000/api/doc` でAPI仕様確認

## コーディング規約・パターン
- APIバリデーションはZodで統一
- Prismaの型安全なクエリを利用
- APIエラーハンドリングはHTTPステータス+JSONメッセージで返却
- ディレクトリ/ファイル命名はスネークケース/キャメルケース混在（既存に倣う）
- 型定義や共通ロジックは `src/lib/` や `src/contexts/` に集約

## 例: 予約作成API
- `POST /api/reservations` で予約作成
- バリデーション: `src/lib/schemas.ts` のZodスキーマ
- DB操作: `src/lib/prisma.ts` 経由でPrisma

## 注意点
- スキーマ変更時は必ずマイグレーション&Prisma Client再生成
- API追加時はSwagger UIで動作確認
- DB接続情報は `.env` で管理

## 参考
- `README.md` にAPI例・DBスキーマ記載
- `prisma/` ディレクトリでマイグレーション履歴管理

---
AIエージェントは上記構成・ワークフロー・命名規則を遵守し、既存コード/ドキュメントを参照しながら一貫性ある実装・修正を行うこと。