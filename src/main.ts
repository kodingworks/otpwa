// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import { AppModule } from './app.module'
// import * as Sentry from '@sentry/node'

async function bootstrap() {
  // Sentry.init()
  const app = await NestFactory.create(AppModule)
  app.use(helmet())
  await app.listen(3000)
}
bootstrap()
