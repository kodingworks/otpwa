import { ArgumentsHost, Catch, ExceptionFilter, UnauthorizedException } from '@nestjs/common'
import { Response } from 'express'
import { ErrorCodeEnum } from '../provider/error-provider'

@Catch(UnauthorizedException)
export class UnauthorizedFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost): any {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    return response.status(401).json({
      meta: {
        statusCode: 401,
        errorCode: ErrorCodeEnum.UNAUTHORIZED_ERROR,
        message: exception?.message || 'Unauthorized',
        errors: [exception?.message] || 'Unauthorized'
      }
    })
  }
}
