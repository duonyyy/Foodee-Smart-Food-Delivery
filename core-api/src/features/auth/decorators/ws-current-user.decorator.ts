import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsAuthenticatedUser } from '../guards/ws-jwt.guard';

export const WsCurrentUser = createParamDecorator(
  (data: keyof WsAuthenticatedUser | undefined, context: ExecutionContext) => {
    const client = context.switchToWs().getClient<Socket>();
    const user = client.data?.user as WsAuthenticatedUser | undefined;
    if (!user) {
      return null;
    }
    return data ? user[data] : user;
  },
);
