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
```

3. データベースのマイグレーション

```bash
npx prisma migrate dev
```

4. 開発サーバーの起動

```bash
npm run dev
```

## API ドキュメント

APIドキュメントはSwagger UIで確認できます：

**Swagger UI**: http://localhost:3000/api/doc

## API エンドポイント

### Users (ユーザー管理)

- `GET /api/users` - ユーザー一覧取得
- `GET /api/users/{id}` - ユーザー詳細取得
- `POST /api/users` - ユーザー作成
- `PATCH /api/users/{id}` - ユーザー更新  
- `DELETE /api/users/{id}` - ユーザー削除

### Reservations (予約管理)

- `GET /api/reservations` - 予約一覧取得
- `GET /api/reservations/{id}` - 予約詳細取得
- `POST /api/reservations` - 予約作成
- `PATCH /api/reservations/{id}` - 予約更新
- `DELETE /api/reservations/{id}` - 予約削除

### Scores (スコア管理)

- `GET /api/scores` - スコア一覧取得
- `GET /api/scores/{id}` - スコア詳細取得
- `POST /api/scores` - スコア作成
- `PATCH /api/scores/{id}` - スコア更新
- `DELETE /api/scores/{id}` - スコア削除

## 使用例

### ユーザー作成

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "田中太郎"}'
```

### 予約作成

```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "receiptNumber": "R-12345",
    "numberOfPeople": 4,
    "startTime": "2024-01-01T18:00:00Z",
    "endTime": "2024-01-01T20:00:00Z"
  }'
```

### スコア作成

```bash
curl -X POST http://localhost:3000/api/scores \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "score": 100
  }'
```

## データベーススキーマ

### User (ユーザー)
- `id`: number (主キー)
- `name`: string (ユーザー名)
- `createdAt`: Date (作成日時)
- `updatedAt`: Date (更新日時)

### Reservation (予約)
- `id`: number (主キー)
- `userId`: number (ユーザーID)
- `receiptNumber`: string (レシート番号)
- `numberOfPeople`: number (人数)
- `startTime`: Date (開始時刻)
- `endTime`: Date (終了時刻)
- `createdAt`: Date (作成日時)
- `updatedAt`: Date (更新日時)

### Score (スコア)
- `id`: number (主キー)
- `userId`: number (ユーザーID)
- `score`: number (スコア)
- `createdAt`: Date (作成日時)
- `updatedAt`: Date (更新日時)

## 開発

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
```

#### 特定のユーザー取得

```
GET /api/users/{id}
```

#### ユーザー更新

```
PUT /api/users/{id}
Content-Type: application/json

{
  "name": "田中次郎"
}
```

#### ユーザー削除

```
DELETE /api/users/{id}
```

### スコア管理

#### 全スコア取得

```
GET /api/scores
```

#### スコア作成

```
POST /api/scores
Content-Type: application/json

{
  "userId": 1,
  "score": 85
}
```

#### 特定のスコア取得

```
GET /api/scores/{id}
```

#### スコア更新

```
PUT /api/scores/{id}
Content-Type: application/json

{
  "score": 90
}
```

#### スコア削除

```
DELETE /api/scores/{id}
```

### 予約管理

#### 全予約取得

```
GET /api/reservations
```

#### 予約作成

```
POST /api/reservations
Content-Type: application/json

{
  "userId": 1,
  "receiptNumber": "R001",
  "numberOfPeople": 4,
  "startTime": "2024-01-15T18:00:00Z",
  "endTime": "2024-01-15T20:00:00Z"
}
```

#### 特定の予約取得

```
GET /api/reservations/{id}
```

#### 予約更新

```
PUT /api/reservations/{id}
Content-Type: application/json

{
  "receiptNumber": "R002",
  "numberOfPeople": 6,
  "startTime": "2024-01-15T19:00:00Z",
  "endTime": "2024-01-15T21:00:00Z"
}
```

#### 予約削除

```
DELETE /api/reservations/{id}
```

### 関連データ取得

#### 特定のユーザーのスコア取得

```
GET /api/users/scores?userId={userId}
```

#### 特定のユーザーの予約取得

```
GET /api/users/reservations?userId={userId}
```

## データベーススキーマ

### User

- `id`: 主キー（自動増分）
- `name`: ユーザー名
- `createdAt`: 作成日時
- `updatedAt`: 更新日時

### Score

- `id`: 主キー（自動増分）
- `userId`: ユーザー ID（外部キー）
- `score`: スコア
- `createdAt`: 作成日時
- `updatedAt`: 更新日時

### Reservation

- `id`: 主キー（自動増分）
- `userId`: ユーザー ID（外部キー）
- `receiptNumber`: 受付番号
- `numberOfPeople`: 人数
- `startTime`: 開始時刻
- `endTime`: 終了時刻
- `createdAt`: 作成日時
- `updatedAt`: 更新日時

## エラーハンドリング

すべての API エンドポイントは適切な HTTP ステータスコードとエラーメッセージを返します：

- `200`: 成功
- `201`: 作成成功
- `400`: バリデーションエラー
- `404`: リソースが見つかりません
- `500`: サーバーエラー
