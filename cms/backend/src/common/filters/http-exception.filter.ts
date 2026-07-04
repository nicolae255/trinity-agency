import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse =
      typeof exceptionResponse === 'string'
        ? { statusCode: status, message: exceptionResponse }
        : { statusCode: status, ...(exceptionResponse as object) };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('Server error:', exception.message, exception.stack);
    }

    response.status(status).json(errorResponse);
  }
}
