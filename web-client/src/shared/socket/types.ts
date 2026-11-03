/* eslint-disable @typescript-eslint/no-explicit-any */
export type SocketNamespace = '/orders' | '/notifications' | '/chat' | '/delivery' | '/';

export interface OrderCreatedPayload {
  event: 'order:created';
  orderId: string;
  order: any;
  createdAt: string;
}

export interface OrderStatusUpdatedPayload {
  event: 'order:status_updated';
  orderId: string;
  status: string;
  order?: any;
  updatedAt: string;
}

export interface NotificationReceivedPayload {
  event: 'notification:received';
  notification: {
    id: string;
    content?: string;
    description?: string;
    createdAt: string;
    isRead?: boolean;
    type?: string;
    receiveUser?: string;
    [key: string]: any;
  };
  receivedAt: string;
}

export interface ChatMessageSentPayload {
  event: 'chat:message_sent';
  conversationId: string;
  message: {
    id: string;
    content: string;
    messageType?: string;
    attachmentUrl?: string;
    attachmentType?: string;
    isRead?: boolean;
    readAt?: string | Date;
    isEdited?: boolean;
    editedAt?: string | Date;
    isDeleted?: boolean;
    deletedAt?: string | Date;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    metadata?: any;
    replyToMessageId?: string;
    sender: {
      id: string;
      name?: string;
      email?: string;
      avatar?: string;
      phone?: string;
      [key: string]: any;
    };
    conversation?: {
      id: string;
      conversationType?: string;
      orderId?: string;
      restaurantId?: string;
    };
    [key: string]: any;
  };
  sentAt: string;
}

export interface ChatMessagesReadPayload {
  event: 'chat:messages_read';
  conversationId: string;
  userId?: string;
  readAt: string;
}

export interface ChatTypingPayload {
  conversationId: string;
  userId?: string;
  isTyping: boolean;
}

export interface DeliveryOfferPayload {
  event: 'delivery:offer';
  targetShipperId: string;
  offer: any;
  offeredAt: string;
}

export interface DeliveryAssignedPayload {
  event: 'delivery:assigned';
  orderId: string;
  shipperId: string;
  assignedAt: string;
}

export interface DeliveryLocationUpdatedPayload {
  event: 'delivery:location_updated';
  shipperId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
  orderId?: string;
}
