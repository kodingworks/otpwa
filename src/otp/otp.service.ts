import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common'
import { validateToken } from 'src/shared/helper/token-validator'
import { BotService } from '../bot/bot.service'
import { RedisService } from '../redis/redis.service'
import { generateRandomCode, getDefaultContent, getNowString, hash } from '../shared/helper/hash'
import { BadRequestError, ErrorCodeEnum } from '../shared/provider/error-provider'
import { OkResponse } from '../shared/provider/response-provider'
import { CreateOtpDto, OtpDto, VerifyOtpDto } from './otp.dto'

@Injectable()
export class OtpService {
  constructor(private cacheManager: RedisService, private botService: BotService) {}

  /**
   * Initiate an account verification request
   *
   * @param {*} data
   */
  async create(data: CreateOtpDto, token: string) {
    const {
      phone,
      otp_length = 6,
      expires_in = 300, // by default, auth codes expire after 300s (5 minutes)
      content = getDefaultContent() // default string content of the phone template to send
    } = data

    const isValidToken = validateToken(token)

    if (!isValidToken) {
      throw new UnauthorizedException('Invalid Token')
    }

    /**
     * The code should be a random 6-digit number
     */

    let otpDigits = '1'

    for (let i = 0; i < otp_length; i++) {
      otpDigits += '0'
    }

    const code = generateRandomCode(100_000, Number(otpDigits))
    const text = content.replace(/\%code\%/g, code)
    const created_at = getNowString()

    try {
      /**
       * To prevent security issues, we don't need to store any personal data
       * or the actual auth code that was generated. We only need to make sure
       * that when we need to compare, we can generate the same hash to compare
       * the values.
       *
       * This data expires after max 7 days and is removed by a TTL mechanism
       * shortly after. It is safe enough to not hash+salt the data,
       * we just need to make it non-reversible.
       */
      const MAX_VALIDITY_IN_SECONDS = parseInt(process.env.REDIS_TTL) // 7 days, expressed in seconds

      const hashed_target = hash(phone)
      const hashed_target_string = hashed_target.toString()
      const hashed_code = hash(`${code}`)
      const expires_at = new Date(Math.floor(Date.now()) + expires_in * 1000).toISOString()

      const target_type = 'phone'
      const SK = `target#${target_type}#${hashed_target}`

      await this.cacheManager.set(hashed_target_string, {
        target: hashed_target,
        target_type,
        expires_in: Math.min(expires_in, MAX_VALIDITY_IN_SECONDS),
        code: hashed_code,
        created_at,
        expires_at,
        SK
      })

      /**
       * For now, only `phone` target_type is supported
       */

      await this.botService
        .sendMessage(
          {
            message: text,
            phone
          },
          token
        )
        .then((resp) => {
          return resp
        })
        .catch((err) => {
          throw err
        })

      return new OkResponse(
        { success: true },
        {
          message: 'OTP has been successfully created & sent to the recipient phone'
        }
      )
    } catch (error) {
      throw new HttpException(error?.response || error, error?.meta?.statusCode ? error?.meta?.statusCode : 500)
    }
  }

  /**
   * Validate a given code.
   *
   * Error cases shouldn't be too detailed in order to prevent account enumeration.
   * Either the request is valid or it isn't, that's all the information we need to return.
   *
   * @param {*} data
   */
  async verify(data: VerifyOtpDto, token: string) {
    const { phone, code } = data

    const isValidToken = validateToken(token)

    if (!isValidToken) {
      throw new UnauthorizedException('Invalid Token')
    }
    /**
     * Only the hashed data is ever compared. We don't care about the original data
     * and did not even save it in the database for security reasons.
     */
    const hashed_target = hash(phone)
    const hashed_target_string = hashed_target.toString()
    const hashed_code = hash(`${code}`)

    try {
      const saved: OtpDto = (await this.cacheManager.get(hashed_target_string)) as OtpDto
      console.log('saved: ', saved)

      /**
       * This input doesn't even match an entry in the database. Maybe:
       * - the user tries to guess a code and makes a second try
       * - there was never any auth code generated in the first place
       * - the code expired and was wiped by the TTL mechanism
       * - wrong target or target type
       */
      if (!saved) {
        throw new HttpException(
          new BadRequestError('Invalid OTP.', {
            errorCode: ErrorCodeEnum.ERROR_OTP_INVALID
          }),
          HttpStatus.BAD_REQUEST
        )
      }

      /**
       * Once retrieved, every entry is wiped immediately, whether the input was correct or not.
       * Never let users guess authorization codes!
       */
      await this.cacheManager.del(hashed_target_string)

      /**
       * This scenario can happen for multiple reasons:
       * - the code expired and was not yet wiped by the TTL mechanism
       */
      const now = Math.floor(Date.now() / 1000)
      const expired_at = saved?.expires_at && new Date(saved?.expires_at).getTime()
      if (expired_at < now) {
        throw new BadRequestError('OTP Expired', {
          errorCode: ErrorCodeEnum.ERROR_OTP_EXPIRED
        })
      }

      /**
       * We have a match, but the given code does not match:
       * - the user typed in a wrong code
       * - the encryption key was changed
       * - the hash function gave a different result for some other reason
       */

      if (hashed_code !== saved.code) {
        throw new BadRequestError('Invalid OTP.', {
          errorCode: ErrorCodeEnum.ERROR_OTP_INVALID
        })
      }

      return new OkResponse(
        { success: true },
        {
          message: 'OTP Valid.'
        }
      )
    } catch (error) {
      /**
       * Any error case should just return an undescript, generic unsuccessful
       * validation message, to prevent account enumeration and other nasty security
       * issues that it could lead to.
       */
      // throw error
      throw new HttpException(error?.response || error, error?.meta?.statusCode ? error?.meta?.statusCode : 500)
    }
  }
}
