import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BotController } from './bot.controller'
import { Bot, BotSchema } from './bot.model'
import { BotService } from './bot.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: Bot.name, schema: BotSchema }])],
  controllers: [BotController],
  providers: [BotService],
  exports: [BotModule, BotService]
})
export class BotModule {}
