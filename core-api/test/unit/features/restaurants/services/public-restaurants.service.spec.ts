import { RestaurantStatus } from 'src/entities/restaurant.entity';
import { PublicRestaurantsService } from 'src/features/restaurants/services/public-restaurants.service';

describe('PublicRestaurantsService discovery', () => {
  const repository = { findAndCount: jest.fn(), findOne: jest.fn() };
  const cache = {
    remember: jest.fn((_key: string, _ttl: number, loader: () => Promise<unknown>) => loader()),
  };
  const service = new PublicRestaurantsService(repository as never, cache as never);

  beforeEach(() => jest.clearAllMocks());

  it('only lists approved restaurants and returns response snapshots', async () => {
    repository.findAndCount.mockResolvedValue([
      [{ id: 'restaurant-1', name: 'Quán A', rating: '4.5', status: RestaurantStatus.APPROVED }],
      1,
    ]);

    const result = await service.findAll(1, 3);

    expect(repository.findAndCount).toHaveBeenCalledWith({
      where: { status: RestaurantStatus.APPROVED },
      relations: ['owner'],
      skip: 0,
      take: 3,
    });
    expect(cache.remember).toHaveBeenCalledWith(
      'restaurant:approved:[["page",1],["pageSize",3]]',
      60,
      expect.any(Function),
    );
    expect(result.items[0]).toMatchObject({
      id: 'restaurant-1',
      rating: 4.5,
      ownerId: null,
      address: null,
    });
  });

  it('normalizes nearby coordinates into a precision-6 geohash cache key and computes exact distance per caller', async () => {
    repository.findAndCount.mockResolvedValue([
      [
        {
          id: 'restaurant-1',
          name: 'Quán A',
          rating: '4.5',
          latitude: 10.7769,
          longitude: 106.7009,
          status: RestaurantStatus.APPROVED,
        },
      ],
      1,
    ]);

    const first = await service.findAll(1, 10, 10.7769, 106.7009);
    const second = await service.findAll(1, 10, 10.77695, 106.70092);

    // Both calls share the same geohash cell cache key
    expect(cache.remember.mock.calls[0]?.[0]).toBe(cache.remember.mock.calls[1]?.[0]);
    expect(cache.remember.mock.calls[0]?.[0]).toContain('"geohash"');
    expect(first.items[0]?.distance).toBe(0);
    expect(second.items[0]?.distance).toBeDefined();
  });
});
