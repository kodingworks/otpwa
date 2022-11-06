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
  async connectionUpdate(ev: Partial<ConnectionState>) {
    const { connection, qr, lastDisconnect } = ev
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

    const webhookData = new OkResponse(ev)
    const sendWebhookResponse = lastValueFrom(this.httpService.post(this.webhookURL, webhookData))
    console.log('Webhook Data Response : ', sendWebhookResponse)

    return { ev }
  }

  //-------------------------------------------------
  // Creds
  //-------------------------------------------------
  @OnEvent('creds.update')
  credsUpdate(ev: Partial<AuthenticationCreds>) {
    return ev
  }

  //-------------------------------------------------
  // Chats
  //-------------------------------------------------
  @OnEvent('chats.upsert')
  chatsUpsert(ev: Chat[]) {
    return ev
  }

  @OnEvent('chats.update')
  chatsUpdate(ev: Partial<Chat>[]) {
    return ev
  }

  @OnEvent('chats.delete')
  chatsDelete(ev: string[]) {
    return ev
  }

  //-------------------------------------------------
  // Contacts
  //-------------------------------------------------
  @OnEvent('contacts.upsert')
  contactsUpsert(ev: Contact[]) {
    return ev
  }

  @OnEvent('contacts.update')
  contactsUpdate(ev: Partial<Contact>[]) {
    return ev
  }

  //-------------------------------------------------
  // Presence
  //-------------------------------------------------
  @OnEvent('presence.update')
  presenceUpdate(ev: { id: string; precenses: { [participat: string]: PresenceData } }) {
    return ev
  }

  //-------------------------------------------------
  // Message
  //-------------------------------------------------
  @OnEvent('message.delete')
  messageDelete(
    ev:
      | {
          keys: WAMessageKey[]
        }
      | { jid: string; all: true }
  ) {
    return ev
  }

  @OnEvent('message.update')
  messageUpdate(ev: WAMessageUpdate[]) {
    return ev
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
  }

  @OnEvent('message.reaction')
  messageReaction(data: { ev: { messages: WAMessageKey[]; type: proto.IReaction }; sock }) {
    console.log(JSON.stringify(data?.ev, undefined, 2))
  }

  @OnEvent('message-receipt.update')
  messageReceiptUpdate(data: { ev: MessageUserReceiptUpdate[]; sock }) {
    console.log(JSON.stringify(data?.ev, undefined, 2))
  }

  @OnEvent('messaging-history.set')
  messagingHistorySet(ev: { chats: Chat[]; contacts: Contact[]; messages: WAMessage[]; isLatest: boolean }) {
    return ev
  }

  //-------------------------------------------------
  // Groups
  //-------------------------------------------------
  @OnEvent('groups.upsert')
  groupsUpsert(ev: GroupMetadata[]) {
    return ev
  }

  @OnEvent('groups.update')
  groupsUpdate(ev: Partial<GroupMetadata>[]) {
    return ev
  }

  @OnEvent('groups-participant.update')
  groupsParticipantUpdate(ev: { id: string[]; type: 'add' | 'remove' }) {
    return ev
  }
}
