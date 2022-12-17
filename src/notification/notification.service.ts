import { SendRawEmailCommand, SES } from '@aws-sdk/client-ses'
import { Injectable, Logger } from '@nestjs/common'
// import * as AWS from 'aws-sdk'
import { Telegraf } from 'telegraf'
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types'
import { SendEmailDto } from './notification.dto'

const nodemailer = require('nodemailer')

@Injectable()
export class NotificationService {
  telegramBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

  async sendEmail(data: SendEmailDto) {
    try {
      const ses = new SES({
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      })
      let transporter = nodemailer.createTransport({
        SES: {
          ses: ses,
          aws: { SendRawEmailCommand }
        }
      })

      if (process.env.AWS_SMTP_HOST && process.env.AWS_SMTP_TLS_WRAPPER_PORT) {
        transporter = nodemailer.createTransport({
          host: process.env.AWS_SMTP_HOST,
          port: process.env.AWS_SMTP_TLS_WRAPPER_PORT,
          secure: process.env.AWS_SMTP_SECURE,
          auth: {
            user: process.env.AWS_SMTP_USERNAME,
            pass: process.env.AWS_SMTP_PASSWORD
          },
          tls: {
            rejectUnauthorized: false
          }
        })
      }

      const subject = data.subject || process.env.DEFAULT_EMAIL_SUBJECT
      const message = data.message

      try {
        await transporter.sendMail({
          from: process.env.SMTP_SENDER_EMAIL,
          to: data.to,
          subject,
          html: message
        })
      } catch (error) {
        throw error
      }
      Logger.log('NOTIFICATION | Send Notification (Success)')
    } catch (error) {
      Logger.error(`NOTIFICATION | Failed to Send Email => ${error}`)
    }
  }

  async sendErrorReportMessageToTelegram(chatId: number | string, message: string, extra?: ExtraReplyMessage) {
    console.log('Chat ID : ......', chatId)
    return this.telegramBot.telegram
      .sendMessage(chatId, message, extra)
      .then(() => {
        Logger.log('NOTIFICATION | Send Error Report Message To Telegram Notification (Success)')
      })
      .catch((error) => {
        Logger.error('NOTIFICATION | Telegram Bot Payload : ', JSON.stringify({ chatId, message }))
        console.error(`NOTIFICATION | Error Telegram Send Error Report Message : `, { ...error })
        throw error
      })
  }
}
