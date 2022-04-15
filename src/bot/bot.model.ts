import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { BotStatusEnum } from './bot.dto'

export type BotDocument = Bot & Document

@Schema({
  timestamps: {
    createdAt: 'created_at_gmt',
    updatedAt: 'updated_at_gmt'
  },
  collection: 'bots'
})
export class Bot extends Document {
  @Prop({})
  name: string
  @Prop({ required: true })
  phone: string
  @Prop({ required: true })
  user_id: string
  @Prop({ default: '' })
  description: string
  @Prop({ default: process.env.TZ })
  tz: string
  @Prop({ required: true })
  api_key: string
  @Prop({ default: BotStatusEnum.NEED_SCAN_QR })
  status: BotStatusEnum
}

export const BotSchema = SchemaFactory.createForClass(Bot)
