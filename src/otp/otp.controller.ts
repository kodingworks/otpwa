import { Body, Controller, Post } from '@nestjs/common'
import { CreateOtpDto, VerifyOtpDto } from './otp.dto'
import { OtpService } from './otp.service'

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post()
  create(@Body() createOtpDto: CreateOtpDto) {
    return this.otpService.create(createOtpDto)
  }

  @Post('/verify')
  verify(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.otpService.verify(verifyOtpDto)
  }
}
