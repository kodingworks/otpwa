import * as Joi from 'joi'
import { JoiSchema } from 'nestjs-joi'

export enum OTPTargetType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE'
}

export class CreateOtpDto {
  @JoiSchema(Joi.string().optional())
  target_type?: string

  @JoiSchema(Joi.string().required())
  recipient: string

  @JoiSchema(Joi.string().optional())
  content?: string

  @JoiSchema(Joi.number().optional())
  expires_in?: number

  @JoiSchema(Joi.number().optional())
  otp_length?: number
}

export class VerifyOtpDto {
  @JoiSchema(Joi.string().required())
  phone: string

  @JoiSchema(Joi.string().required())
  code: string
}

export class OtpDto {
  target: string
  target_type: string
  expires_in: number
  code: string
  created_at: string
  expires_at: number
  SK: string
}
