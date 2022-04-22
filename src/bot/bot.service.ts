import makeWASocket, { DisconnectReason, useSingleFileAuthState } from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import { HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as fs from 'fs'
import { Model } from 'mongoose'
import { NotFoundError } from 'src/shared/provider/error-provider'
import { OkResponse } from '../shared/provider/response-provider'
import { BotSessionDto, CreateNewBotDto, SendMessageDto } from './bot.dto'
import { Bot, BotDocument } from './bot.model'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const generateApiKey = require('generate-api-key')

let sock

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

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
      // reconnect if not logged out
      if (shouldReconnect) {
        deleteOldAuthFileOnReconnect()
        connectToWhatsApp()
      }
    } else if (connection === 'open') {
      console.log('opened connection')
    }
  })

  sock.ev.on('messages.upsert', async (m) => {
    console.log(JSON.stringify(m, undefined, 2))

    console.log('replying to', m.messages[0].key.remoteJid)
  })

  sock.ev.on('creds.update', saveState)
}

@Injectable()
export class BotService {
  private sessions: BotSessionDto[] = []

  constructor(@InjectModel(Bot.name) private readonly botModel: Model<BotDocument>) {
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
      console.log('state: ', state)

      const unwanted_code = state?.creds?.me?.id?.replace(/^\d+/, '')
      const phone_number = state?.creds?.me?.id.replace(unwanted_code, '')
      const user_id = state?.creds?.me?.id

      const botToInsert = new this.botModel()
      botToInsert.name = data.name
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
      console.log('error adsadad: ', error)
      throw new HttpException(error?.response || error, error?.meta?.statusCode ? error?.meta?.statusCode : 500)
    }
  }

  async sendMessage(data: SendMessageDto) {
    try {
      const bot = this.sessions.find((b) => b.api_key === data.token)

      if (!bot) {
        throw new NotFoundException('Token Invalid')
      }

      const chat_id = data.phone?.includes('@') ? data.phone : `${data.phone}@s.whatsapp.net`
      return await sock.sendMessage(chat_id, {
        text: data.message
      })
    } catch (error) {
      throw new HttpException(error?.response || error, error?.response?.statusCode ? error?.response?.statusCode : 500)
    }
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
