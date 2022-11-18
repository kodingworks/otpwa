import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { WebhookService } from './webhook.service'
import { ConfigModule as EnvironmentModule } from '@nestjs/config'

@Module({
  imports: [EnvironmentModule, HttpModule],
  controllers: [],
  providers: [WebhookService],
  exports: [WebhookModule, WebhookService]
})
export class WebhookModule {}
