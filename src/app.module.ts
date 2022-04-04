import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BotModule } from './modules/bot/bot.module'

@Module({
  imports: [MongooseModule.forRoot(process.env.DB_URL + process.env.DB_NAME), BotModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
