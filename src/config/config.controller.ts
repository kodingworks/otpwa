import { Get, Body, Controller, Headers, Put, Post } from '@nestjs/common'
import { UpdateWebhookConfigDto } from './config.dto'
import { ConfigService } from './config.service'

@Controller('configs')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Post('test')
  async testWebhook(@Body() data) {
    console.log('Webhook Data : ', data)

    return data
  }

  @Get('webhooks')
  async getWebhookConfig(@Body() data: UpdateWebhookConfigDto, @Headers('Authorization') token: string) {
    return await this.configService.getWebhookConfig(token)
  }

  @Put('webhooks')
  async updateWebhookConfig(@Body() data: UpdateWebhookConfigDto, @Headers('Authorization') token: string) {
    return await this.configService.updateWebhookConfig(data, token)
  }
}
