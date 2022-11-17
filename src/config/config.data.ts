import { WebhookEventType } from './config.dto'

export const eventData = Object.values(WebhookEventType).map((eventType) => {
  return {
    type: eventType,
    enabled: false
  }
})
