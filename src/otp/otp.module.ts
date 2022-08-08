import { Module } from '@nestjs/common'
import { NotificationService } from 'src/notification/notification.service'
import { BotModule } from '../bot/bot.module'
import { RedisModule } from '../redis/redis.module'
import { OtpController } from './otp.controller'
import { OtpService } from './otp.service'

@Module({
  imports: [RedisModule, BotModule],
  controllers: [OtpController],
  providers: [OtpService, NotificationService]
})
export class OtpModule {}
