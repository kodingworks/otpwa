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
import { OkResponse } from '../../shared/provider/response-provider'
import { lastValueFrom } from 'rxjs'
import { Boom } from '@hapi/boom'
import { Injectable, OnModuleInit } from '@nestjs/common'
import * as fs from 'fs-extra'
import { resolve } from 'path'
import { safelyParseJSON } from '../../shared/helper/json-parser'
import { WebhookEventDto, WebhookEventType } from '../../config/config.dto'
import { eventData } from '../../config/config.data'
import { ConfigService as EnvirontmentService } from '@nestjs/config'

@Injectable()
export class WebhookService implements OnModuleInit {
  webhookURL: string
  events: WebhookEventDto[]

  baseURL: string
  monitoringGroupChatId: string
  groupIdWelcomeMessage: string
  isLocalEnv: boolean

  constructor(private readonly httpService: HttpService, private environtment: EnvirontmentService) {
    this.webhookURL = this.environtment.get<string>('webhook.default_url')
    this.events = eventData

    this.isLocalEnv = this.environtment.get<string>('node_env') !== 'local'
    this.baseURL = this.environtment.get<string>('app.base_url')
    this.monitoringGroupChatId = this.environtment.get<string>('telegram.monitoring_group_chat_id')
    this.groupIdWelcomeMessage = this.environtment.get<string | null>('telegram.group_id_welcome_message')
  }

  async onModuleInit() {
    const configFileDirectory = resolve(__dirname, '../../../config.json')
    const isConfigFileExists = fs.existsSync(configFileDirectory)

    if (isConfigFileExists) {
      const configFileJSON = safelyParseJSON(fs.readFileSync(configFileDirectory, 'utf8')) || {}

      this.webhookURL = configFileJSON?.webhook?.url
      this.events = configFileJSON?.webhook?.events
    }
  }

  getWebhookConfig() {
    const configFileDirectory = resolve(__dirname, '../../../config.json')
    const isConfigFileExists = fs.existsSync(configFileDirectory)

    if (isConfigFileExists) {
      const configFileJSON = safelyParseJSON(fs.readFileSync(configFileDirectory, 'utf8')) || {}

      this.webhookURL = configFileJSON?.webhook?.url
      this.events = configFileJSON?.webhook?.events
    }

    return {
      webhookURL: this.webhookURL,
      events: this.events
    }
  }

  async sendWebhookHttpRequest(event: any, eventType: WebhookEventType, eventName: string) {
    console.log(`${eventName} :\n`, JSON.stringify(event, undefined, 2))
    const webhookData = new OkResponse({
      event_type: eventType,
      data: event,
      created_at: new Date().toISOString()
    })

    const { webhookURL, events } = this.getWebhookConfig()
    const isWebhookURLSet = webhookURL?.length
    const isWebhookEventEnabled = events.find((webhookEvent) => webhookEvent.type === eventType && webhookEvent.enabled)

    if (!isWebhookURLSet) {
      console.error('Webhook URL is not configured!')
      return event
    }

    if (isWebhookEventEnabled) {
      const sendWebhookResponse = await lastValueFrom(this.httpService.post(webhookURL, webhookData))
      console.log(`${eventName} Webhook Data Response : `, sendWebhookResponse.data)
    }

    return webhookData
  }

