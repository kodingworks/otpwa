import { Module } from '@nestjs/common'
import { BotController } from './bot.controller'
import { BotService } from './bot.service'

@Module({
  imports: [],
  controllers: [BotController],
  providers: [BotService],
  exports: [BotModule, BotService]
})
export class BotModule {}
