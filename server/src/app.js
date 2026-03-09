import Fastify from 'fastify'

import config from './config.js'
import envToLogger from './logger.js'
import authRoutes from './routes/auth.js'
import rootRoutes from './routes/root.js'

const fastify = Fastify({
  logger: envToLogger[config.env] ?? true,
})

fastify.register(authRoutes, { prefix: '/auth' })

fastify.register(rootRoutes)

export default fastify
