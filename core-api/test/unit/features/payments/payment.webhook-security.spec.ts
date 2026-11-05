import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentController } from 'src/features/payments/payment.controller';
import { MomoPaymentGateway } from 'src/infra/payment-gateways/momo-payment.gateway';

describe('Payment Webhook Security & Signature Hardening', () => {
  let controller: PaymentController;
  let mockPaymentService: { handleWebhookEvent: jest.Mock };
  let mockConfigService: { get: jest.Mock };
  let momoGateway: MomoPaymentGateway;

  const mockSecretKey = 'momo-secret-key-xyz-123';
  const mockAccessKey = 'momo-access-key-abc-456';
  const mockPartnerCode = 'MOMO';

  beforeEach(() => {
    mockPaymentService = {
      handleWebhookEvent: jest.fn().mockResolvedValue({
        acknowledged: true,
        duplicate: false,
        outcome: 'succeeded',
      }),
    };

    mockConfigService = {
      get: jest.fn((key: string, fallback?: string) => {
        if (key === 'MOMO_SECRET_KEY') return mockSecretKey;
        if (key === 'MOMO_ACCESS_KEY') return mockAccessKey;
        if (key === 'MOMO_PARTNER_CODE') return mockPartnerCode;
        if (key === 'NODE_ENV') return 'production';
        return fallback;
      }),
    };

    controller = new PaymentController(
      mockPaymentService as never,
      mockConfigService as never,
    );

    momoGateway = new MomoPaymentGateway(mockConfigService as never);
    momoGateway.initialize({
      environment: 'production',
      apiKey: mockAccessKey,
      secretKey: mockSecretKey,
    });
  });

  describe('PaymentController - Signature Extraction from Header & Body', () => {
    it('accepts valid signature from x-payment-signature header', async () => {
      const payload = {
        partnerCode: 'MOMO',
        orderId: 'order-123',
        requestId: 'req-456',
        amount: 50000,
        orderInfo: 'order-123',
        transId: 'trans-789',
      };

      const result = await controller.handleWebhook(payload as never, 'header-signature-123');

      expect(mockPaymentService.handleWebhookEvent).toHaveBeenCalledWith(
        payload,
        'header-signature-123',
      );
      expect(result).toEqual({ acknowledged: true, duplicate: false, outcome: 'succeeded' });
    });

    it('accepts signature from payload.signature in body when header is absent', async () => {
      const payload = {
        partnerCode: 'MOMO',
        orderId: 'order-123',
        requestId: 'req-456',
        amount: 50000,
        orderInfo: 'order-123',
        transId: 'trans-789',
        signature: 'body-signature-456',
      };

      const result = await controller.handleWebhook(payload as never, undefined);

      expect(mockPaymentService.handleWebhookEvent).toHaveBeenCalledWith(
        payload,
        'body-signature-456',
      );
      expect(result).toEqual({ acknowledged: true, duplicate: false, outcome: 'succeeded' });
    });

    it('throws BadRequestException when signature is missing from both header and body', async () => {
      const payload = {
        partnerCode: 'MOMO',
        orderId: 'order-123',
        requestId: 'req-456',
        amount: 50000,
        orderInfo: 'order-123',
        transId: 'trans-789',
      };

      await expect(controller.handleWebhook(payload as never, undefined)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPaymentService.handleWebhookEvent).not.toHaveBeenCalled();
    });
  });

  describe('MomoPaymentGateway - Strict HMAC-SHA256 Verification', () => {
    it('verifies standard MoMo v2 IPN payload signature', () => {
      const payload = {
        partnerCode: mockPartnerCode,
        orderId: 'order-100',
        requestId: 'req-200',
        amount: 150000,
        orderInfo: 'order-100',
        orderType: 'momo_wallet',
        transId: 'trans-999999',
        resultCode: 0,
        message: 'Successful.',
        payType: 'qr',
        responseTime: 1672531199000,
        extraData: '',
      };

      const rawSignature =
        `accessKey=${mockAccessKey}` +
        `&amount=${payload.amount}` +
        `&extraData=${payload.extraData}` +
        `&message=${payload.message}` +
        `&orderId=${payload.orderId}` +
        `&orderInfo=${payload.orderInfo}` +
        `&orderType=${payload.orderType}` +
        `&partnerCode=${payload.partnerCode}` +
        `&payType=${payload.payType}` +
        `&requestId=${payload.requestId}` +
        `&responseTime=${payload.responseTime}` +
        `&resultCode=${payload.resultCode}` +
        `&transId=${payload.transId}`;

      const validSignature = crypto
        .createHmac('sha256', mockSecretKey)
        .update(rawSignature)
        .digest('hex');

      const isValid = momoGateway.verifyWebhookSignature(payload, validSignature);
      expect(isValid).toBe(true);
    });

    it('rejects tampered webhook payload where amount or transId was modified', () => {
      const payload = {
        partnerCode: mockPartnerCode,
        orderId: 'order-100',
        requestId: 'req-200',
        amount: 150000,
        orderInfo: 'order-100',
        orderType: 'momo_wallet',
        transId: 'trans-999999',
        resultCode: 0,
        message: 'Successful.',
        payType: 'qr',
        responseTime: 1672531199000,
        extraData: '',
      };

      // Attacker tries to pass an altered amount with fake signature
      const tamperedPayload = { ...payload, amount: 1000 };
      const forgedSignature = 'forged-fake-signature-hash';

      const isValid = momoGateway.verifyWebhookSignature(tamperedPayload, forgedSignature);
      expect(isValid).toBe(false);
    });

    it('verifies simplified signature format for backwards compatibility', () => {
      const payload = {
        partnerCode: mockPartnerCode,
        orderId: 'order-100',
        requestId: 'req-200',
      };

      const rawSignature =
        `accessKey=${mockAccessKey}` +
        `&orderId=${payload.orderId}` +
        `&partnerCode=${payload.partnerCode}` +
        `&requestId=${payload.requestId}`;

      const validSignature = crypto
        .createHmac('sha256', mockSecretKey)
        .update(rawSignature)
        .digest('hex');

      const isValid = momoGateway.verifyWebhookSignature(payload, validSignature);
      expect(isValid).toBe(true);
    });
  });
});

