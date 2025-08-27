import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { basicAuth } from 'hono/basic-auth';
import team from './team'
import user from './user'
import reservation from './reservation'
import score from './score'
import gamesession from './gamesession'
import userscore from './userscore'
import { HTTPException } from 'hono/http-exception'


const API_KEY = process.env.API_KEY!
const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME || 'admin'
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || 'password'
const app = new OpenAPIHono().basePath('/api');

// API Key認証スキームを登録
app.openAPIRegistry.registerComponent('securitySchemes', 'ApiKey', {
  type: 'apiKey',
  in: 'header',        // または 'query', 'cookie'
  name: 'X-API-Key'    // ヘッダー名
})

// Basic認証付きの/specificationエンドポイントを作成
app.get('/specification', 
  (c) => {
    const spec = app.getOpenAPIDocument({
      openapi: '3.0.0',
      info: {
        title: 'Reservation System API',
        version: '1.0.0',
        description: 'API for managing reservations, teams, users, game sessions, and scores',
      },
    });
    return c.json(spec);
  }
);

app.get('/doc', 
  swaggerUI({
    url: '/api/specification',
  })
);




app.use('*', async (c, next) => {
  const path = c.req.path
  // /doc と /specification はBasic認証を使用するため、API Key認証をスキップ
  if (path.endsWith('/doc') || path.endsWith('/specification')) {
    await next()
    return
  }
  
  const apiKey = c.req.header('X-API-KEY')
  console.log("API Key:", apiKey)
  if (apiKey !== API_KEY) {
    throw new HTTPException(403, { message: 'Forbidden' })
  }
  await next()
})


// API routes
app.route("/teams", team);
app.route("/users", user);
app.route("/reservations", reservation);
app.route("/scores", score);
app.route("/gamesessions", gamesession);
app.route("/userscores", userscore);
app.onError((err, c) => {
  return c.json({ error: err.message }, 500)
})



// routesの型を取り、exportしておく
export type AppType = typeof app

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)
export const PUT = handle(app)

