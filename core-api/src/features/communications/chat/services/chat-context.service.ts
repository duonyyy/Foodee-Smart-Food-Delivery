import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FoodIntegrationService } from 'src/features/menu/public-api';
import { OrderMessagingService } from 'src/features/orders/public-api';
import { ChatContext, ChatMenuItem } from '../types/chat.types';

@Injectable()
export class ChatContextService {
  constructor(
    private readonly catalogReader: FoodIntegrationService,
    private readonly orderMessaging: OrderMessagingService,
    @Optional() private readonly configService?: ConfigService,
  ) {}

  async getContext(userId?: string): Promise<ChatContext> {
    const menuPromise = this.catalogReader.listAvailableFoods();
    const orderHistoryPromise = userId
      ? this.orderMessaging.getRecentOrdersForReorder(userId, 5).catch(() => [])
      : Promise.resolve([]);

    const [menu, orderHistory] = await Promise.all([menuPromise, orderHistoryPromise]);

    const orderedFoods =
      orderHistory?.flatMap((order) => order.orderDetails.map((detail) => detail.foodName)) ?? [];

    const rawFrontendUrl =
      this.configService?.get<string>('FRONTEND_URL') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';
    const frontendUrl = rawFrontendUrl.replace(/\/$/, '');

    const menuFlat: ChatMenuItem[] = menu.map((food) => ({
      id: food.foodId,
      name: food.name,
      price: food.price,
      description: food.description ?? undefined,
      image: food.image || 'https://via.placeholder.com/80x80',
      link: `${frontendUrl}/food/${food.foodId}`,
      restaurantId: food.restaurantId,
      restaurantName: food.restaurantName,
    }));

    return { menuFlat, orderedFoods };
  }
}
