import { Body, Controller, Headers, Post } from '@nestjs/common'
import { SendMessageDto } from './bot.dto'
import { BotService } from './bot.service'

@Controller('whatsapp')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('send')
  async sendMessage(@Body() data: SendMessageDto, @Headers('Authorization') token: string) {
    return await this.botService.sendMessage(data, token)
  }
}
