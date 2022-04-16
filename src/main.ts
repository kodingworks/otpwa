// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { ForbiddenFilter } from './shared/filter/forbidden.filter'
import { HttpExceptionFilter } from './shared/filter/http-exception.filter'
import { UnauthorizedFilter } from './shared/filter/unauthorized.filter'
import { ValidationFilter } from './shared/filter/validation.filter'
// import * as Sentry from '@sentry/node'

async function bootstrap() {
  // Sentry.init()
  const app = await NestFactory.create(AppModule)

  app.enableCors()

  app.use(helmet())
  app.setGlobalPrefix('api')

  app.useGlobalFilters(new HttpExceptionFilter(), new ValidationFilter(), new UnauthorizedFilter(), new ForbiddenFilter())

  const PORT = process.env.PORT || 3000
  await app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
  })
}
bootstrap()
