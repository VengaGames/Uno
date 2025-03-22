import { serve, type ServerType } from '@hono/node-server'
import { Hono } from 'hono'
import connectToIoServer from './socket.js';

const app = new Hono()

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
