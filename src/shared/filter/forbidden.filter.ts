import { ArgumentsHost, Catch, ExceptionFilter, ForbiddenException } from '@nestjs/common'
import { Response } from 'express'
import { ErrorCodeEnum } from '../provider/error-provider'

@Catch(ForbiddenException)
export class ForbiddenFilter implements ExceptionFilter {
  catch(exception: ForbiddenException, host: ArgumentsHost): any {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    return response.status(403).json({
      meta: {
        statusCode: 403,
        errorCode: ErrorCodeEnum.FORBIDDEN_ERROR,
        message: exception?.message || 'Forbidden resource',
        errors: [exception?.message] || 'Forbidden resource'
      }
    })
  }
}
