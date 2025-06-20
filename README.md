# 予約システム API

このプロジェクトは、Prisma を使用した予約システムの API です。

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

## API エンドポイント

### ユーザー管理

#### 全ユーザー取得

```
GET /api/users
```

#### ユーザー作成

```
POST /api/users
Content-Type: application/json

{
  "name": "田中太郎"
}
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
