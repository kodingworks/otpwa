import { Body, Controller, Post } from '@nestjs/common'
import { CreateNewBotDto, SendMessageDto } from './bot.dto'
import { BotService } from './bot.service'

@Controller('whatsapp')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('create')
  async createBot(@Body() data: CreateNewBotDto) {
    return await this.botService.createBot(data)
  }

  @Post('send')
  async sendMessage(@Body() data: SendMessageDto) {
    return await this.botService.sendMessage(data)
  }
}
