# 予約システム

このプロジェクトは、Next.js、Hono、Zod、Prisma、Tailwind CSSを使用した予約システムです。API、データベース、フロントエンドが密接に連携しています。

## プロジェクト構成

- `src/app/tailwind-test/page.tsx`: Tailwind CSSが適用されているかを確認するためのテスト用ページ。
- `src/lib/prisma.ts`: Prismaクライアントの初期化とデータベース接続の管理。
- `src/lib/schemas.ts`: Zodを使用したAPIのバリデーションスキーマの定義。
- `prisma/schema.prisma`: データベーススキーマの定義。Prismaマイグレーションに使用。
- `tsconfig.json`: TypeScriptのコンパイラオプションの設定。
- `package.json`: プロジェクトの依存関係やスクリプトの設定。

## 開発ワークフロー

1. 依存関係の追加: `npm install`
2. データベースマイグレーション: `npx prisma migrate dev --name <desc>`
3. 開発サーバの起動: `npm run dev`
4. Prisma Studioでのデータベース確認: `npx prisma studio`
5. Swagger UIでのAPI仕様確認: `http://localhost:3000/api/doc`

## 使用方法

1. プロジェクトをクローンします。
2. 必要な依存関係をインストールします。
3. データベースを設定し、マイグレーションを実行します。
4. 開発サーバを起動し、ブラウザでアプリケーションにアクセスします。

## 注意事項

- スキーマ変更時は必ずマイグレーションを行い、Prisma Clientを再生成してください。
- API追加時はSwagger UIで動作確認を行ってください。
- データベース接続情報は`.env`ファイルで管理します。