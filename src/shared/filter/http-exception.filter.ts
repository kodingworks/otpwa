import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common'
import { ErrorCodeEnum } from 'src/shared/provider/error-provider'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const error: any = exception.getResponse()
    const status = exception.getStatus()

    let errorCode = ErrorCodeEnum.INTERNAL_SERVER_ERROR
    switch (status) {
      case 400:
        errorCode = ErrorCodeEnum.BAD_REQUEST_ERROR
        break
      case 401:
        errorCode = ErrorCodeEnum.UNAUTHORIZED_ERROR
        break
      case 403:
        errorCode = ErrorCodeEnum.FORBIDDEN_ERROR
        break
      case 404:
        errorCode = ErrorCodeEnum.NOT_FOUND_ERROR
        break
      case 422:
        errorCode = ErrorCodeEnum.VALIDATION_ERROR
        break
      default:
        errorCode = ErrorCodeEnum.INTERNAL_SERVER_ERROR
    }
    let metaData
    // Internal Server Error / (Unidentified Error)
    if (!error?.meta?.statusCode) {
      const message = errorCode === ErrorCodeEnum.VALIDATION_ERROR ? exception?.message[0] : exception?.message

      metaData = {
        message: message || 'Internal Server Error',
        errors: [exception?.message] || 'Internal Server Error',
        statusCode: status || 500,
        errorCode: response?.errorCode || errorCode
      }

      Logger.error(JSON.stringify(metaData))

      response.status(status).json({
        meta: metaData
      })
    } else {
      // Identified Error

      metaData = error
      response.status(status).json(error)
    }
  }
}
