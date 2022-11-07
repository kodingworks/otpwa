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

const monitoringGroupChatId = process.env.MONITORING_GROUP_CHAT_ID
const groupIdWelcomeMessage = process.env.GROUP_ID_WELCOME_MESSAGE
const baseURL = process.env.BASE_URL
const isLocalEnv = process.env.ENV === 'local'

export class WebhookService {
  webhookURL: string

  constructor(private readonly httpService: HttpService) {
    this.webhookURL = process?.env?.WEBHOOK_URL
  }

  //-------------------------------------------------
  // Connection
  //-------------------------------------------------
  @OnEvent('connection.update')
  async connectionUpdate(data: { ev: Partial<ConnectionState>; sock }) {
    const { connection, qr, lastDisconnect } = data?.ev
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

    const webhookData = new OkResponse({
      event_type: 'connection.update',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Connection Update Webhook Data Response : ', sendWebhookResponse)

    return data.ev
  }

  //-------------------------------------------------
  // Creds
  //-------------------------------------------------
  @OnEvent('creds.update')
  credsUpdate(data: { ev: Partial<AuthenticationCreds>; sock }) {
    const webhookData = new OkResponse({
      event_type: 'creds.update',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Creds Update Webhook Data Response : ', sendWebhookResponse)

    return data.ev
  }

  //-------------------------------------------------
  // Chats
  //-------------------------------------------------
  @OnEvent('chats.upsert')
  chatsUpsert(data: { ev: Chat[]; sock }) {
    const webhookData = new OkResponse({
      event_type: 'chats.upsert',
      data: data?.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Chats Upsert Webhook Data Response : ', sendWebhookResponse)

    return data.ev
  }

  @OnEvent('chats.update')
  chatsUpdate(data: { ev: Partial<Chat>[]; sock }) {
    const webhookData = new OkResponse({
      event_type: 'chats.update',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Chats Update Webhook Data Response : ', sendWebhookResponse)

    return data.ev
  }

  @OnEvent('chats.delete')
  chatsDelete(data: { ev: string[]; sock }) {
    const webhookData = new OkResponse({
      event_type: 'chats.delete',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Chats Delete Webhook Data Response : ', sendWebhookResponse)

    return data.ev
  }

  //-------------------------------------------------
  // Contacts
  //-------------------------------------------------
  @OnEvent('contacts.upsert')
  contactsUpsert(data: { ev: Contact[]; sock }) {
    const webhookData = new OkResponse({
      event_type: 'contacts.upsert',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Contact Upsert Webhook Data Response : ', sendWebhookResponse)

    return data.ev
  }

  @OnEvent('contacts.update')
  contactsUpdate(data: { ev: Partial<Contact>[]; sock }) {
    const webhookData = new OkResponse({
      event_type: 'contacts.update',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Contacts Update Webhook Data Response : ', sendWebhookResponse)

    return data.ev
  }

  //-------------------------------------------------
  // Presence
  //-------------------------------------------------
  @OnEvent('presence.update')
  presenceUpdate(data: { ev: { id: string; precenses: { [participat: string]: PresenceData } }; sock }) {
    const webhookData = new OkResponse({
      event_type: 'presence.update',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Presence Update Webhook Data Response : ', sendWebhookResponse)

    return data.ev
  }

  //-------------------------------------------------
  // Message
  //-------------------------------------------------
  @OnEvent('message.delete')
  messageDelete(data: {
    ev:
      | {
          keys: WAMessageKey[]
        }
      | { jid: string; all: true }
    sock
  }) {
    const webhookData = new OkResponse({
      event_type: 'message.delete',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Message Delete Webhook Data Response : ', sendWebhookResponse)

    return data.ev
  }

  @OnEvent('message.update')
  messageUpdate(data: { ev: WAMessageUpdate[]; sock }) {
    const webhookData = new OkResponse({
      event_type: 'message.update',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Message Update Webhook Data Response : ', sendWebhookResponse)

    return data.ev
  }

  @OnEvent('message.upsert')
  messageUpsert(data: { ev: { messages: WAMessage[]; type: MessageUpsertType }; sock }) {
    console.log(JSON.stringify(data?.ev, undefined, 2))
    const message = JSON.parse(JSON.stringify(data?.ev?.messages[0], undefined, 2))

    console.log('am I receiving something?')
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
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Message Upsert Webhook Data Response : ', sendWebhookResponse)
  }

  @OnEvent('message.reaction')
  messageReaction(data: { ev: { messages: WAMessageKey[]; type: proto.IReaction }; sock }) {
    console.log(JSON.stringify(data?.ev, undefined, 2))
    const webhookData = new OkResponse({
      event_type: 'message.reaction',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Message Reaction Webhook Data Response : ', sendWebhookResponse)
  }

  @OnEvent('message-media.update')
  messageMediaUpdate(data: { ev: { key: WAMessageKey; media?: { ciphertext: Uint8Array; iv: Uint8Array }; error?: Boom }[]; sock }) {
    console.log(JSON.stringify(data?.ev, undefined, 2))
    const webhookData = new OkResponse({
      event_type: 'message-media.update',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Message-Media Update Webhook Data Response : ', sendWebhookResponse)
  }

  @OnEvent('message-receipt.update')
  messageReceiptUpdate(data: { ev: MessageUserReceiptUpdate[]; sock }) {
    console.log(JSON.stringify(data?.ev, undefined, 2))
    const webhookData = new OkResponse({
      event_type: 'message-receipt.update',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Message-Receipt Update Webhook Data Response : ', sendWebhookResponse)
  }

  @OnEvent('messaging-history.set')
  messagingHistorySet(data: { ev: { chats: Chat[]; contacts: Contact[]; messages: WAMessage[]; isLatest: boolean }; sock }) {
    const webhookData = new OkResponse({
      event_type: 'messaging-history.set',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Messaging-History Webhook Data Response : ', sendWebhookResponse)

    return data.ev
  }

  //-------------------------------------------------
  // Groups
  //-------------------------------------------------
  @OnEvent('groups.upsert')
  groupsUpsert(data: { ev: GroupMetadata[]; sock }) {
    const webhookData = new OkResponse({
      event_type: 'groups.upsert',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Groups Upsert Webhook Data Response : ', sendWebhookResponse)

    return data.ev
  }

  @OnEvent('groups.update')
  groupsUpdate(data: { ev: Partial<GroupMetadata>[]; sock }) {
    const webhookData = new OkResponse({
      event_type: 'groups.update',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Groups Update Webhook Data Response : ', sendWebhookResponse)

    return data.ev
  }

  @OnEvent('groups-participant.update')
  groupsParticipantUpdate(data: { ev: { id: string[]; type: 'add' | 'remove' }; sock }) {
    const webhookData = new OkResponse({
      event_type: 'groups-participant.update',
      data: data.ev
    })
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Groups-Participant Update Webhook Data Response : ', sendWebhookResponse)

    return data.ev
  }
}
