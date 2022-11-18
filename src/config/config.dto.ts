import * as Joi from 'joi'
import { JoiSchema } from 'nestjs-joi'

export enum WebhookEventType {
  CONNECTION_UPDATE = 'connection.update',
  CREDENTIALS_UPDATE = 'creds.update',
  MESSAGING_HISTORY_SET = 'messaging-history.set',
  CHATS_UPSERT = 'chats.upsert',
  CHATS_UPDATE = 'chats.update',
  CHATS_DELETE = 'chats.delete',
  PRESENCE_UPDATE = 'presence.update',
  CONTACTS_UPSERT = 'contacts.upsert',
  CONTACTS_UPDATE = 'contacts.update',
  MESSAGES_DELETE = 'messages.delete',
  MESSAGES_UPDATE = 'messages.update',
  MESSAGES_MEDIA_UPDATE = 'messages.media-update',
  MESSAGES_UPSERT = 'messages.upsert',
  MESSAGES_REACTION = 'messages.reaction',
  MESSAGES_RECEIPT_UPDATE = 'message-receipt.update',
  GROUPS_UPSERT = 'groups.upsert',
  GROUPS_UPDATE = 'groups.update',
  GROUPS_PARTICIPANTS_UPDATE = 'group-participants.update',
  BLOCKLIST_SET = 'blocklist.set',
  BLOCKLIST_UPDATE = 'blocklist.update'
}

export interface WebhookEventDto {
  type: WebhookEventType
  enabled: boolean
}

export class UpdateWebhookConfigDto {
  @JoiSchema(Joi.string().optional())
  url?: string

  @JoiSchema(
    Joi.array()
      .items(
        Joi.object({
          type: Joi.string()
            .allow(...Object.values(WebhookEventType))
            .required(),
          enabled: Joi.boolean().required()
        })
      )
      .required()
  )
  events: WebhookEventDto[]
}
