import makeWASocket, { ConnectionState, DisconnectReason, MessageUpsertType, useSingleFileAuthState, WAMessage } from '@adiwajshing/baileys'
import { HttpException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Request } from 'express'
import * as fs from 'fs-extra'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuid } from 'uuid'
import { validateToken } from '../shared/helper/token-validator'
import { InternalServerError, NotFoundError } from '../shared/provider/error-provider'
import { OkResponse } from '../shared/provider/response-provider'
import { BotSessionDto, BotStatusEnum, CreateNewBotDto, SendMessageDto } from './bot.dto'
import { Bot } from './bot.model'
import { resolve } from 'path'
import * as qrcode from 'qrcode'
import * as colors from 'colors'
import * as figlet from 'figlet'
import { Boom } from '@hapi/boom'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const generateApiKey = require('generate-api-key')

let sock
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

    eventEmitter.emit('connection.update', update)
  })

  sock.ev.on('messages.upsert', (ev: { messages: WAMessage[]; type: MessageUpsertType }) => eventEmitter.emit('message.upsert', { ev, sock }))
  sock.ev.on('creds.update', saveState)
}

const isEnableWhatsAppBot = process.env.ENABLE_WHATSAPP_BOT === 'true'

@Injectable()
export class BotService implements OnModuleInit {
  constructor(private eventEmitter: EventEmitter2) {}

  private sessions: BotSessionDto[] = []

  async onModuleInit() {
    if (isEnableWhatsAppBot) {
      const botDocs = JSON.parse(await readFile(join(process.cwd(), 'bots.json'), 'utf8'))
      this.sessions = botDocs.map((doc) => this.mapToSessionDto(doc))

      connectToWhatsApp(this.eventEmitter)
    }
  }

  async createBot(data: CreateNewBotDto, token: string) {
    try {
      const is_valid_token = validateToken(token)

      if (!is_valid_token) {
        throw new UnauthorizedException('Invalid Token')
      }

      const api_key = generateApiKey({
        method: 'bytes',
        prefix: 'p.iobot_',
        length: 20
      })

      if (!state) {
        throw new NotFoundError(`No Bot connected.`)
      }

      const unwanted_code = state?.creds?.me?.id?.replace(/^\d+/, '')
      const phone_number = state?.creds?.me?.id.replace(unwanted_code, '')
      const user_id = state?.creds?.me?.id

      const botToInsert = new Bot()

      botToInsert.id = uuid()
      botToInsert.name = data?.name || phone_number
      botToInsert.api_key = api_key
      botToInsert.phone = phone_number
      botToInsert.user_id = user_id

      this.sessions.push(botToInsert)

      fs.writeJSONSync(join(process.cwd(), 'bots.json'), this.sessions)

      const isTokenAlreadyExists = this.sessions.find((b) => b.api_key === api_key || b.id === user_id)
      if (!isTokenAlreadyExists) {
        this.sessions.push(this.mapToSessionDto(botToInsert))
      }

      return new OkResponse({
        api_key
      })
    } catch (error) {
      console.log('error : ', error)
      throw new HttpException(error?.response || error, error?.meta?.statusCode ? error?.meta?.statusCode : 500)
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

      let chat_id = data.id?.includes('@') ? data.id : `${data.id}@s.whatsapp.net`
      if (data.isGroup) {
        chat_id = data.id?.includes('@') ? data.id : `${data.id}@g.us`
      }
      if (!chat_id.includes('@g.us')) {
        if (chat_id?.charAt(0) === '+') {
          chat_id = chat_id.replace('+', '')
        }
        if (chat_id?.charAt(0) === '0') {
          chat_id = chat_id.replace('0', '62')
        }
      }

      return await sock.sendMessage(chat_id, {
        text: data.message
      })
    } catch (error) {
      throw new HttpException(error?.response || error, error?.response?.statusCode ? error?.response?.statusCode : 500)
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

  private mapToSessionDto(data: Bot): BotSessionDto {
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      api_key: data.api_key,
      user_id: data.user_id
    }
  }
}
