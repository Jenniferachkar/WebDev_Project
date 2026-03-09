import process from 'node:process'
import Fastify from 'fastify'

const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  production: true,
  test: false,
}
const fastify = Fastify({
  logger: envToLogger[process.env.NODE_ENV] ?? true, // defaults to true if no entry matches in the map
})

fastify.get('/', async (_request, _reply) => {
  return { hello: 'world' }
})

async function start() {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
