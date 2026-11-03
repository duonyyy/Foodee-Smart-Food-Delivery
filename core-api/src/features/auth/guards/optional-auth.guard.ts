import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { extractBearerToken } from '../utils/auth-token.util';

interface JwtPayload {
  sub: string;
  [key: string]: unknown;
}

interface RequestWithAuth {
  headers: { authorization?: string };
  user?: JwtPayload & { id: string; uid: string };
}

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      return true;
    }

    try {
      const token = extractBearerToken(authorization);
      const jwtSecret = this.configService.get<string>('JWT_SECRET');

      if (jwtSecret && token) {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
          secret: jwtSecret,
        });
        request.user = { ...payload, id: payload.sub, uid: payload.sub };
      }
    } catch {
      // Token expired or invalid - allow request to proceed as unauthenticated guest
      this.logger.debug('Optional token verification failed, proceeding as guest');
    }

    return true;
  }
}
