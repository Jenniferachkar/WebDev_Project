import process from 'node:process'

import buildApp from './app.js'
import config from './config.js'

async function start() {
  const app = await buildApp()

  try {
    await app.listen({
      port: Number(config.port),
      host: '0.0.0.0',
    })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

start()
