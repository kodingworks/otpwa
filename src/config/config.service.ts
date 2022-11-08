import { resolve } from 'path'
import { UpdateWebhookConfigDto } from './config.dto'
import * as fs from 'fs-extra'
import { safelyParseJSON } from 'src/shared/helper/json-parser'
import { validateToken } from 'src/shared/helper/token-validator'
import { UnauthorizedException } from '@nestjs/common'
import { OkResponse, UpdateDataResponse } from 'src/shared/provider/response-provider'

export class ConfigService {
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
          url: process?.env?.WEBHOOK_URL || ''
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
