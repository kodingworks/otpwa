import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common'
import { CreateOtpDto, VerifyOtpDto } from './otp.dto'
import { OtpService } from './otp.service'

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post()
  @HttpCode(200)
  create(@Body() createOtpDto: CreateOtpDto, @Headers('Authorization') token: string) {
    return this.otpService.create(createOtpDto, token)
  }

  @Post('/verify')
  @HttpCode(200)
  verify(@Body() verifyOtpDto: VerifyOtpDto, @Headers('Authorization') token: string) {
    return this.otpService.verify(verifyOtpDto, token)
  }
}
