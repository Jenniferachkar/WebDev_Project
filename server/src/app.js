import cors from '@fastify/cors'
import Fastify from 'fastify'
import config from './config.js'
import envToLogger from './logger.js'
import ordersRoutes from './orders/orders-routes.js'
import authPlugin from './plugins/auth.js'
import mongoosePlugin from './plugins/mongoose.js'
import productsRoutes from './products/products-routes.js'
import rootRoutes from './rootRoute.js'
import authRoutes from './users/auth-routes.js'
import usersRoutes from './users/users-routes.js'

async function buildApp() {
  const fastify = Fastify({
    logger: envToLogger[config.env] ?? true,
  })

  await fastify.register(cors, {
    origin: config.clientUrl,
    credentials: true,
  })

  await fastify.register(authPlugin)
  await fastify.register(mongoosePlugin)

  fastify.register(authRoutes, { prefix: '/auth' })
  fastify.register(usersRoutes, { prefix: '/users' })
  fastify.register(productsRoutes, { prefix: '/products' })
  fastify.register(ordersRoutes, { prefix: '/orders' })
  fastify.register(rootRoutes)

  return fastify
}

export default buildApp
