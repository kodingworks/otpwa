import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { JoiPipeModule } from 'nestjs-joi'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BotModule } from './bot/bot.module'
import { OtpModule } from './otp/otp.module'
import { RedisModule } from './redis/redis.module'

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB_URL + process.env.DB_NAME),
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
  providers: [AppService]
})
export class AppModule {}
