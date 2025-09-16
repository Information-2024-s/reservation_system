import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import team from './team'
import user from './user'
import reservation from './reservation'
import timeslot from './timeslot'
import score from './score'
import gamesession from './gamesession'
import userscore from './userscore'

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




// API routes
app.route("/teams", team);
app.route("/users", user);
app.route("/reservations", reservation);
app.route("/timeslots", timeslot);
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

