import fastify from 'fastify'
import { userRoutes } from './routes/user'
import { mealRoutes } from './routes/meal'
import cookie from '@fastify/cookie'

export const app = fastify()

app.addHook('preHandler', async (request) => {
  console.log(`[${request.method}] ${request.url}`)
})

app.register(cookie)
app.register(userRoutes, {
  prefix: '/user',
})
app.register(mealRoutes, {
  prefix: '/meal',
})
