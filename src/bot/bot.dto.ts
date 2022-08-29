import * as Joi from 'joi'
import { JoiSchema } from 'nestjs-joi'

export interface CreateNewBotDto {
  name: string
}

export enum BotStatusEnum {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  NEED_SCAN_QR = 'NEED_SCAN_QR'
}

export interface BotSessionDto {
  id: string
  name: string
  phone: string
  api_key: string
  user_id: string
}

export class SendMessageDto {
  @JoiSchema(Joi.string().required())
  id: string

  @JoiSchema(Joi.string().optional())
  message: string

  @JoiSchema(Joi.boolean().optional())
  isGroup?: boolean
}
