export class Bot {
  id: string
  name: string
  phone: string
  user_id: string
  description: string
  tz: string = process.env.TZ
  api_key: string
}
