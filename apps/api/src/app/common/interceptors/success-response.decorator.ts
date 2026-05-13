import { SetMetadata } from '@nestjs/common';
import { SUCCESS_MESSAGE_KEY } from './success-response.interceptor';

export const SuccessResponse = (message: string) =>
  SetMetadata(SUCCESS_MESSAGE_KEY, message);
