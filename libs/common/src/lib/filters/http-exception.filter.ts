import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse() as
      | string
      | { message: string | string[]; statusCode: number };

    let errorMessage: string | string[];

    if (typeof errorResponse === 'string') {
      errorMessage = errorResponse;
    } else {
      errorMessage = errorResponse.message;
    }

    const responseBody: ApiResponse<null> = {
      success: false,
      message: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage,
      statusCode: status,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`${request.method} ${request.url}`, exception.stack);
    } else {
      this.logger.log(
        `${request.method} ${request.url} - ${JSON.stringify(responseBody)}`
      );
    }

    response.status(status).json(responseBody);
  }
}
