import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { WebhookService } from './webhook.service'
import { ConfigModule as EnvirontmentModule } from '@nestjs/config'

@Module({
  imports: [EnvirontmentModule, HttpModule],
  controllers: [],
  providers: [WebhookService],
  exports: [WebhookModule, WebhookService]
})
export class WebhookModule {}
