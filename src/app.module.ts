import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { JoiPipeModule } from 'nestjs-joi'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BotModule } from './bot/bot.module'
import { NotificationService } from './notification/notification.service'
import { OtpModule } from './otp/otp.module'
import { RedisModule } from './redis/redis.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { BullModule } from '@nestjs/bull'
import { ConfigModule } from './config/config.module'

const isRedisVariabelExists = process?.env?.REDIS_PORT && process?.env?.REDIS_HOST
const queueModule = isRedisVariabelExists
  ? [
      BullModule.forRoot({
        redis: {
          host: process?.env?.REDIS_HOST,
          port: process?.env?.REDIS_PORT
        }
      })
    ]
  : []

@Module({
  imports: [
    ...queueModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule,
    BotModule,
    OtpModule,
    RedisModule,
    JoiPipeModule.forRoot({
      pipeOpts: {
        defaultValidationOptions: {
          abortEarly: true
        }
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService, NotificationService]
})
export class AppModule {}
