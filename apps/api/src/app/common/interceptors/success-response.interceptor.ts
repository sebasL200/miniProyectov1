import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';

export const SUCCESS_MESSAGE_KEY = 'success_message';

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        const message =
          this.reflector.get<string>(
            SUCCESS_MESSAGE_KEY,
            context.getHandler(),
          ) || 'Success';

        return {
          success: true,
          message,
          data,
        };
      }),
    );
  }
}
