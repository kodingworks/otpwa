import { Body, Controller, Get, Headers, Post, Req } from '@nestjs/common'
import { Request } from 'express'
import { SendButtonMessageDto, SendMessageDto, SendTemplateButtonMessageDto } from './bot.dto'
import { BotService } from './bot.service'

@Controller('whatsapp')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('send')
  async sendMessage(@Body() data: SendMessageDto, @Headers('Authorization') token: string) {
    return await this.botService.sendMessage(data, token)
  }

  @Post('send-buttons')
  async sendButtonMessage(@Body() data: SendButtonMessageDto, @Headers('Authorization') token: string) {
    return await this.botService.sendButtonMesage(data, token)
  }

  @Post('send-template-buttons')
  async sendTemplateButtonMessage(@Body() data: SendTemplateButtonMessageDto, @Headers('Authorization') token: string) {
    return await this.botService.sendTemplateButtonMessage(data, token)
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
