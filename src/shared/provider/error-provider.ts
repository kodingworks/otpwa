export enum ErrorCodeEnum {
  BAD_REQUEST_ERROR = 'BAD_REQUEST_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  FORBIDDEN_ERROR = 'FORBIDDEN_ERROR',
  UNAUTHORIZED_ERROR = 'UNAUTHORIZED_ERROR',
  ERROR_OTP_EXPIRED = 'ERROR_OTP_EXPIRED',
  ERROR_OTP_INVALID = 'ERROR_OTP_INVALID'
}

export interface CustomError {
  meta: {
    errors?: any[]
    message?: string | string[]
    statusCode?: number
    errorCode?: ErrorCodeEnum
    fields?: any
  }
}

export class BadRequestError implements CustomError {
  meta: {
    errors: any[]
    message: string
    statusCode: number
    errorCode: ErrorCodeEnum
  }
  constructor(message: string, meta?: CustomError['meta']) {
    this.meta = {
      message: message || 'Bad Request',
      errors: [message],
      statusCode: (meta && meta?.statusCode) || 400,
      errorCode: (meta && meta?.errorCode) || ErrorCodeEnum.BAD_REQUEST_ERROR
    }
  }
}

export class InternalServerError implements CustomError {
  meta: {
    errors: any[]
    message: string
    statusCode: number
    errorCode: ErrorCodeEnum
  }
  constructor(message?: string, meta?: CustomError['meta']) {
    this.meta = {
      message: message || 'Internal Server Error',
      errors: [message],
      statusCode: (meta && meta?.statusCode) || 500,
      errorCode: (meta && meta?.errorCode) || ErrorCodeEnum.INTERNAL_SERVER_ERROR
    }
  }
}

export class NotFoundError implements CustomError {
  meta: {
    errors: any[]
    message: string
    statusCode: number
    errorCode: ErrorCodeEnum
  }
  constructor(message?: string, meta?: CustomError['meta']) {
    this.meta = {
      message: message || 'Document Not Found!',
      errors: [message],
      statusCode: (meta && meta?.statusCode) || 404,
      errorCode: (meta && meta?.errorCode) || ErrorCodeEnum.NOT_FOUND_ERROR
    }
  }
}

export class ValidationError implements CustomError {
  meta: {
    errors: any[]
    message: string | string[]
    statusCode: number
    errorCode: ErrorCodeEnum
  }
  constructor(message?: string | string[], meta?: CustomError['meta']) {
    if (Array.isArray(message)) {
      this.meta = {
        message: message[0] || 'Validation error',
        errors: message || ['Validation error'],
        statusCode: (meta && meta?.statusCode) || 422,
        errorCode: (meta && meta?.errorCode) || ErrorCodeEnum.VALIDATION_ERROR
      }
    } else {
      this.meta = {
        message: message || 'Validation error',
        errors: [message || 'Validation error'],
        statusCode: (meta && meta?.statusCode) || 422,
        errorCode: (meta && meta?.errorCode) || ErrorCodeEnum.VALIDATION_ERROR
      }
    }
  }
}

export class UnauthorizedError implements CustomError {
  meta: {
    errors: any[]
    message: string
    statusCode: number
    errorCode: ErrorCodeEnum
  }
  constructor(message?: string, meta?: CustomError['meta']) {
    this.meta = {
      message: message || 'Authorization Error',
      errors: [message || 'Authorization Error'],
      statusCode: (meta && meta?.statusCode) || 401,
      errorCode: (meta && meta?.errorCode) || ErrorCodeEnum.UNAUTHORIZED_ERROR
    }
  }
}

export class ForbiddenError implements CustomError {
  meta: {
    errors: any[]
    message: string
    statusCode: number
    errorCode: ErrorCodeEnum
  }
  constructor(message?: string, meta?: CustomError['meta']) {
    this.meta = {
      message: message || `You don't have permission to access this route / on this server!`,
      errors: [message || `You don't have permission to access this route / on this server!`],
      statusCode: (meta && meta?.statusCode) || 403,
      errorCode: (meta && meta?.errorCode) || ErrorCodeEnum.FORBIDDEN_ERROR
    }
  }
}
