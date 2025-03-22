import { serve, type ServerType } from '@hono/node-server'
import { Hono } from 'hono'
import connectToIoServer from './socket.js';
import type { JwtVariables } from 'hono/jwt';


type Variables = JwtVariables;
const app = new Hono<{ Variables: Variables }>();


app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const server: ServerType = serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

connectToIoServer(server)
