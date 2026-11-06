import { Injectable } from '@nestjs/common';
import { AddressService } from 'src/features/locations/public-api';
import { FoodIntegrationService } from 'src/features/menu/public-api';
import { ChatMetadata } from '../types/chat.types';

export interface ValidatedChatOrderItem {
  foodId: string;
  name: string;
  quantity: number;
  price: number;
  restaurantId: string;
}

export interface ValidatedChatOrder {
  restaurantId: string;
  addressId: string;
  paymentMethod: 'cod' | 'card';
  orderItems: ValidatedChatOrderItem[];
}

export interface ChatOrderValidationResult {
  valid: boolean;
  reason?: string;
  action?: string;
  order?: ValidatedChatOrder;
}

@Injectable()
export class ChatOrderValidationService {
  constructor(
    private readonly catalogReader: FoodIntegrationService,
    private readonly locationReader: AddressService,
  ) {}

  async validate(userId: string, metadata: ChatMetadata): Promise<ChatOrderValidationResult> {
    const paymentMethod = metadata.selectedPaymentMethod;
    if (!paymentMethod) {
      return {
        valid: false,
        action: 'choosePayment',
        reason: 'Please choose payment method: COD or card.',
      };
    }

    const addressId = metadata.selectedAddress?.id;
    if (!addressId) {
      return {
        valid: false,
        action: 'chooseAddress',
        reason: 'Please select a delivery address before checkout.',
      };
    }

    const userAddresses = await this.locationReader.listOwnedAddresses(userId);
    const addressBelongsToUser = userAddresses.some((address) => address.addressId === addressId);
    if (!addressBelongsToUser) {
      return {
        valid: false,
        action: 'chooseAddress',
        reason: 'Invalid delivery address. Please select your address again.',
      };
    }

    if (!metadata.orderItems.length) {
      return {
        valid: false,
        action: 'retryOrder',
        reason: 'Order items information is incomplete. Please select items again.',
      };
    }

    const validatedItems: ValidatedChatOrderItem[] = [];
    let restaurantId: string | null = null;

    for (const item of metadata.orderItems) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return {
          valid: false,
          action: 'retryOrder',
          reason: `Invalid quantity for item "${item.name}". Please reselect item.`,
        };
      }

      const food = await this.catalogReader.findAvailableFood(item.id, item.restaurantId);
      if (!food) {
        return {
          valid: false,
          action: 'retryOrder',
          reason: `Item "${item.name}" not found in current menu. Please reselect item.`,
        };
      }

      const foodRestaurantId = food.restaurantId;
      if (!foodRestaurantId) {
        return {
          valid: false,
          action: 'retryOrder',
          reason: `Cannot determine restaurant for item "${item.name}". Please reselect item.`,
        };
      }

      if (!restaurantId) {
        restaurantId = foodRestaurantId;
      }

      if (restaurantId !== foodRestaurantId) {
        return {
          valid: false,
          action: 'retryOrder',
          reason: 'All items in an order must be from the same restaurant. Please reselect items.',
        };
      }

      validatedItems.push({
        foodId: food.foodId,
        name: food.name,
        quantity,
        price: food.price,
        restaurantId: foodRestaurantId,
      });
    }

    if (!restaurantId) {
      return {
        valid: false,
        action: 'retryOrder',
        reason: 'Cannot determine restaurant for this order. Please reselect items.',
      };
    }

    return {
      valid: true,
      order: {
        restaurantId,
        addressId,
        paymentMethod,
        orderItems: validatedItems,
      },
    };
  }

  parsePaymentMethod(userMessage: string): 'cod' | 'card' | null {
    const lowerMessage = userMessage.toLowerCase().trim();

    if (lowerMessage.includes('cod') || lowerMessage.includes('tiền mặt')) {
      return 'cod';
    }

    if (lowerMessage.includes('card') || lowerMessage.includes('thẻ')) {
      return 'card';
    }

    return null;
  }
}
