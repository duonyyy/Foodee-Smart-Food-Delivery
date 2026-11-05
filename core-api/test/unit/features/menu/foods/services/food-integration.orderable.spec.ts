import { BadRequestException } from '@nestjs/common';
import { FoodIntegrationService } from 'src/features/menu/foods/services/food-integration.service';

describe('FoodIntegrationService orderable menu snapshot', () => {
  it('returns an immutable plain snapshot with food and selected topping values', async () => {
    const foodRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'food-1',
        name: 'Phở',
        price: '55000',
        status: 'available',
        restaurant: { id: 'restaurant-1', status: 'approved' },
        toppings: [{ id: 'topping-1', name: 'Trứng', price: '10000', isAvailable: true }],
      }),
    };
    const service = new FoodIntegrationService(foodRepository as never, {} as never);

    const result = await service.getOrderableItems({
      items: [{ foodId: 'food-1', toppingIds: ['topping-1'] }],
    });

    expect(result[0]).toEqual({
      foodId: 'food-1',
      restaurantId: 'restaurant-1',
      name: 'Phở',
      unitPrice: 55000,
      discountPercent: 0,
      status: 'available',
      isAvailable: true,
      toppings: [{ toppingId: 'topping-1', name: 'Trứng', unitPrice: 10000, isAvailable: true }],
    });
    expect(Object.isFrozen(result[0])).toBe(true);
    expect(Object.isFrozen(result[0].toppings)).toBe(true);
    expect(result[0]).not.toHaveProperty('restaurant');
    expect(result[0]).not.toHaveProperty('toppings[0].food');
  });

  it('captures live values at read time and does not change after the entity changes', async () => {
    const food = {
      id: 'food-1',
      name: 'Original',
      price: 10,
      status: 'available',
      restaurant: { id: 'restaurant-1', status: 'approved' },
      toppings: [{ id: 'topping-1', name: 'Old topping', price: 2, isAvailable: true }],
    };
    const repository = { findOne: jest.fn().mockResolvedValue(food) };
    const service = new FoodIntegrationService(repository as never, {} as never);

    const snapshot = (
      await service.getOrderableItems({
        items: [{ foodId: 'food-1', toppingIds: ['topping-1'] }],
      })
    )[0];
    food.name = 'Changed';
    food.price = 99;
    food.toppings[0].name = 'Changed topping';
    food.toppings[0].price = 77;

    expect(snapshot.name).toBe('Original');
    expect(snapshot.unitPrice).toBe(10);
  });

  it('rejects an unattached topping selection', async () => {
    const repository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'food-1',
        restaurant: { id: 'restaurant-1', status: 'approved' },
        toppings: [{ id: 'topping-1', name: 'Trứng', price: 10, isAvailable: true }],
      }),
    };
    const service = new FoodIntegrationService(repository as never, {} as never);

    await expect(
      service.getOrderableItems({
        items: [{ foodId: 'food-1', toppingIds: ['foreign-topping'] }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it.each(['pending', 'rejected'])(
    'marks available food from a %s restaurant as not orderable',
    async (restaurantStatus) => {
      const repository = {
        findOne: jest.fn().mockResolvedValue({
          id: 'food-1',
          name: 'Phở',
          price: 55_000,
          status: 'available',
          restaurant: { id: 'restaurant-1', status: restaurantStatus },
          toppings: [],
        }),
      };
      const service = new FoodIntegrationService(repository as never, {} as never);

      const [snapshot] = await service.getOrderableItems({
        items: [{ foodId: 'food-1', toppingIds: [] }],
      });

      expect(snapshot?.isAvailable).toBe(false);
    },
  );

  describe('reserveItemsInTransaction - Concurrency & Pessimistic Locking', () => {
    it('locks and atomically reserves available items within transaction', async () => {
      const foodEntity = {
        id: 'food-1',
        name: 'Bún bò Huế',
        status: 'available',
        soldCount: 10,
        purchasedNumber: 15,
      };

      const mockFoodRepo = {
        findOne: jest.fn().mockResolvedValue(foodEntity),
        save: jest.fn().mockImplementation((val) => Promise.resolve(val)),
      };

      const mockManager = {
        getRepository: jest.fn().mockReturnValue(mockFoodRepo),
      };

      const service = new FoodIntegrationService({} as never, {} as never);

      await service.reserveItemsInTransaction(
        [{ foodId: 'food-1', quantity: 3, foodName: 'Bún bò Huế' }],
        mockManager as never,
      );

      expect(mockFoodRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'food-1' },
        lock: { mode: 'pessimistic_write' },
      });
      expect(mockFoodRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'food-1',
          soldCount: 13,
          purchasedNumber: 18,
        }),
      );
    });

    it('rejects with BadRequestException if any item is unavailable', async () => {
      const unavailableFood = {
        id: 'food-2',
        name: 'Cơm tấm sườn',
        status: 'unavailable',
      };

      const mockFoodRepo = {
        findOne: jest.fn().mockResolvedValue(unavailableFood),
        save: jest.fn(),
      };

      const mockManager = {
        getRepository: jest.fn().mockReturnValue(mockFoodRepo),
      };

      const service = new FoodIntegrationService({} as never, {} as never);

      await expect(
        service.reserveItemsInTransaction(
          [{ foodId: 'food-2', quantity: 1, foodName: 'Cơm tấm sườn' }],
          mockManager as never,
        ),
      ).rejects.toThrow('Food "Cơm tấm sườn" is currently unavailable or sold out');

      expect(mockFoodRepo.save).not.toHaveBeenCalled();
    });
  });
});
