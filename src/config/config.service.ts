import { resolve } from 'path'
import { UpdateWebhookConfigDto, WebhookEventDto } from './config.dto'
import * as fs from 'fs-extra'
import { safelyParseJSON } from 'src/shared/helper/json-parser'
import { validateToken } from 'src/shared/helper/token-validator'
import { UnauthorizedException } from '@nestjs/common'
import { OkResponse, UpdateDataResponse } from 'src/shared/provider/response-provider'
import { eventData } from './config.data'
import { ConfigService as EnvironmentService } from '@nestjs/config'

export class ConfigService {
  events: WebhookEventDto[]

  constructor(private environment: EnvironmentService) {
    this.events = eventData
  }

  async getWebhookConfig(token: string) {
    const is_valid_token = validateToken(token)

    if (!is_valid_token) {
      throw new UnauthorizedException('Invalid Token')
    }

    const configFileDirectory = resolve(__dirname, '../../config.json')
    const isConfigFileExists = fs.existsSync(configFileDirectory)

    if (!isConfigFileExists) {
      const webhookConfigContent = {
        webhook: {
          url: this.environment.get('webhook.default_url') || '',
          events: this.events
        }
      }

      fs.writeFileSync(configFileDirectory, JSON.stringify(webhookConfigContent))

      return new OkResponse(webhookConfigContent.webhook)
    } else {
      const configFileJSON = safelyParseJSON(fs.readFileSync(configFileDirectory, 'utf8')) || {}
      return new OkResponse(configFileJSON.webhook)
    }
  }

  async updateWebhookConfig(data: UpdateWebhookConfigDto, token: string) {
    const is_valid_token = validateToken(token)

    if (!is_valid_token) {
      throw new UnauthorizedException('Invalid Token')
    }

    const configFileDirectory = resolve(__dirname, '../../config.json')
    if (fs.existsSync(configFileDirectory)) {
      const configFileJSON = safelyParseJSON(fs.readFileSync(configFileDirectory, 'utf8')) || {}
      const updatedWebhookConfigContent = {
        ...configFileJSON,
        webhook: {
          ...data
        }
      }
      fs.writeFileSync(configFileDirectory, JSON.stringify(updatedWebhookConfigContent))
    } else {
      fs.writeFileSync(configFileDirectory, JSON.stringify({ webhook: data }))
    }

    return new UpdateDataResponse(data)
  }
}
