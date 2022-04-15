import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BotModule } from './bot/bot.module'
import { OtpModule } from './otp/otp.module'
import { RedisModule } from './redis/redis.module'

@Module({
  imports: [MongooseModule.forRoot(process.env.DB_URL + process.env.DB_NAME), BotModule, OtpModule, RedisModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
