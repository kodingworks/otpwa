import makeWASocket, { DisconnectReason, useSingleFileAuthState } from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import { HttpException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as colors from 'colors'
import { Request } from 'express'
import * as figlet from 'figlet'
import * as fs from 'fs'
import { Model } from 'mongoose'
import { resolve } from 'path'
import * as qrcode from 'qrcode'
import { validateToken } from 'src/shared/helper/token-validator'
import { NotFoundError } from 'src/shared/provider/error-provider'
import { OkResponse } from '../shared/provider/response-provider'
import { BotSessionDto, BotStatusEnum, CreateNewBotDto, SendMessageDto } from './bot.dto'
import { Bot, BotDocument } from './bot.model'
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

async function connectToWhatsApp() {
  sock = makeWASocket({
    // can provide additional config here
    printQRInTerminal: true,
    auth: state
  })

  console.log('sock : ', sock.ev)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (connection === 'close') {
      status = BotStatusEnum.OFFLINE
      const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
      // reconnect if not logged out
      if (shouldReconnect) {
        deleteOldAuthFileOnReconnect()
        connectToWhatsApp()
      }
    } else if (connection === 'open') {
      status = BotStatusEnum.ONLINE
      console.log(colors.green(figlet.textSync('Bot Connected', { horizontalLayout: 'full' })))
    }

    if (qr) {
      // if the 'qr' property is available on 'conn'
      console.info('QR Generated')

      qrcode.toFile(resolve(__dirname, '../../qr', 'qr.png'), qr, {
        width: 500,
        output: 'png'
      } as qrcode.QRCodeToFileOptions) // generate the file
    } else if (connection && connection === 'close') {
      // when websocket is closed
      if (fs.existsSync(resolve(__dirname, '../../qr', 'qr.png'))) {
        // and, the QR file is exists
        fs.unlinkSync(resolve(__dirname, '../../qr', 'qr.png')) // delete it
      }
    }
  })

  sock.ev.on('messages.upsert', async (m) => {
    console.log(JSON.stringify(m, undefined, 2))

    console.log('replying to', m.messages[0].key.remoteJid)
  })

  sock.ev.on('creds.update', saveState)
}

@Injectable()
export class BotService implements OnModuleInit {
  private sessions: BotSessionDto[] = []

  constructor(@InjectModel(Bot.name) private readonly botModel: Model<BotDocument>) {}

  async onModuleInit() {
    const botDocs = await this.botModel.find()
    this.sessions = botDocs.map((doc) => this.mapToSessionDto(doc))

    connectToWhatsApp()
  }

  async createBot(data: CreateNewBotDto) {
    try {
      console.log(`Create Bot ${data.name}`)
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

      const botToInsert = new this.botModel()
      botToInsert.name = data?.name || phone_number
      botToInsert.api_key = api_key
      botToInsert.phone = phone_number
      botToInsert.user_id = user_id

      await botToInsert.save()

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
        status,
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

  private mapToSessionDto(data: BotDocument): BotSessionDto {
    return {
      id: `${data._id}`,
      name: data.name,
      phone: data.phone,
      api_key: data.api_key,
      user_id: data.user_id,
      status: data.status
    }
  }
}
