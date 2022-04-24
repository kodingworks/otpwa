import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { Response } from 'express'
import { ErrorCodeEnum } from '../provider/error-provider'
import { ValidationException } from './validation.exception'

@Catch(ValidationException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost): any {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    return response.status(422).json({
      meta: {
        statusCode: 422,
        errorCode: ErrorCodeEnum.VALIDATION_ERROR,
        message: 'Validation error',
        errors: exception.validationErrors
      }
    })
  }
}
