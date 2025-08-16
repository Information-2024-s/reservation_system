import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import user from './user'
import reservation from './reservation'
import score from './score'

const app = new OpenAPIHono().basePath('/api');

// API routes
app.route("/users", user);
app.route("/reservations", reservation);
app.route("/scores", score);

app.onError((err, c) => {
  return c.json({ error: err.message }, 500)
})

app
  .doc('/specification', {
    openapi: '3.0.0',
    info: {
      title: 'Reservation System API',
      version: '1.0.0',
      description: 'API for managing reservations, users, and scores',
    },
  })
  .get('/doc', swaggerUI({
    url: '/api/specification',
  }));

// routesの型を取り、exportしておく
export type AppType = typeof app

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)
export const PUT = handle(app)

export { app }
