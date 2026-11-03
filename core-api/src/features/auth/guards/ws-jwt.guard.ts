import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export interface WsJwtPayload {
  sub: string;
  role?: string;
  [key: string]: unknown;
}

export interface WsAuthenticatedUser extends WsJwtPayload {
  id: string;
  uid: string;
}

export function extractWsToken(client: Socket): string | null {
  const auth = client.handshake?.auth as Record<string, unknown> | undefined;
  const headers = client.handshake?.headers as Record<string, unknown> | undefined;
  const query = client.handshake?.query as Record<string, unknown> | undefined;

  const rawToken: unknown =
    auth?.token ??
    auth?.Authorization ??
    headers?.authorization ??
    headers?.Authorization ??
    query?.token;

  if (typeof rawToken !== 'string') {
    return null;
  }

  const trimmed = rawToken.trim();
  if (trimmed.startsWith('Bearer ')) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = extractWsToken(client);

    if (!token) {
      throw new WsException('Unauthorized: No authentication token provided');
    }

    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not configured');
      }

      const payload = await this.jwtService.verifyAsync<WsJwtPayload>(token, {
        secret: jwtSecret,
      });

      const user: WsAuthenticatedUser = {
        ...payload,
        id: payload.sub,
        uid: payload.sub,
      };

      client.data = client.data || {};
      client.data.user = user;

      return true;
    } catch (error: unknown) {
      this.logger.warn(`WS Auth failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new WsException('Unauthorized: Invalid or expired token');
    }
  }
}
