import makeWASocket, {
  Chat,
  ConnectionState,
  Contact,
  DisconnectReason,
  GroupMetadata,
  MessageUpsertType,
  MessageUserReceiptUpdate,
  ParticipantAction,
  PresenceData,
  proto,
  useSingleFileAuthState,
  WAMessage,
  WAMessageKey,
  WAMessageUpdate
} from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import { HttpException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import * as colors from 'colors'
import { Request } from 'express'
import * as figlet from 'figlet'
import * as fs from 'fs-extra'
import { resolve } from 'path'
import * as qrcode from 'qrcode'
import { validateToken } from '../shared/helper/token-validator'
import { InternalServerError } from '../shared/provider/error-provider'
import { OkResponse } from '../shared/provider/response-provider'
import { BotStatusEnum, ButtonMessageTemplateActionType, SendButtonMessageDto, SendMessageDto, SendTemplateButtonMessageDto } from './bot.dto'

let sock: any
let status = BotStatusEnum.OFFLINE

const authFileJsonPath = './auth_info_multi.json'
const { state, saveState } = useSingleFileAuthState(authFileJsonPath)

function deleteOldAuthFileOnReconnect() {
  // Delete the auth file if exists
  const isAuthFileExists = fs.existsSync(authFileJsonPath)
  if (isAuthFileExists) {
    fs.unlinkSync(authFileJsonPath)
  }

  return true
}

function connectionUpdateSync(ev: Partial<ConnectionState>) {
  const { connection, qr, lastDisconnect } = ev
  const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut

  if (connection === 'close') {
    console.log('Connection Closed due to ', lastDisconnect.error, ', reconnecting \n')

    // Update Connection Status
    status = BotStatusEnum.OFFLINE
  } else if (connection === 'open') {
    console.log(colors.green(figlet.textSync('Bot Connected', { horizontalLayout: 'full' })))

    // Update Connection Status
    status = BotStatusEnum.ONLINE
  }

  if (qr) {
    // if the 'qr' property is available on 'conn'
    console.info('QR Generated')

    qrcode.toFile(resolve(__dirname, '../../qr', 'qr.png'), qr, {
      width: 500,
      output: 'png'
    } as qrcode.QRCodeToFileOptions) // generate the file
  } else if (connection && connection === 'close') {
    // Update Connection Status
    status = BotStatusEnum.OFFLINE

    // when websocket is closed
    if (fs.existsSync(resolve(__dirname, '../../qr', 'qr.png'))) {
      // and, the QR file is exists
      fs.unlinkSync(resolve(__dirname, '../../qr', 'qr.png')) // delete it
    }
  }

  return { ev, shouldReconnect }
}

async function connectToWhatsApp(eventEmitter: EventEmitter2) {
  sock = makeWASocket({
    // can provide additional config heat
    printQRInTerminal: true,
    auth: state
  })

  sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
    // Use the connection update handler
    const { connection } = update
    const { shouldReconnect } = connectionUpdateSync(update)

    if (connection === 'close') {
      // reconnect if not logged out
      if (shouldReconnect) {
        deleteOldAuthFileOnReconnect()
        connectToWhatsApp(eventEmitter)
      }
    }

    eventEmitter.emit('connection.update', { ev: update, sock })
  })

  sock.ev.on('creds.update', saveState)
  sock.ev.on('chats.upsert', (ev: Chat[]) => eventEmitter.emit('chats.upsert', { ev, sock }))
  sock.ev.on('chats.update', (ev: Partial<Chat[]>) => eventEmitter.emit('chats.update', { ev, sock }))
  sock.ev.on('chats.delete', (ev: string[]) => eventEmitter.emit('chats.delete', { ev, sock }))
  sock.ev.on('presence.update', (ev: { id: string; presences: { [participant: string]: PresenceData } }) => eventEmitter.emit('presence.update', { ev, sock }))
  sock.ev.on('contacts.upsert', (ev: Contact[]) => eventEmitter.emit('contacts.upsert', { ev, sock }))
  sock.ev.on('contacts.update', (ev: Partial<Contact[]>) => eventEmitter.emit('contact.update', { ev, sock }))
  sock.ev.on('messages.upsert', (ev: { messages: WAMessage[]; type: MessageUpsertType }) => eventEmitter.emit('message.upsert', { ev, sock }))
  sock.ev.on('message.update', (ev: WAMessageUpdate[]) => eventEmitter.emit('message.update', { ev, sock }))
  sock.ev.on('message.media-update', (ev: { key: WAMessageKey; media?: { ciphertext: Uint8Array; iv: Uint8Array }; error?: Boom }[]) =>
    eventEmitter.emit('message.media-update', { ev, sock })
  )
  sock.ev.on('message.reaction', (ev: { key: WAMessageKey; reaction: proto.IReaction }[]) => eventEmitter.emit('message.reaction', { ev, sock }))
  sock.ev.on('message-receipt.update', (ev: MessageUserReceiptUpdate[]) => eventEmitter.emit('message-receipt.update', { ev, sock }))
  sock.ev.on('groups.upsert', (ev: GroupMetadata[]) => eventEmitter.emit('groups.upsert', { ev, sock }))
  sock.ev.on('groups.update', (ev: Partial<GroupMetadata>[]) => eventEmitter.emit('groups.update', { ev, sock }))
  sock.ev.on('groups-participant.update', (ev: { id: string; participants: string[]; action: ParticipantAction }) => eventEmitter.emit('groups-participant.update', { ev, sock }))
}

