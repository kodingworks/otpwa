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
  status: string
}

export interface SendMessageDto {
  token: string
  message: string
  phone: string
}
