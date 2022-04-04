import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import VenomType from 'venom-bot'
import { BotSessionDto, BotStatusEnum, CreateNewBotDto, SendMessageDto } from './bot.dto'
import { Bot, BotDocument } from './bot.model'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Venom: typeof VenomType = require('venom-bot')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const generateApiKey = require('generate-api-key')

@Injectable()
export class BotService {
  private sessions: Array<
    {
      client: VenomType.Whatsapp
    } & BotSessionDto
  >
  private create_config: VenomType.CreateConfig
  constructor(@InjectModel(Bot.name) private readonly botModel: Model<BotDocument>) {
    this.create_config = {
      logQR: false,
      devtools: false,
      disableWelcome: true,
      updatesLog: false,
      puppeteerOptions: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    }
    this.sessions = []
    this.resumeBot()
  }
  async createBot(data: CreateNewBotDto) {
    try {
      console.log(`Create Bot ${data.name}`)
      const api_key = generateApiKey({
        method: 'bytes',
        prefix: 'p.iobot_',
        length: 20
      })
      const botToInsert = new this.botModel()
      botToInsert.name = data.name
      botToInsert.api_key = api_key
      Venom.create(
        `BOT-${botToInsert._id}`,
        (base64Qrimg, asciiQR) => {
          console.log('Terminal qrcode:')
          console.log(asciiQR)
        },
        (statusSession, session) => {
          console.log('Status Session: ', statusSession) //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser
          //Create session wss return "serverClose" case server for close
          if (statusSession === 'qrReadSuccess') {
            botToInsert.status = BotStatusEnum.ONLINE
          }
          console.log('Session name: ', session)
        },
        this.create_config
      )
        .then(async (client) => {
          const phone = (await client.getHostDevice()).id
          botToInsert.phone = (phone as any).user
          botToInsert.user_id = (phone as any)._serialized
          await botToInsert.save()
          this.sessions.push({ client, ...this.mapToSessionDto(botToInsert) })
        })
        .catch((err) => {
          throw err
        })
    } catch (error) {
      throw error
    }
  }

  async sendMessage(data: SendMessageDto) {
    try {
      const bot = this.sessions.find((b) => b.api_key === data.token)
      if (!bot) {
        throw new NotFoundException('Token Invalid')
      }
      const client = bot.client
      const chat_id = `${data.phone}@c.us`
      client.sendText(chat_id, data.message).catch((err) => {
        console.log(err)
        throw err
      })
    } catch (error) {
      throw error
    }
  }

  private async resumeBot() {
    try {
      const listBot = await this.botModel.find()
      listBot.forEach(async (bot) => {
        try {
          Venom.create(
            `BOT-${bot._id}`,
            async (base64Qrimg, asciiQR) => {
              console.log('Terminal qrcode:')
              console.log(asciiQR)
              await bot.updateOne({
                status: BotStatusEnum.NEED_SCAN_QR
              })
            },
            async (statusSession, session) => {
              console.log('Status Session: ', statusSession)
              if (statusSession === 'qrReadSuccess') {
                await bot.updateOne({
                  status: BotStatusEnum.ONLINE
                })
              }
              console.log('Session name: ', session)
            },
            this.create_config
          )
            .then(async (client) => {
              this.sessions.push({ client, ...this.mapToSessionDto(bot) })
              // this.start(client)
            })
            .catch((err) => {
              throw err
            })
        } catch (error) {
          throw error
        }
      })
    } catch (error) {
      throw error
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
