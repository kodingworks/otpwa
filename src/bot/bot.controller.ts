import { Body, Controller, Get, Headers, Post, Req } from '@nestjs/common'
import { Request } from 'express'
import { CreateNewBotDto, SendMessageDto } from './bot.dto'
import { BotService } from './bot.service'

@Controller('whatsapp')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('send')
  async sendMessage(@Body() data: SendMessageDto, @Headers('Authorization') token: string) {
    return await this.botService.sendMessage(data, token)
  }

  @Get('qr')
  async getQRImage(@Req() req: Request, @Headers('Authorization') token: string) {
    return await this.botService.getQRImage(req, token)
  }

  @Get('status')
  async getConnectionStatus(@Headers('Authorization') token: string) {
    return await this.botService.getConnectionStatus(token)
  }
}
