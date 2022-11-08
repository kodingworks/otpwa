import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { WebhookService } from './webhook.service'

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [WebhookService],
  exports: [WebhookModule, WebhookService]
})
export class WebhookModule {}
