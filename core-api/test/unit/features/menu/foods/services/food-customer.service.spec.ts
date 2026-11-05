import { FoodCustomerService } from 'src/features/menu/foods/services/food-customer.service';

describe('FoodCustomerService', () => {
  it('builds the user menu from Food ownership data without a Restaurant repository', async () => {
    const foodRepository = {
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'food-a',
            name: 'Burger',
            price: 10,
            description: 'Classic',
            image: 'burger.jpg',
            restaurant: { id: 'restaurant-a', name: 'Store A', address: { city: 'HCMC' } },
          },
          {
            id: 'food-b',
            name: 'Fries',
            price: 4,
            description: 'Crispy',
            image: 'fries.jpg',
            restaurant: { id: 'restaurant-a', name: 'Store A', address: { city: 'HCMC' } },
          },
        ]),
      })),
    };
    const cache = { remember: jest.fn(), deleteByPattern: jest.fn() };
    const service = new FoodCustomerService(
      foodRepository as never,
      {} as never,
      {} as never,
      { findRestaurant: jest.fn() } as never,
      cache as never,
      { getDistanceAndDuration: jest.fn() } as never,
    );

    await expect(service.getMenuForUser('user-a')).resolves.toEqual([
      {
        id: 'restaurant-a',
        name: 'Store A',
        address: { city: 'HCMC' },
        foods: [
          {
            id: 'food-a',
            name: 'Burger',
            price: 10,
            description: 'Classic',
            image: 'burger.jpg',
            restaurantId: 'restaurant-a',
          },
          {
            id: 'food-b',
            name: 'Fries',
            price: 4,
            description: 'Crispy',
            image: 'fries.jpg',
            restaurantId: 'restaurant-a',
          },
        ],
      },
    ]);
  });

  it('deduplicates restaurants and pre-filters by Haversine distance before calling Mapbox in findByName', async () => {
    const foods = [
      {
        id: 'food-1',
        name: 'Phở tái',
        restaurant: { id: 'rest-near', latitude: 10.777, longitude: 106.701 },
      },
      {
        id: 'food-2',
        name: 'Phở nạm',
        restaurant: { id: 'rest-near', latitude: 10.777, longitude: 106.701 },
      },
      {
        id: 'food-3',
        name: 'Phở xa',
        // Far away (~100km), should be pre-filtered out before calling Mapbox
        restaurant: { id: 'rest-far', latitude: 11.5, longitude: 107.5 },
      },
    ];
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(foods),
    };
    const foodRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const routeService = {
      getDistanceAndDuration: jest.fn().mockResolvedValue({ distanceKm: 1.2, durationMin: 8 }),
    };
    const service = new FoodCustomerService(
      foodRepository as never,
      {} as never,
      {} as never,
      { findRestaurant: jest.fn() } as never,
      { remember: jest.fn(), deleteByPattern: jest.fn() } as never,
      routeService as never,
    );

    const result = await service.findByName('Phở', 1, 10, 10.7769, 106.7009, 5);

    // Mapbox called only ONCE for 'rest-near' (deduplicated across 2 foods, 'rest-far' skipped by Haversine)
    expect(routeService.getDistanceAndDuration).toHaveBeenCalledTimes(1);
    expect(result.totalItems).toBe(2);
    expect(result.items).toHaveLength(2);
  });
});
