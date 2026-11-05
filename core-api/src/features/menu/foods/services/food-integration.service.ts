import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Food } from 'src/entities/food.entity';
import { AppCacheService } from 'src/infra/cache/public-api';
import { EntityManager, In, Repository } from 'typeorm';
import { type CatalogChatFood } from '../../types/catalog-chat.types';
import { type FoodPreview } from '../../types/food-discovery.types';
import {
  type GetOrderableItemsRequest,
  type OrderableMenuItem,
  type OrderableTopping,
} from '../../types/menu.types';

/**
 * Service tích hợp liên module (Inter-module Integration):
 * Cung cấp dữ liệu món ăn tối thiểu, an toàn cho các feature khác:
 * - Orders
 * - AI Chatbot
 * - Reviews
 * - Restaurants exploration
 */
@Injectable()
export class FoodIntegrationService {
  constructor(
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
    @Optional() private readonly cache?: AppCacheService,
  ) {}

  listRestaurantFoodsCached(
    restaurantId: string,
    page: number,
    pageSize: number,
  ): Promise<FoodPreview[]> {
    const cacheKey = `restaurant:foods:${JSON.stringify([
      ['page', page],
      ['pageSize', pageSize],
      ['restaurantId', restaurantId],
    ])}`;
    if (!this.cache?.remember) {
      return this.listRestaurantFoods(restaurantId, page, pageSize);
    }
    return this.cache.remember(cacheKey, 60, () =>
      this.listRestaurantFoods(restaurantId, page, pageSize),
    );
  }

  /**
   * Batch load top available foods for multiple restaurants in a single SQL query (fixes N+1 in /restaurants/popular).
   */
  async listMultipleRestaurantsFoodsCached(
    restaurantIds: string[],
    limitPerRestaurant = 3,
  ): Promise<Map<string, FoodPreview[]>> {
    const uniqueIds = Array.from(new Set(restaurantIds.filter(Boolean)));
    const result = new Map<string, FoodPreview[]>(uniqueIds.map((id) => [id, []]));
    if (uniqueIds.length === 0) {
      return result;
    }

    const cacheKey = `restaurant:foods:batch:${JSON.stringify([
      ['limit', limitPerRestaurant],
      ['restaurantIds', [...uniqueIds].sort()],
    ])}`;

    const loadBatch = async (): Promise<Record<string, FoodPreview[]>> => {
      const grouped: Record<string, FoodPreview[]> = {};
      for (const id of uniqueIds) {
        grouped[id] = [];
      }

      if (typeof this.foodRepository.find === 'function') {
        const foods = await this.foodRepository.find({
          where: { restaurant: { id: In(uniqueIds) }, status: 'available' },
          relations: ['restaurant'],
          order: { soldCount: 'DESC' },
        });

        for (const food of foods) {
          const rId = food.restaurant?.id;
          if (!rId || !grouped[rId] || grouped[rId].length >= limitPerRestaurant) {
            continue;
          }
          grouped[rId].push({
            foodId: food.id,
            name: food.name ?? null,
            image: food.image ?? null,
            price: food.price == null ? null : Number(food.price),
            rating: food.rating == null ? null : Number(food.rating),
            soldCount: food.soldCount ?? null,
          });
        }
      }
      return grouped;
    };

    const cachedRecord = this.cache?.remember
      ? await this.cache.remember(cacheKey, 60, loadBatch)
      : await loadBatch();

    for (const id of uniqueIds) {
      result.set(id, cachedRecord[id] ?? []);
    }
    return result;
  }

  // --- 1. Restaurant discovery (Khám phá món ăn cho Restaurant/Search) ---

