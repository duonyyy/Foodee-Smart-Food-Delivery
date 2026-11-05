import { Order } from 'src/entities/order.entity';

export interface OrderSocketResponseDto {
  id: string;
  status: string;
  total?: number;
  note?: string;
  date?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  paymentMethod?: string;
  isPaid?: boolean;
  deliveryDistance?: number;
  estimatedDeliveryTime?: number;
  deliveryType?: 'asap' | 'scheduled';
  requestedDeliveryTime?: string;
  shippingFee?: number;
  shipperEarnings?: number;
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  restaurant?: {
    id: string;
    name?: string;
    image?: string;
    address?: string;
  };
  orderDetails?: Array<{
    id?: string;
    quantity: number;
    price: string | number;
    foodNameSnapshot?: string;
    unitPriceSnapshot?: number;
    selectedToppings?: unknown[];
    food?: {
      id: string;
      name?: string;
      image?: string;
    };
  }>;
  shippingDetail?: {
    id: string;
    status: string;
    estimatedDeliveryTime?: Date;
    actualDeliveryTime?: Date;
    shipper?: {
      id: string;
      name?: string;
      phone?: string;
    };
  };
}

export function toOrderSocketDto(order: Order): OrderSocketResponseDto {
  if (!order) return order as unknown as OrderSocketResponseDto;

  return {
    id: order.id,
    status: order.status,
    total: order.total != null ? Number(order.total) : undefined,
    note: order.note ?? '',
    date: order.date,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    paymentMethod: order.paymentMethod,
    isPaid: Boolean(order.isPaid),
    deliveryDistance: order.deliveryDistance != null ? Number(order.deliveryDistance) : undefined,
    estimatedDeliveryTime: order.estimatedDeliveryTime,
    deliveryType: order.deliveryType,
    requestedDeliveryTime: order.requestedDeliveryTime,
    shippingFee: order.shippingFee,
    shipperEarnings: order.shipperEarnings,
    user: order.user
      ? {
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
          avatar: order.user.avatar,
        }
      : undefined,
    restaurant: order.restaurant
      ? {
          id: order.restaurant.id,
          name: order.restaurant.name,
          image: order.restaurant.avatar || order.restaurant.backgroundImage,
        }
      : undefined,
    orderDetails: order.orderDetails?.map((detail) => ({
      id: detail.id,
      quantity: detail.quantity,
      price: detail.price,
      foodNameSnapshot: detail.foodNameSnapshot,
      unitPriceSnapshot: detail.unitPriceSnapshot,
      selectedToppings: detail.selectedToppings,
      food: detail.food
        ? {
            id: detail.food.id,
            name: detail.food.name,
            image: detail.food.image,
          }
        : undefined,
    })),
    shippingDetail: order.shippingDetail
      ? {
          id: order.shippingDetail.id,
          status: order.shippingDetail.status,
          estimatedDeliveryTime: order.shippingDetail.estimatedDeliveryTime,
          actualDeliveryTime: order.shippingDetail.actualDeliveryTime,
          shipper: order.shippingDetail.shipper
            ? {
                id: order.shippingDetail.shipper.id,
                name: order.shippingDetail.shipper.name,
                phone: order.shippingDetail.shipper.phone,
              }
            : undefined,
        }
      : undefined,
  };
}

