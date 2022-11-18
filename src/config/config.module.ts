import { Module } from '@nestjs/common'
import { ConfigController } from './config.controller'
import { ConfigService } from './config.service'
import { ConfigModule as EnvironmentModule } from '@nestjs/config'
@Module({
  imports: [EnvironmentModule],
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigModule, ConfigService]
})
export class ConfigModule {}