  async listRestaurantFoods(
    restaurantId: string,
    page: number,
    pageSize: number,
  ): Promise<FoodPreview[]> {
    const foods = await this.foodRepository.find({
      where: { restaurant: { id: restaurantId }, status: 'available' },
      order: { soldCount: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return foods.map((food) => ({
      foodId: food.id,
      name: food.name ?? null,
      image: food.image ?? null,
      price: food.price == null ? null : Number(food.price),
      rating: food.rating == null ? null : Number(food.rating),
      soldCount: food.soldCount ?? null,
    }));
  }

  // --- 2. Catalog chat (Hỗ trợ AI Chatbot gợi ý món ăn) ---

  async listAvailableFoods(): Promise<CatalogChatFood[]> {
    const loadCatalog = async (): Promise<CatalogChatFood[]> => {
      const foods = await this.foodRepository.find({
        where: { status: 'available' },
        relations: ['restaurant'],
        order: { name: 'ASC' },
      });

      return foods.flatMap((food) => this.toCatalogChatFoods(food));
    };

    if (this.cache?.remember) {
      return this.cache.remember('food:catalog:available', 60, loadCatalog);
    }
    return loadCatalog();
  }

  async findAvailableFood(foodId: string, restaurantId?: string): Promise<CatalogChatFood | null> {
    const food = await this.foodRepository.findOne({
      where: {
        id: foodId,
        status: 'available',
        ...(restaurantId ? { restaurant: { id: restaurantId } } : {}),
      },
      relations: ['restaurant'],
    });

    return food ? (this.toCatalogChatFoods(food)[0] ?? null) : null;
  }

  private toCatalogChatFoods(food: Food): CatalogChatFood[] {
    if (!food.restaurant?.id || String(food.restaurant.status) !== 'approved') {
      return [];
    }

    return [
      {
        foodId: food.id,
        restaurantId: food.restaurant.id,
        restaurantName: food.restaurant.name ?? '',
        name: food.name ?? '',
        description: food.description ?? null,
        image: food.image ?? null,
        price: Number(food.price),
      },
    ];
  }

  // --- 3. Food review target (Kiểm tra món ăn khi khách hàng đánh giá) ---

  async assertFoodExists(foodId: string): Promise<void> {
    const food = await this.foodRepository.findOne({
      where: { id: foodId },
      select: ['id'],
    });
    if (!food) {
      throw new NotFoundException(`Food with id ${foodId} not found`);
    }
  }

  // --- 4. Orderable menu (Xác thực thông tin và topping khi tạo đơn hàng) ---

  async getOrderableItems(request: GetOrderableItemsRequest): Promise<OrderableMenuItem[]> {
    if (request.items.length === 0) {
      return [];
    }

    // Batch fetch all requested foods in a single query when repository.find is available
    if (request.items.length > 1 && typeof this.foodRepository.find === 'function') {
      const uniqueFoodIds = Array.from(new Set(request.items.map((item) => item.foodId)));
      const foods = await this.foodRepository.find({
        where: { id: In(uniqueFoodIds) },
        relations: ['restaurant', 'toppings'],
      });
      const foodMap = new Map(foods.map((food) => [food.id, food]));

      return request.items.map((item) => {
        const food = foodMap.get(item.foodId);
        return this.mapEntityToOrderableMenuItem(item.foodId, food ?? null, item.toppingIds ?? []);
      });
    }

    return Promise.all(
      request.items.map((item) => this.toOrderableMenuItem(item.foodId, item.toppingIds ?? [])),
    );
  }

  private async toOrderableMenuItem(
    foodId: string,
    toppingIds: string[],
  ): Promise<OrderableMenuItem> {
    const food = await this.foodRepository.findOne({
      where: { id: foodId },
      relations: ['restaurant', 'toppings'],
    });
    return this.mapEntityToOrderableMenuItem(foodId, food, toppingIds);
  }

  private mapEntityToOrderableMenuItem(
    foodId: string,
    food: Food | null,
    toppingIds: string[],
  ): OrderableMenuItem {
    if (!food?.restaurant) throw new NotFoundException(`Food with ID ${foodId} not found`);

    const toppingsById = new Map((food.toppings ?? []).map((topping) => [topping.id, topping]));
    const toppings: OrderableTopping[] = toppingIds.map((toppingId) => {
      const topping = toppingsById.get(toppingId);
      if (!topping) {
        throw new BadRequestException(`Topping ${toppingId} is not attached to food ${foodId}`);
      }
      return Object.freeze({
        toppingId: topping.id,
        name: topping.name,
        unitPrice: Number(topping.price),
        isAvailable: topping.isAvailable === true,
      });
    });

    const status = food.status ?? null;
    const restaurantIsApproved = String(food.restaurant.status) === 'approved';
    return Object.freeze({
      foodId: food.id,
      restaurantId: food.restaurant.id,
      name: food.name ?? '',
      unitPrice: Number(food.price),
      discountPercent: Number(food.discountPercent) || 0,
      status,
      isAvailable:
        status === 'available' &&
        restaurantIsApproved &&
        toppings.every((topping) => topping.isAvailable),
      toppings: Object.freeze(toppings),
    });
  }

  /**
   * Acquire pessimistic write locks and reserve items within an order transaction.
   * Throws BadRequestException if any item is not available or sold out.
   */
  async reserveItemsInTransaction(
    items: Array<{ foodId: string; quantity: number; foodName?: string }>,
    manager: EntityManager,
  ): Promise<void> {
    const foodRepo = manager.getRepository(Food);
    for (const item of items) {
      const food = await foodRepo.findOne({
        where: { id: item.foodId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!food || food.status !== 'available') {
        throw new BadRequestException(
          `Food "${item.foodName || food?.name || item.foodId}" is currently unavailable or sold out`,
        );
      }
      food.soldCount = Number(food.soldCount || 0) + item.quantity;
      food.purchasedNumber = Number(food.purchasedNumber || 0) + item.quantity;
      await foodRepo.save(food);
    }
  }
}
