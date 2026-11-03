import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { extractWsToken, WsJwtGuard } from '../../../../../src/features/auth/guards/ws-jwt.guard';

describe('WsJwtGuard', () => {
  let guard: WsJwtGuard;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let configService: jest.Mocked<Partial<ConfigService>>;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    };
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        return undefined;
      }),
    };

    guard = new WsJwtGuard(jwtService as JwtService, configService as ConfigService);
  });

  const createMockExecutionContext = (client: Partial<Socket>): ExecutionContext => {
    return {
      switchToWs: () => ({
        getClient: () => client as Socket,
        getData: () => ({}),
      }),
      getType: () => 'ws',
    } as unknown as ExecutionContext;
  };

  describe('extractWsToken', () => {
    it('should extract raw token from handshake auth', () => {
      const client = {
        handshake: {
          auth: { token: 'sample-jwt-token' },
          headers: {},
        },
      } as unknown as Socket;

      expect(extractWsToken(client)).toBe('sample-jwt-token');
    });

    it('should extract token from Authorization header with Bearer prefix', () => {
      const client = {
        handshake: {
          auth: {},
          headers: { authorization: 'Bearer bearer-token-123' },
        },
      } as unknown as Socket;

      expect(extractWsToken(client)).toBe('bearer-token-123');
    });

    it('should return null when no token is provided', () => {
      const client = {
        handshake: {
          auth: {},
          headers: {},
        },
      } as unknown as Socket;

      expect(extractWsToken(client)).toBeNull();
    });
  });

  describe('canActivate', () => {
    it('should authenticate client and attach user to socket data', async () => {
      const client = {
        handshake: {
          auth: { token: 'valid-token' },
        },
        data: {},
      } as unknown as Socket;

      const mockPayload = { sub: 'user-uuid-1', role: 'customer' };
      (jwtService.verifyAsync as jest.Mock).mockResolvedValueOnce(mockPayload);

      const context = createMockExecutionContext(client);
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(client.data.user).toEqual({
        sub: 'user-uuid-1',
        role: 'customer',
        id: 'user-uuid-1',
        uid: 'user-uuid-1',
      });
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: 'test-secret',
      });
    });

    it('should throw WsException when token is missing', async () => {
      const client = {
        handshake: { auth: {} },
        data: {},
      } as unknown as Socket;

      const context = createMockExecutionContext(client);
      await expect(guard.canActivate(context)).rejects.toThrow(WsException);
    });

    it('should throw WsException when jwt verification fails', async () => {
      const client = {
        handshake: { auth: { token: 'invalid-token' } },
        data: {},
      } as unknown as Socket;

      (jwtService.verifyAsync as jest.Mock).mockRejectedValueOnce(new Error('jwt expired'));

      const context = createMockExecutionContext(client);
      await expect(guard.canActivate(context)).rejects.toThrow(WsException);
    });
  });
});
