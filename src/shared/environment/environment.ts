export interface Environment {
  node_env: string
  port: number
  tz: string
  app: {
    base_url: string
  }
  encryption: {
    algorithm: string
    secret: string
  }
  aws: {
    access_key_id: string
    secret_key_access: string
    aws_region: string
    s3_bucket_name: string
  }
  smtp: {
    sender_email: string
    host: string
    starttls_port: string
    tls_wrapper_port: string
    username: string
    password: string
    is_secure: string
  }
  redis: {
    host: string
    port: number
    ttl: string
  }
  telegram: {
    bot_token: string
    monitoring_chat_id: string
    group_id_welcome_message: string
  }
  otp: {
    default_otp_target_type: string
    enable_whatsapp_bot: string
    company_name: string
    testing_ott: string
    testing_recipients: string
  }
  webhook: {
    default_url: string
  }
}

export default () => ({
  node_env: process.env.NODE_ENV || 'local',
  port: parseInt(process.env.PORT, 10) || 3000,
  tz: process.env.TZ,
  app: {
    base_url: process.env.BASE_URL
  },
  encryption: {
    algorithm: process.env.ENCRYPTION_ALGORITHM,
    secret: process.env.ENCRYPTION_SECRET
  },
  aws: {
    access_key_id: process.env.AWS_ACCESS_KEY_ID,
    secret_key_access: process.env.AWS_SECRET_ACCESS_KEY,
    aws_region: process.env.AWS_REGION,
    s3_bucket_name: process.env.AWS_S3_BUCKET_NAME
  },
  smtp: {
    sender_email: process.env.SMTP_SENDER_EMAIL,
    host: process.env.SMTP_HOST,
    starttls_port: process.env.SMTP_STARTTLS_PORT,
    tls_wrapper_port: process.env.SMTP_TLS_WRAPPER_PORT,
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
    is_secure: process.env.SMTP_IS_SECURE
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    ttl: parseInt(process.env.REDIS_TTL) || 604800 // Seconds. Default 7 days
  },
  telegram: {
    bot_token: process.env.TELEGRAM_BOT_TOKEN,
    monitoring_chat_id: process.env.TELEGRAM_MONITORING_CHAT_ID,
    group_id_welcome_message: process.env.TELEGRAM_MONITORING_GROUP_CHAT_ID
  },
  otp: {
    default_otp_target_type: process.env.DEFAULT_OTP_TARGET_TYPE || 'PHONE',
    enable_whatsapp_bot: process.env.ENABLE_WHATSAPP_BOT,
    company_name: process.env.COMPANY_NAME,
    testing_ott: process.env.TESTING_OTPS,
    testing_recipients: process.env.TESTING_RECIPIENTS
  },
  webhook: {
    default_url: process.env.DEFAULT_WEBHOOK_URL
  }
})