const isEnableWhatsAppBot = process.env.ENABLE_WHATSAPP_BOT === 'true'

@Injectable()
export class BotService implements OnModuleInit {
  constructor(private eventEmitter: EventEmitter2) {}

  async onModuleInit() {
    if (isEnableWhatsAppBot) {
      connectToWhatsApp(this.eventEmitter)
    }
  }
  async sendMessage(data: SendMessageDto, token: string) {
    try {
      const is_valid_token = validateToken(token)

      if (!isEnableWhatsAppBot) {
        throw new InternalServerError('Bot Not Enabled!')
      }

      if (!is_valid_token) {
        throw new UnauthorizedException('Invalid Token')
      }

      const chat_id = data.phone?.includes('@') ? data.phone : `${data.phone}@s.whatsapp.net`
      return await sock.sendMessage(chat_id, {
        text: data.message
      })
    } catch (error) {
      throw new HttpException(error?.response || error, error?.response?.statusCode ? error?.response?.statusCode : 500)
    }
  }

  async sendButtonMesage(data: SendButtonMessageDto, token: string) {
    try {
      const is_valid_token = validateToken(token)

      if (!isEnableWhatsAppBot) {
        throw new InternalServerError('Bot Not Enabled!')
      }

      if (!is_valid_token) {
        throw new UnauthorizedException('Invalid Token')
      }

      const chat_id = data.phone?.includes('@') ? data.phone : `${data.phone}@s.whatsapp.net`

      return await sock.sendMessage(chat_id, {
        text: data?.text,
        footer: data?.footer,
        image: { url: data?.image_url },
        caption: data?.caption,
        headerType: data?.header_type || 1,
        buttons: data.buttons.map((btn, idx) => {
          return {
            buttonId: `btn_${idx + 1}`,
            buttonText: {
              displayText: btn.text
            },
            type: btn.type
          }
        })
      })
    } catch (error) {
      throw new HttpException(error?.response || error, error?.response?.statusCode ? error?.response?.statusCode : 500)
    }
  }

  async sendTemplateButtonMessage(data: SendTemplateButtonMessageDto, token: string) {
    try {
      const is_valid_token = validateToken(token)

      if (!isEnableWhatsAppBot) {
        throw new InternalServerError('Bot Not Enabled!')
      }

      if (!is_valid_token) {
        throw new UnauthorizedException('Invalid Token')
      }

      const chat_id = data.phone?.includes('@') ? data.phone : `${data.phone}@s.whatsapp.net`

      return await sock.sendMessage(chat_id, {
        text: data?.text,
        footer: data?.footer,
        image: { url: data?.image_url },
        caption: data?.caption,
        templateButtons: data.template_buttons.map((btn, idx) => {
          if (btn.action_type === ButtonMessageTemplateActionType.URL) {
            return {
              index: idx + 1,
              urlButton: {
                displayText: btn.text,
                url: btn?.url,
                id: `btn_${idx + 1}`
              }
            }
          }

          if (btn.action_type === ButtonMessageTemplateActionType.CALL) {
            return {
              index: idx + 1,
              callButton: {
                displayText: btn.text,
                phoneNumber: btn?.phone,
                id: `btn_${idx + 1}`
              }
            }
          }

          return {
            index: idx + 1,
            quickReplyButton: {
              displayText: btn.text,
              id: `btn_${idx + 1}`
            }
          }
        })
      })
    } catch (error) {
      console.log('Error On Send Template Button Message : ', error)
      console.log('Error On Send Template Button Message : ', { ...error })

      const errorMessage = `Error on establising connection, try to re-scan QR Code.`
      throw new HttpException(errorMessage, error?.response?.statusCode ? error?.response?.statusCode : 500)
    }
  }

  async getQRImage(req: Request, token: string) {
    const base_url = `${req.protocol}://${req.get('Host')}`
    const is_valid_token = validateToken(token)
    const is_connected = status === BotStatusEnum.ONLINE

    if (!is_valid_token) {
      throw new UnauthorizedException('Invalid Token')
    }

    let message = 'Your bot is offline.'
    let qr_image_url = base_url + '/qr/qr.png'
    if (is_connected) {
      message = 'Your bot is online.'
      qr_image_url = null
    }

    return new OkResponse(
      {
        qr_image_url
      },
      {
        message
      }
    )
  }

  async getConnectionStatus(token: string) {
    const is_valid_token = validateToken(token)
    const is_connected = status === BotStatusEnum.ONLINE

    if (!is_valid_token) {
      throw new UnauthorizedException('Invalid Token')
    }

    let message = 'Your bot is offline.'
    if (is_connected) {
      message = 'Your bot is online.'
    }

    return new OkResponse(
      {
        status
      },
      {
        message
      }
    )
  }
}
