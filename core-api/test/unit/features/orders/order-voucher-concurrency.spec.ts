import { BadRequestException } from '@nestjs/common';
import { Promotion } from 'src/entities/promotion.entity';
import { PromotionRedemption, PromotionRedemptionStatus } from 'src/entities/promotion-redemption.entity';
import { Food } from 'src/entities/food.entity';
import { PromotionUsageService } from 'src/features/promotions/services/promotion-usage.service';
import { FoodIntegrationService } from 'src/features/menu/foods/services/food-integration.service';

describe('Order & Voucher Concurrency Hardening (50 Concurrent Requests Simulation)', () => {
  describe('Voucher Max Usage Concurrency', () => {
    it('allows exactly maxUsage redemptions and rejects all subsequent concurrent attempts without over-redemption', async () => {
      const MAX_USAGE = 10;
      const CONCURRENT_REQUESTS = 50;

      // In-memory simulation of PostgreSQL table with row-level pessimistic locking
      const sharedPromotion: Promotion = Object.assign(new Promotion(), {
        id: 'promo-limited-10',
        code: 'SALE50PERCENT',
        numberOfUsed: 0,
        maxUsage: MAX_USAGE,
        discountPercent: 50,
      });

      const redemptionsMap = new Map<string, PromotionRedemption>();

      // Emulate serial execution queue of PostgreSQL row locks for pessimistic_write
      let lockQueue: Promise<unknown> = Promise.resolve();

      const createMockManager = (orderId: string, customerId: string) => {
        const usageRepo = {
          findOne: jest.fn(async () => redemptionsMap.get(orderId) || null),
          count: jest.fn(async () => {
            let count = 0;
            for (const r of redemptionsMap.values()) {
              if (r.customerId === customerId && r.status === PromotionRedemptionStatus.COMMITTED) {
                count++;
              }
            }
            return count;
          }),
          create: jest.fn((val: unknown) => val as PromotionRedemption),
          save: jest.fn(async (val: PromotionRedemption) => {
            redemptionsMap.set(val.orderId, val);
            return val;
          }),
        };

        const promoRepo = {
          findOne: jest.fn(async () => {
            // Emulate database returning the shared locked row
            return sharedPromotion;
          }),
          save: jest.fn(async (val: Promotion) => {
            sharedPromotion.numberOfUsed = val.numberOfUsed;
            return val;
          }),
        };

        return {
          getRepository: jest.fn((entity: unknown) => {
            const name = (entity as { name?: string })?.name;
            return name === 'PromotionRedemption' ? usageRepo : promoRepo;
          }),
          // Simulate database transaction with row-level lock serialization
          runInLock: async <T>(fn: () => Promise<T>): Promise<T> => {
            const prev = lockQueue;
            let resolveLock!: () => void;
            lockQueue = new Promise<void>((res) => {
              resolveLock = res;
            });
            await prev;
            try {
              return await fn();
            } finally {
              resolveLock();
            }
          },
        };
      };

      const promotionUsageService = new PromotionUsageService({
        deleteByPattern: jest.fn(),
      } as never);

      // Simulate 50 concurrent customer requests hitting the checkout endpoint at the exact same moment
      const requests = Array.from({ length: CONCURRENT_REQUESTS }, (_, i) => ({
        orderId: `order-uuid-${i + 1}`,
        customerId: `customer-uuid-${i + 1}`, // 50 different customers
        promotionCode: 'SALE50PERCENT',
        subtotal: 100_000,
        discountAmount: 50_000,
      }));

      const results = await Promise.allSettled(
        requests.map(async (req) => {
          const manager = createMockManager(req.orderId, req.customerId);
          return manager.runInLock(() =>
            promotionUsageService.useInTransaction(req, manager as never),
          );
        }),
      );

      const successfulRedemptions = results.filter((r) => r.status === 'fulfilled');
      const rejectedRedemptions = results.filter((r) => r.status === 'rejected');

      // VERIFICATION: Exactly 10 succeeded, exactly 40 rejected
      expect(successfulRedemptions.length).toBe(MAX_USAGE);
      expect(rejectedRedemptions.length).toBe(CONCURRENT_REQUESTS - MAX_USAGE);

      // VERIFICATION: Promotion numberOfUsed is exactly 10, never 11 or 50
      expect(sharedPromotion.numberOfUsed).toBe(MAX_USAGE);

      // VERIFICATION: Rejections threw standard BadRequestException('Promotion usage limit reached')
      for (const rej of rejectedRedemptions) {
        if (rej.status === 'rejected') {
          expect(rej.reason).toBeInstanceOf(BadRequestException);
          expect((rej.reason as Error).message).toBe('Promotion usage limit reached');
        }
      }
    });
  });

  describe('Inventory & Stock Race Condition Concurrency', () => {
    it('atomically increments food sales count without lost updates under 50 concurrent orders', async () => {
      const CONCURRENT_ORDERS = 50;
      const sharedFood: Food = Object.assign(new Food(), {
        id: 'food-pho-bo',
        name: 'Phở Bò Đặc Biệt',
        status: 'available',
        soldCount: 0,
        purchasedNumber: 0,
      });

      let lockQueue: Promise<unknown> = Promise.resolve();

      const createFoodMockManager = () => {
        const foodRepo = {
          findOne: jest.fn(async () => sharedFood),
          save: jest.fn(async (val: Food) => {
            sharedFood.soldCount = val.soldCount;
            sharedFood.purchasedNumber = val.purchasedNumber;
            return val;
          }),
        };

        return {
          getRepository: jest.fn().mockReturnValue(foodRepo),
          runInLock: async <T>(fn: () => Promise<T>): Promise<T> => {
            const prev = lockQueue;
            let resolveLock!: () => void;
            lockQueue = new Promise<void>((res) => {
              resolveLock = res;
            });
            await prev;
            try {
              return await fn();
            } finally {
              resolveLock();
            }
          },
        };
      };

      const foodIntegrationService = new FoodIntegrationService({} as never, {} as never);

      // 50 concurrent orders, each ordering 2 bowls of pho
      const orders = Array.from({ length: CONCURRENT_ORDERS }, (_, i) => ({
        foodId: 'food-pho-bo',
        quantity: 2,
        foodName: 'Phở Bò Đặc Biệt',
        orderIndex: i,
      }));

      await Promise.all(
        orders.map(async (order) => {
          const manager = createFoodMockManager();
          return manager.runInLock(() =>
            foodIntegrationService.reserveItemsInTransaction([order], manager as never),
          );
        }),
      );

      // VERIFICATION: No lost updates. 50 orders * 2 = exactly 100 sold count & purchased number
      expect(sharedFood.soldCount).toBe(100);
      expect(sharedFood.purchasedNumber).toBe(100);
    });
  });
});

