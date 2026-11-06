export type ChatSender = "user" | "bot";

export interface FoodSuggestion {
  id: string;
  name: string;
  price: number;
  image?: string;
  link: string;
  restaurantName?: string;
  rating?: number;
}

export interface OrderPreview {
  orderId: string;
  totalAmount: number;
  orderDetails: {
    foodName: string;
    quantity: number;
  }[];
}

export interface ChatMessageModel {
  id: string;
  from: ChatSender;
  text?: string;
  foodCards?: FoodSuggestion[];
  action?: string;
  createdAt: Date;
  isError?: boolean;
  retryPayload?: string;
}

export interface ChatMetadata {
  orderItems: unknown[];
  addresses: unknown[];
  isOrdering: boolean;
  isFoodConfirmed: boolean;
  isRestaurantConfirmed: boolean;
  isAddressConfirmed: boolean;
  isPaymentConfirmed: boolean;
  selectedPaymentMethod?: "cod" | "card";
  selectedAddress?: {
    id: string;
    street: string;
    ward: string | null;
    district: string | null;
    city: string;
  };
  orderId?: string;
  total?: number;
  isQuickReorder?: boolean;
  quickOrderOptions?: OrderPreview[];
}

export interface ChatApiResponse {
  reply?:
    | string
    | {
        reply?: string;
        suggestions?: FoodSuggestion[];
        action?: string;
      };
  suggestions?: FoodSuggestion[];
  action?: string;
  metadata?: Partial<ChatMetadata>;
}
