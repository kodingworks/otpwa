import { Module } from '@nestjs/common'
import { BotModule } from '../bot/bot.module'
import { RedisModule } from '../redis/redis.module'
import { OtpController } from './otp.controller'
import { OtpService } from './otp.service'

@Module({
  imports: [RedisModule, BotModule],
  controllers: [OtpController],
  providers: [OtpService]
})
export class OtpModule {}
