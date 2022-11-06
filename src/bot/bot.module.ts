import { Module } from '@nestjs/common'
import { BotController } from './bot.controller'
import { BotService } from './bot.service'
import { WebhookModule } from './webhook/webhook.module'

@Module({
  imports: [WebhookModule],
  controllers: [BotController],
  providers: [BotService],
  exports: [BotModule, BotService]
})
export class BotModule {}
