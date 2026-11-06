import { Injectable, Logger } from '@nestjs/common';
import { GeneralChatFlowService } from './flows/general-chat-flow.service';
import { OrderConversationFlowService } from './flows/order-conversation-flow.service';
import { QuickReorderFlowService } from './flows/quick-reorder-flow.service';
import { ChatContextService } from './services/chat-context.service';
import { ChatHistoryItem, ChatMetadata, ChatReply } from './types/chat.types';
import { createInitialChatMetadata, normalizeChatMetadata } from './utils/chat-metadata.factory';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  constructor(
    private readonly chatContextService: ChatContextService,
    private readonly quickReorderFlowService: QuickReorderFlowService,
    private readonly orderConversationFlowService: OrderConversationFlowService,
    private readonly generalChatFlowService: GeneralChatFlowService,
  ) {}

  async generateReply(
    userMessage: string,
    userId?: string,
    metadata?: Partial<ChatMetadata> | null,
    history?: ChatHistoryItem[],
  ): Promise<ChatReply> {
    try {
      const normalizedMessage = String(userMessage || '').trim();
      const chatMetadata = normalizeChatMetadata(metadata);

      if (this.isCancelRequest(normalizedMessage)) {
        return {
          reply: 'Quy trình đã bị hủy. Bạn muốn thực hiện hành động khác không?',
          action: 'cancelOrder',
          metadata: createInitialChatMetadata(),
        };
      }

      if (
        this.quickReorderFlowService.isStartRequest(normalizedMessage) ||
        chatMetadata.isQuickReorder
      ) {
        if (!userId) {
          return {
            reply:
              'Để xem lại các đơn hàng cũ và đặt lại nhanh, bạn vui lòng đăng nhập tài khoản nhé! 🔐',
            action: 'requireAuth',
            metadata: createInitialChatMetadata(),
          };
        }

        if (this.quickReorderFlowService.isStartRequest(normalizedMessage)) {
          return this.quickReorderFlowService.start(userId, chatMetadata);
        }
        return this.quickReorderFlowService.continue(normalizedMessage, userId, chatMetadata);
      }

      const isStartOrder =
        this.orderConversationFlowService.isStartRequest(normalizedMessage, history) &&
        !chatMetadata.isOrdering;
      const isOrdering = this.isOrderInProgress(chatMetadata);

      if (isStartOrder || isOrdering) {
        if (!userId) {
          return {
            reply:
              'Để mình có thể ghi nhận địa chỉ và gửi đơn hàng đến nhà hàng cho bạn, bạn vui lòng đăng nhập tài khoản nhé! 🛵',
            action: 'requireAuth',
            metadata: createInitialChatMetadata(),
          };
        }

        const context = await this.chatContextService.getContext(userId);
        context.history = history;

        if (isStartOrder) {
          return this.orderConversationFlowService.start(
            normalizedMessage,
            userId,
            chatMetadata,
            context,
            history,
          );
        }

        return this.orderConversationFlowService.continue(
          normalizedMessage,
          userId,
          chatMetadata,
          context,
          history,
        );
      }

      const context = await this.chatContextService.getContext(userId);
      context.history = history;
      const generalReply = await this.generalChatFlowService.reply(normalizedMessage, context);

      if (
        generalReply.action === 'orderItems' &&
        generalReply.suggestions &&
        generalReply.suggestions.length > 0 &&
        userId
      ) {
        chatMetadata.isOrdering = true;
        chatMetadata.orderItems = generalReply.suggestions.map((s) => {
          const menuItem = context.menuFlat.find((m) => m.id === s.id);
          return {
            id: s.id,
            name: s.name,
            price: s.price,
            quantity: 1,
            restaurantId: menuItem?.restaurantId || s.restaurantId || '',
            restaurantName: menuItem?.restaurantName || s.restaurantName,
          };
        });
        const summary = chatMetadata.orderItems
          .map((item) => `${item.quantity} ${item.name}`)
          .join(', ');
        return {
          reply: `${generalReply.reply}\n\nĐơn hàng dự kiến của bạn: ${summary}. Bạn có muốn tiếp tục tạo đơn này không?`,
          action: 'confirmOrder',
          suggestions: generalReply.suggestions,
          metadata: chatMetadata,
        };
      }

      return generalReply;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`[ChatService.generateReply] Error: ${message}`);
      throw new Error('Unable to generate system response.');
    }
  }

  private isCancelRequest(userMessage: string): boolean {
    return userMessage.toLowerCase() === 'hủy';
  }

  private isOrderInProgress(metadata: ChatMetadata): boolean {
    return (
      metadata.isOrdering ||
      metadata.isFoodConfirmed ||
      metadata.isRestaurantConfirmed ||
      metadata.isAddressConfirmed ||
      metadata.isPaymentConfirmed
    );
  }
}
