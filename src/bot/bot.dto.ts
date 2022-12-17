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

export interface ButtonMessageDto {
  text: string
  type: number
}

export enum ButtonMessageTemplateActionType {
  URL = 'URL',
  QUICK_REPLY = 'QUICK_REPLY',
  CALL = 'CALL'
}

export interface TemplateButtonMessageDto {
  text: string
  url?: string
  phone?: string
  action_type: ButtonMessageTemplateActionType
}

export class SendMessageDto {
  @JoiSchema(Joi.string().required())
  phone: string

  @JoiSchema(Joi.string().optional())
  message: string
}

export class SendButtonMessageDto {
  @JoiSchema(Joi.string().required())
  phone: string

  @JoiSchema(Joi.string().optional())
  text?: string

  @JoiSchema(Joi.string().optional())
  footer?: string

  @JoiSchema(Joi.string().optional())
  image_url?: string

  @JoiSchema(
    Joi.when('image_url', {
      is: Joi.string().exist(),
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }).optional()
  )
  caption?: string

  @JoiSchema(
    Joi.array()
      .items(Joi.object({ text: Joi.string(), type: Joi.number() }))
      .required()
  )
  buttons: ButtonMessageDto[]

  @JoiSchema(Joi.number().optional())
  header_type?: number
}

export class SendTemplateButtonMessageDto {
  @JoiSchema(Joi.string().required())
  phone: string

  @JoiSchema(Joi.string().optional())
  text?: string

  @JoiSchema(Joi.string().optional())
  footer?: string

  @JoiSchema(Joi.string().optional())
  image_url?: string

  @JoiSchema(
    Joi.when('image_url', {
      is: Joi.string().exist(),
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }).optional()
  )
  caption?: string

  @JoiSchema(
    Joi.array()
      .items(
        Joi.object({
          action_type: Joi.string().allow(ButtonMessageTemplateActionType.CALL, ButtonMessageTemplateActionType.URL, ButtonMessageTemplateActionType.QUICK_REPLY).required(),
          text: Joi.string().required(),
          url: Joi.when('action_type', { is: ButtonMessageTemplateActionType.URL, then: Joi.string().required(), otherwise: Joi.string().optional() }),
          phone: Joi.when('action_type', { is: ButtonMessageTemplateActionType.CALL, then: Joi.string().required(), otherwise: Joi.string().optional() })
        })
      )
      .required()
  )
  template_buttons: TemplateButtonMessageDto[]
}