  //-------------------------------------------------
  // Connection
  //-------------------------------------------------
  @OnEvent(WebhookEventType.CONNECTION_UPDATE)
  async connectionUpdate(data: Required<{ ev: Required<ConnectionState>; sock: any }>) {
    const { connection, qr, lastDisconnect } = data?.ev || {}
    const notificationService = new NotificationService()

    switch (connection) {
      case 'close': {
        console.log('Connection Closed due to ', lastDisconnect.error, ', reconnecting \n')

        if (!this.isLocalEnv) {
          const botDisconnectErrorMessage = `[${this.baseURL}][🔴 Down] - BOTNYA TERPUTUS CUY, BENERIN GIH! 🙂`

          if (this.monitoringGroupChatId) {
            await notificationService.sendErrorReportMessageToTelegram(this.monitoringGroupChatId, botDisconnectErrorMessage)
          }
        }
      }
      case 'open': {
        if (!this.isLocalEnv) {
          const botDisconnectErrorMessage = `[${this.baseURL}][✅ Up] - Nah mantab, botnya udah terhubung! 🥶`

          if (this.monitoringGroupChatId) {
            await notificationService.sendErrorReportMessageToTelegram(this.monitoringGroupChatId, botDisconnectErrorMessage)
          }
        }
      }
    }

    if (qr) {
      if (!this.isLocalEnv) {
        const botDisconnectErrorMessage = `[${this.baseURL}][🔴 Down] - BOTNYA TERPUTUS CUY, PERLU SCAN QR, BENERIN GIH! 🙂`

        if (this.monitoringGroupChatId) {
          await notificationService.sendErrorReportMessageToTelegram(this.monitoringGroupChatId, botDisconnectErrorMessage)
        }
      }
    }

    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.CONNECTION_UPDATE, 'Connection Update')
  }

  //-------------------------------------------------
  // Creds
  //-------------------------------------------------
  @OnEvent(WebhookEventType.CREDENTIALS_UPDATE)
  async credsUpdate(data: { ev: Partial<AuthenticationCreds>; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.CREDENTIALS_UPDATE, 'Creds Update')
  }

  //-------------------------------------------------
  // Chats
  //-------------------------------------------------
  @OnEvent(WebhookEventType.CHATS_UPSERT)
  async chatsUpsert(data: { ev: Chat[]; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.CHATS_UPSERT, 'Chats Upsert')
  }

  @OnEvent(WebhookEventType.CHATS_UPDATE)
  async chatsUpdate(data: { ev: Partial<Chat>[]; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.CHATS_UPDATE, 'Chats Update')
  }

  @OnEvent(WebhookEventType.CHATS_DELETE)
  async chatsDelete(data: { ev: string[]; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.CHATS_DELETE, 'Chats Delete')
  }

  //-------------------------------------------------
  // Contacts
  //-------------------------------------------------
  @OnEvent(WebhookEventType.CONTACTS_UPSERT)
  async contactsUpsert(data: { ev: Contact[]; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.CONTACTS_UPSERT, 'Contacts Upsert')
  }

  @OnEvent(WebhookEventType.CONTACTS_UPDATE)
  async contactsUpdate(data: { ev: Partial<Contact>[]; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.CONTACTS_UPDATE, 'Contacts Update')
  }

  //-------------------------------------------------
  // Presence
  //-------------------------------------------------
  @OnEvent(WebhookEventType.PRESENCE_UPDATE)
  async presenceUpdate(data: { ev: { id: string; precenses: { [participat: string]: PresenceData } }; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.PRESENCE_UPDATE, 'Presence Delete')
  }

  //-------------------------------------------------
  // Message
  //-------------------------------------------------
  @OnEvent(WebhookEventType.MESSAGES_UPSERT)
  async messageUpsert(data: { ev: { messages: WAMessage[]; type: MessageUpsertType }; sock: any }) {
    const message = JSON.parse(JSON.stringify(data?.ev?.messages[0], undefined, 2))
    // Auto kirim notif ketika masuk ke group dan menunjukkan chat_id dari group tsb
    if (message?.messageStubType === 'GROUP_CREATE') {
      const text = this.groupIdWelcomeMessage.replace('%chat_id%', message?.key?.remoteJid)

      if (data?.sock) {
        data?.sock.sendMessage(message?.key?.remoteJid, {
          text
        })
      }
    }

    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.MESSAGES_UPSERT, 'Message Upsert')
  }

  @OnEvent(WebhookEventType.MESSAGES_UPDATE)
  async messageUpdate(data: { ev: WAMessageUpdate[]; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.MESSAGES_UPDATE, 'Message Update')
  }

  @OnEvent(WebhookEventType.MESSAGES_DELETE)
  async messageDelete(data: {
    ev:
      | {
          keys: WAMessageKey[]
        }
      | { jid: string; all: true }
    sock: any
  }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.MESSAGES_DELETE, 'Message Delete')
  }

  @OnEvent(WebhookEventType.MESSAGES_REACTION)
  async messageReaction(data: { ev: { messages: WAMessageKey[]; type: proto.IReaction }; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.MESSAGES_REACTION, 'Message Reaction')
  }

  @OnEvent(WebhookEventType.MESSAGES_RECEIPT_UPDATE)
  async messageMediaUpdate(data: { ev: { key: WAMessageKey; media?: { ciphertext: Uint8Array; iv: Uint8Array }; error?: Boom }[]; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.MESSAGES_MEDIA_UPDATE, 'Message Media Update')
  }

  @OnEvent(WebhookEventType.MESSAGES_RECEIPT_UPDATE)
  async messageReceiptUpdate(data: { ev: MessageUserReceiptUpdate[]; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.MESSAGES_RECEIPT_UPDATE, 'Message Receipt Update')
  }

  @OnEvent(WebhookEventType.MESSAGING_HISTORY_SET)
  async messagingHistorySet(data: { ev: { chats: Chat[]; contacts: Contact[]; messages: WAMessage[]; isLatest: boolean }; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.MESSAGING_HISTORY_SET, 'Messaging-History Set')
  }

  //-------------------------------------------------
  // Groups
  //-------------------------------------------------
  @OnEvent(WebhookEventType.GROUPS_UPSERT)
  async groupsUpsert(data: { ev: GroupMetadata[]; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.GROUPS_UPSERT, 'Groups Upsert')
  }

  @OnEvent(WebhookEventType.GROUPS_UPDATE)
  async groupsUpdate(data: { ev: Partial<GroupMetadata>[]; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.GROUPS_UPDATE, 'Groups Update')
  }

  @OnEvent(WebhookEventType.GROUPS_PARTICIPANTS_UPDATE)
  async groupsParticipantUpdate(data: { ev: { id: string[]; type: 'add' | 'remove' }; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.GROUPS_PARTICIPANTS_UPDATE, 'Groups-Participant Update')
  }

  //-------------------------------------------------
  // Blocklist
  //-------------------------------------------------
  @OnEvent(WebhookEventType.BLOCKLIST_SET)
  async blocklistSet(data: { ev: GroupMetadata[]; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.BLOCKLIST_SET, 'Blocklist Set')
  }

  @OnEvent(WebhookEventType.BLOCKLIST_UPDATE)
  async blocklistUpdate(data: { ev: Partial<GroupMetadata>[]; sock: any }) {
    return await this.sendWebhookHttpRequest(data.ev, WebhookEventType.BLOCKLIST_UPDATE, 'Blocklist Update')
  }
}
