import {
  AuthenticationCreds,
  Chat,
  ConnectionState,
  Contact,
  GroupMetadata,
  MessageUpsertType,
  MessageUserReceiptUpdate,
  PresenceData,
  proto,
  WAMessage,
  WAMessageKey,
  WAMessageUpdate
} from '@adiwajshing/baileys'
import { NotificationService } from '../../notification/notification.service'
import { OnEvent } from '@nestjs/event-emitter'
import { HttpService } from '@nestjs/axios'
import { OkResponse } from 'src/shared/provider/response-provider'
import { lastValueFrom } from 'rxjs'
import { Boom } from '@hapi/boom'
import { Injectable, OnModuleInit } from '@nestjs/common'
import * as fs from 'fs-extra'
import { resolve } from 'path'
import { safelyParseJSON } from 'src/shared/helper/json-parser'

const monitoringGroupChatId = process.env.MONITORING_GROUP_CHAT_ID
const groupIdWelcomeMessage = process.env.GROUP_ID_WELCOME_MESSAGE
const baseURL = process.env.BASE_URL
const isLocalEnv = process.env.ENV === 'local'

@Injectable()
export class WebhookService implements OnModuleInit {
  webhookURL: string

  constructor(private readonly httpService: HttpService) {
    this.webhookURL = process?.env?.WEBHOOK_URL
  }

  async onModuleInit() {
    const configFileDirectory = resolve(__dirname, '../../../config.json')
    const isConfigFileExists = fs.existsSync(configFileDirectory)

    if (isConfigFileExists) {
      const configFileJSON = safelyParseJSON(fs.readFileSync(configFileDirectory, 'utf8')) || {}
      this.webhookURL = configFileJSON?.webhook?.url
    }
  }

