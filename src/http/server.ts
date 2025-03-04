import chalk from 'chalk'
import { Elysia } from 'elysia'
import pino from 'pino'

import { registerRestaurant } from './routes/register-restaurant'

const logger = pino({
  enabled: true,
})

const app = new Elysia().decorate('logger', logger).use(registerRestaurant)

app.listen(3333, () => {
  console.log(chalk.green('🚀 HTTP Server running on port 3333!'))
})
