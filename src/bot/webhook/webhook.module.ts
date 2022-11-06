import { Module } from '@nestjs/common'
import { WebhookService } from './webhook.service'

@Module({
  imports: [],
  controllers: [],
  providers: [WebhookService],
  exports: [WebhookModule, WebhookService]
})
export class WebhookModule {}