  //-------------------------------------------------
  // Connection
  //-------------------------------------------------
  @OnEvent('connection.update')
  async connectionUpdate(data: Required<{ ev: Required<ConnectionState>; sock }>) {
    const { connection, qr, lastDisconnect } = data?.ev || {}
    const notificationService = new NotificationService()

    switch (connection) {
      case 'close': {
        console.log('Connection Closed due to ', lastDisconnect.error, ', reconnecting \n')

        if (!isLocalEnv) {
          const botDisconnectErrorMessage = `[${baseURL}][🔴 Down] - BOTNYA TERPUTUS CUY, BENERIN GIH! 🙂`
          await notificationService.sendErrorReportMessageToTelegram(monitoringGroupChatId, botDisconnectErrorMessage)
        }
      }
      case 'open': {
        if (!isLocalEnv) {
          const botDisconnectErrorMessage = `[${baseURL}][✅ Up] - Nah mantab, botnya udah terhubung! 🥶`
          await notificationService.sendErrorReportMessageToTelegram(monitoringGroupChatId, botDisconnectErrorMessage)
        }
      }
    }

    if (qr) {
      if (!isLocalEnv) {
        const botDisconnectErrorMessage = `[${baseURL}][🔴 Down] - BOTNYA TERPUTUS CUY, PERLU SCAN QR, BENERIN GIH! 🙂`
        await notificationService.sendErrorReportMessageToTelegram(monitoringGroupChatId, botDisconnectErrorMessage)
      }
    }

    console.log('data : ', data)
    const webhookData = new OkResponse({
      event_type: 'connection.update',
      data: data.ev,
      created_at: new Date().toISOString()
    })

    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))

    console.log('Connection Update Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  //-------------------------------------------------
  // Creds
  //-------------------------------------------------
  @OnEvent('creds.update')
  async credsUpdate(data: { ev: Partial<AuthenticationCreds>; sock }) {
    console.log('Creds Update :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'creds.update',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))

    console.log('Creds Update Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  //-------------------------------------------------
  // Chats
  //-------------------------------------------------
  @OnEvent('chats.upsert')
  async chatsUpsert(data: { ev: Chat[]; sock }) {
    console.log('Chats Upsert :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'chats.upsert',
      data: data?.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))

    console.log('Chats Upsert Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  @OnEvent('chats.update')
  async chatsUpdate(data: { ev: Partial<Chat>[]; sock }) {
    console.log('Chats Update :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'chats.update',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))

    console.log('Chats Update Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  @OnEvent('chats.delete')
  async chatsDelete(data: { ev: string[]; sock }) {
    console.log('Chats Delete :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'chats.delete',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))

    console.log('Chats Delete Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  //-------------------------------------------------
  // Contacts
  //-------------------------------------------------
  @OnEvent('contacts.upsert')
  async contactsUpsert(data: { ev: Contact[]; sock }) {
    console.log('Contacts Upsert :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'contacts.upsert',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))

    console.log('Contact Upsert Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  @OnEvent('contacts.update')
  async contactsUpdate(data: { ev: Partial<Contact>[]; sock }) {
    console.log('Contacts Update :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'contacts.update',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))

    console.log('Contacts Update Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  //-------------------------------------------------
  // Presence
  //-------------------------------------------------
  @OnEvent('presence.update')
  async presenceUpdate(data: { ev: { id: string; precenses: { [participat: string]: PresenceData } }; sock }) {
    console.log('Presence Update :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'presence.update',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))

    console.log('Presence Update Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  //-------------------------------------------------
  // Message
  //-------------------------------------------------
  @OnEvent('message.upsert')
  async messageUpsert(data: { ev: { messages: WAMessage[]; type: MessageUpsertType }; sock }) {
    console.log('Message Upsert :\n', JSON.stringify(data?.ev, undefined, 2))

    const message = JSON.parse(JSON.stringify(data?.ev?.messages[0], undefined, 2))
    // Auto kirim notif ketika masuk ke group dan menunjukkan chat_id dari group tsb
    if (message?.messageStubType === 'GROUP_CREATE') {
      const text = groupIdWelcomeMessage.replace('%chat_id%', message?.key?.remoteJid)

      if (data?.sock) {
        data?.sock.sendMessage(message?.key?.remoteJid, {
          text
        })
      }
    }

    const webhookData = new OkResponse({
      event_type: 'message.upsert',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))
    console.log('Message Upsert Webhook Data Response : ', sendWebhookResponse.data)
  }

  @OnEvent('message.update')
  async messageUpdate(data: { ev: WAMessageUpdate[]; sock }) {
    console.log('Message Update :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'message.update',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))
    console.log('Message Update Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  @OnEvent('message.delete')
  async messageDelete(data: {
    ev:
      | {
          keys: WAMessageKey[]
        }
      | { jid: string; all: true }
    sock
  }) {
    console.log('Message Delete :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'message.delete',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))
    console.log('Message Delete Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  @OnEvent('message.reaction')
  async messageReaction(data: { ev: { messages: WAMessageKey[]; type: proto.IReaction }; sock }) {
    console.log('Message Reaction :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'message.reaction',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))

    console.log('Message Reaction Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  @OnEvent('message-media.update')
  async messageMediaUpdate(data: { ev: { key: WAMessageKey; media?: { ciphertext: Uint8Array; iv: Uint8Array }; error?: Boom }[]; sock }) {
    console.log('Message-Media Update :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'message-media.update',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))

    console.log('Message-Media Update Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  @OnEvent('message-receipt.update')
  async messageReceiptUpdate(data: { ev: MessageUserReceiptUpdate[]; sock }) {
    console.log('Message-Receipt Update :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'message-receipt.update',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))

    console.log('Message-Receipt Update Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  @OnEvent('messaging-history.set')
  async messagingHistorySet(data: { ev: { chats: Chat[]; contacts: Contact[]; messages: WAMessage[]; isLatest: boolean }; sock }) {
    console.log('Messaging-History Set :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'messaging-history.set',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))

    console.log('Messaging-History Set Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  //-------------------------------------------------
  // Groups
  //-------------------------------------------------
  @OnEvent('groups.upsert')
  async groupsUpsert(data: { ev: GroupMetadata[]; sock }) {
    console.log('Groups Upsert :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'groups.upsert',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))

    console.log('Groups Upsert Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  @OnEvent('groups.update')
  async groupsUpdate(data: { ev: Partial<GroupMetadata>[]; sock }) {
    console.log('Groups Update :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'groups.update',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))

    console.log('Groups Update Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }

  @OnEvent('groups-participant.update')
  async groupsParticipantUpdate(data: { ev: { id: string[]; type: 'add' | 'remove' }; sock }) {
    console.log('Groups-Participant Update :\n', JSON.stringify(data?.ev, undefined, 2))

    const webhookData = new OkResponse({
      event_type: 'groups-participant.update',
      data: data.ev,
      created_at: new Date().toISOString()
    })
    const webhookURL = this.webhookURL

    if (!webhookURL) {
      console.error('Webhook URL is not configured!')
      return data.ev
    }
    const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))

    console.log('Groups-Participant Update Webhook Data Response : ', sendWebhookResponse.data)

    return data.ev
  }
}
