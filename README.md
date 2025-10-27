# 予約システム API

このプロジェクトは、Hono + Zod + Swagger UI を使用した予約システムのAPIです。

## 技術スタック

- **フレームワーク**: Next.js 15
- **API**: Hono with OpenAPI
- **バリデーション**: Zod
- **データベース**: PostgreSQL with Prisma
- **ドキュメント**: Swagger UI

## セットアップ

1. 依存関係のインストール

```bash
npm install
```

2. 環境変数の設定
   `.env`ファイルを作成し、以下の内容を追加してください：

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"
LINE_CHANNEL_ACCESS_TOKEN="your-channel-access-token"
LINE_CHANNEL_SECRET="your-channel-secret"
```

3. データベースのマイグレーション

```bash
npx prisma migrate dev
```

4. データベースへのシード（初期データ投入）

```bash
npx prisma db seed
```

5. 開発サーバーの起動

```bash
npm run dev
```

## API ドキュメント

APIドキュメントはSwagger UIで確認できます：

**Swagger UI**: http://localhost:3000/api/doc

詳細なAPI仕様、エンドポイント、リクエスト/レスポンス例はSwagger UIをご参照ください。

## データベース管理

### スキーマ更新
Prismaスキーマを更新した場合：

```bash
npx prisma migrate dev --name describe_your_changes
```

### Prisma Studio
データベースをGUIで確認：

```bash
npx prisma studio
```

### シードデータの管理

データベースに初期データを投入するためのシードコマンドが用意されています。

#### 全データをシード（通常）
```bash
npx prisma db seed
```

#### 個別操作（詳細なコントロールが必要な場合）

##### TimeSlotのみシード
```bash
npx tsx prisma/seed.ts seed:timeslots
```

##### スコアデータのみシード
```bash
npx tsx prisma/seed.ts seed:scores
```

##### 全データをシード
```bash
npx tsx prisma/seed.ts seed:all
```

#### データのリセット

##### 全テーブルをリセット
```bash
npx tsx prisma/seed.ts reset:all
```

##### TimeSlots（とReservations）をリセット
```bash
npx tsx prisma/seed.ts reset:timeslots
```

##### Reservationsのみリセット
```bash
npx tsx prisma/seed.ts reset:reservations
```

##### TeamScores（とPlayerScores）をリセット
```bash
npx tsx prisma/seed.ts reset:teamscores
```

##### PlayerScoresのみリセット
```bash
npx tsx prisma/seed.ts reset:playerscores
```

##### TmpScoresをリセット
```bash
npx tsx prisma/seed.ts reset:tmpscores
```

#### ヘルプ
利用可能なコマンド一覧を表示：
```bash
npx tsx prisma/seed.ts help
```

## ランキングページ（ディスプレイ常時表示用）

### 機能

- **キャッシュ無効化**: ページとAPIリクエストのキャッシュを無効化し、常に最新データを表示
- **自動更新**: 定期的にデータを再取得して最新のランキングを反映
- **自動タブ切り替え**: チーム人数別のタブを自動で切り替え可能
- **リアルタイム性**: ディスプレイに表示しながら最新のスコアを反映

### クエリパラメータ

以下のクエリパラメータで動作をカスタマイズできます：

| パラメータ | デフォルト | 説明 |
|-----------|-----------|------|
| `auto` | `false` | `true`に設定すると自動タブ切り替えを有効化 |
| `interval` | `10` | 自動タブ切り替えの間隔(秒) |
| `refresh` | `30` | データ自動更新の間隔(秒) |

### 使用例

#### 基本的な表示
```
http://localhost:3000/ranking
```

#### ディスプレイ常時表示用（推奨設定）
```
http://localhost:3000/ranking?auto=true&interval=15&refresh=30
```
- 15秒ごとにタブを自動切り替え
- 30秒ごとにデータを自動更新

#### 高頻度更新（コンテスト中）
```
http://localhost:3000/ranking?auto=true&interval=10&refresh=10
```
- 10秒ごとにタブを自動切り替え
- 10秒ごとにデータを自動更新

### 注意事項

- ブラウザのキャッシュも無効化されているため、常に最新のデータが表示されます
- `refresh`パラメータを小さくしすぎるとサーバー負荷が高くなる可能性があります
- ディスプレイ表示用には全画面表示モード（F11）の使用を推奨します

## エラーハンドリング

すべての API エンドポイントは適切な HTTP ステータスコードとエラーメッセージを返します：

- `200`: 成功
- `201`: 作成成功
- `400`: バリデーションエラー
- `404`: リソースが見つかりません
- `500`: サーバーエラー

## ライブラリクレジット

このプロジェクトは以下のオープンソースライブラリを使用しています：

### プロダクションライブラリ
- **[Next.js](https://nextjs.org/)** - React フレームワーク
- **[Hono](https://hono.dev/)** - 軽量で高速なWebフレームワーク
- **[Zod](https://zod.dev/)** - TypeScript ファーストなスキーマバリデーション
- **[Prisma](https://www.prisma.io/)** - 次世代のTypeScript ORM
- **[NextAuth.js](https://next-auth.js.org/)** - Next.js 認証ライブラリ
- **[React](https://reactjs.org/)** - ユーザーインターフェース構築ライブラリ
- **[LINE LIFF](https://developers.line.biz/ja/docs/liff/)** - LINE フロントエンドフレームワーク

### APIドキュメント
- **[@hono/swagger-ui](https://github.com/honojs/middleware/tree/main/packages/swagger-ui)** - Swagger UI ミドルウェア
- **[@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)** - Zod と OpenAPI の統合

### 開発ツール
- **[TypeScript](https://www.typescriptlang.org/)** - 型安全なJavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - ユーティリティファーストCSSフレームワーク
- **[ESLint](https://eslint.org/)** - JavaScript/TypeScript リンター
- **[Prisma ERD Generator](https://github.com/keonik/prisma-erd-generator)** - Prismaスキーマから図を生成
- **[Mermaid CLI](https://mermaid.js.org/)** - 図表生成ツール

これらのライブラリの開発者・コントリビューターの皆様に感謝
