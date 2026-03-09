import process from 'node:process'

import app from './app.js'
import config from './config.js'

async function start() {
  try {
    await app.listen({ port: config.port })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
