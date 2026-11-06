import { ChatService } from 'src/features/communications/chat/chat.service';
import { GeneralChatFlowService } from 'src/features/communications/chat/flows/general-chat-flow.service';
import { OrderConversationFlowService } from 'src/features/communications/chat/flows/order-conversation-flow.service';
import { QuickReorderFlowService } from 'src/features/communications/chat/flows/quick-reorder-flow.service';
import { ChatContextService } from 'src/features/communications/chat/services/chat-context.service';
import { ChatContext, ChatHistoryItem, ChatMetadata, ChatMenuItem } from 'src/features/communications/chat/types/chat.types';

describe('ChatService Natural Ordering Conversation E2E', () => {
  let chatService: ChatService;
  let mockContextService: any;
  let mockOrderFlow: OrderConversationFlowService;
  let mockGeneralFlow: { reply: jest.Mock };
  let mockQuickReorderFlow: any;
  let mockLlmService: any;
  let mockLocationReader: any;
  let mockOrderMessaging: any;
  let mockValidationService: any;

  const mockMenu: ChatMenuItem[] = [
    {
      id: 'food-com-suon-nuong',
      name: 'Cơm Tấm Sườn Nướng',
      price: 65000,
      image: '/com-suon-nuong.png',
      link: '/food/food-com-suon-nuong',
      restaurantId: 'rest-1',
      restaurantName: 'Quán Cơm Tấm Sài Gòn',
    },
    {
      id: 'food-com-suon-cot-let',
      name: 'Cơm Sườn Cốt Lết',
      price: 75000,
      image: '/com-suon-cot-let.png',
      link: '/food/food-com-suon-cot-let',
      restaurantId: 'rest-1',
      restaurantName: 'Quán Cơm Tấm Sài Gòn',
    },
  ];

  const chatContext: ChatContext = {
    menuFlat: mockMenu,
    orderedFoods: [],
  };

  beforeEach(() => {
    mockContextService = {
      getContext: jest.fn().mockResolvedValue(chatContext),
    };

    mockQuickReorderFlow = {
      isStartRequest: jest.fn().mockReturnValue(false),
    };

    mockLlmService = {
      getGeneralReply: jest.fn(),
      parseOrderItems: jest.fn(),
    };

    mockLocationReader = {
      listOwnedAddresses: jest.fn().mockResolvedValue([
        {
          addressId: 'addr-1',
          street: '123 Đường Số 1',
          ward: 'Phường Linh Trung',
          district: 'Thành phố Thủ Đức',
          city: 'TP.HCM',
        },
      ]),
    };

    mockOrderMessaging = {
      createChatOrder: jest.fn().mockResolvedValue({
        orderId: 'order-success-123',
        total: 65000,
        status: 'pending',
      }),
    };

    mockValidationService = {
      parsePaymentMethod: jest.fn().mockImplementation((msg: string) => {
        const lower = msg.toLowerCase();
        if (lower.includes('cod')) return 'cod';
        if (lower.includes('card')) return 'card';
        return null;
      }),
      validate: jest.fn().mockResolvedValue({
        valid: true,
        order: {
          restaurantId: 'rest-1',
          addressId: 'addr-1',
          paymentMethod: 'cod',
          orderItems: [
            {
              foodId: 'food-com-suon-nuong',
              quantity: 1,
              price: 65000,
            },
          ],
        },
      }),
    };

    mockOrderFlow = new OrderConversationFlowService(
      mockLocationReader,
      mockOrderMessaging,
      mockValidationService,
      mockLlmService,
    );

    mockGeneralFlow = {
      reply: jest.fn(),
    };

    chatService = new ChatService(
      mockContextService as never,
      mockQuickReorderFlow as never,
      mockOrderFlow,
      mockGeneralFlow as never,
    );
  });

  it('handles the exact conversation sequence reported by user: asking food -> selecting -> saying "CÓ" -> placing order', async () => {
    const history: ChatHistoryItem[] = [];
    let currentMetadata: ChatMetadata | undefined = undefined;
    const userId = 'user-test-1';

    // Turn 1: User asks "CÓ CƠM SƯỜN KHÔNG"
    mockGeneralFlow.reply!.mockResolvedValueOnce({
      reply: 'Dạ có ạ! Foodee hiện có các món cơm sườn sau:\n- Cơm Sườn Cốt Lết (75.000đ)\n- Cơm Tấm Sườn Nướng (65.000đ)\nBạn muốn chọn món nào ạ?',
      suggestions: mockMenu,
      action: undefined,
    });

    const reply1 = await chatService.generateReply('CÓ CƠM SƯỜN KHÔNG', userId, currentMetadata, history);
    expect(reply1.reply).toContain('Dạ có ạ! Foodee hiện có các món cơm sườn');
    expect(reply1.action).toBeUndefined();

    history.push({ role: 'user', text: 'CÓ CƠM SƯỜN KHÔNG' });
    history.push({ role: 'bot', text: reply1.reply });

    // Turn 2: User responds "Cơm Tấm Sườn Nướng (65.000đ"
    mockGeneralFlow.reply!.mockResolvedValueOnce({
      reply: 'Dạ, Cơm Tấm Sườn Nướng có giá 65.000đ rất ngon và đầy đặn ạ. Bạn có muốn đặt món này không?',
      action: undefined,
    });

    const reply2 = await chatService.generateReply('Cơm Tấm Sườn Nướng (65.000đ', userId, currentMetadata, history);
    expect(reply2.reply).toContain('Bạn có muốn đặt món này không?');

    history.push({ role: 'user', text: 'Cơm Tấm Sườn Nướng (65.000đ' });
    history.push({ role: 'bot', text: reply2.reply });

    // Turn 3: User says "CÓ"
    // Now with history context, isStartRequest recognizes "CÓ" following the bot's order prompt.
    // LlmService parses the item from history context:
    mockLlmService.parseOrderItems.mockResolvedValueOnce([
      {
        id: 'food-com-suon-nuong',
        name: 'Cơm Tấm Sườn Nướng',
        quantity: 1,
        price: 65000,
        restaurantId: 'rest-1',
        restaurantName: 'Quán Cơm Tấm Sài Gòn',
      },
    ]);

    const reply3 = await chatService.generateReply('CÓ', userId, currentMetadata, history);
    expect(reply3.action).toBe('confirmOrder');
    expect(reply3.reply).toContain('Đơn hàng hiện tại của bạn là: 1 Cơm Tấm Sườn Nướng');
    currentMetadata = reply3.metadata as ChatMetadata;
    expect(currentMetadata.isOrdering).toBe(true);
    expect(currentMetadata.orderItems).toHaveLength(1);

    history.push({ role: 'user', text: 'CÓ' });
    history.push({ role: 'bot', text: reply3.reply });

    // Turn 4: User confirms food: "Đồng ý" / "Có" / "Tiếp tục"
    const reply4 = await chatService.generateReply('tiếp tục', userId, currentMetadata, history);
    expect(reply4.action).toBe('confirmRestaurant');
    expect(reply4.reply).toContain('Quán Cơm Tấm Sài Gòn');
    currentMetadata = reply4.metadata as ChatMetadata;
    expect(currentMetadata.isFoodConfirmed).toBe(true);

    history.push({ role: 'user', text: 'tiếp tục' });
    history.push({ role: 'bot', text: reply4.reply });

    // Turn 5: User confirms restaurant
    const reply5 = await chatService.generateReply('ok', userId, currentMetadata, history);
    expect(reply5.action).toBe('chooseAddress');
    expect(reply5.reply).toContain('123 Đường Số 1');
    currentMetadata = reply5.metadata as ChatMetadata;
    expect(currentMetadata.isRestaurantConfirmed).toBe(true);

    // Turn 6: User selects address 1
    const reply6 = await chatService.generateReply('1', userId, currentMetadata, history);
    expect(reply6.action).toBe('confirmAddress');
    currentMetadata = reply6.metadata as ChatMetadata;

    // Turn 7: User confirms address
    const reply7 = await chatService.generateReply('có', userId, currentMetadata, history);
    expect(reply7.action).toBe('choosePayment');
    expect(reply7.reply).toContain('COD hay card');
    currentMetadata = reply7.metadata as ChatMetadata;

    // Turn 8: User chooses COD payment
    const reply8 = await chatService.generateReply('cod', userId, currentMetadata, history);
    expect(reply8.action).toBe('confirmCreateOrder');
    expect(reply8.reply).toContain('COD');
    currentMetadata = reply8.metadata as ChatMetadata;

    // Turn 9: User confirms creating order
    const reply9 = await chatService.generateReply('có', userId, currentMetadata, history);
    expect(reply9.action).toBe('placeOrder');
    expect(reply9.reply).toContain('Đơn hàng của bạn đã được tạo thành công');
    expect(reply9.reply).toContain('/order/order-success-123');
    expect(mockOrderMessaging.createChatOrder).toHaveBeenCalledWith({
      customerId: 'user-test-1',
      restaurantId: 'rest-1',
      addressId: 'addr-1',
      paymentMethod: 'cod',
      items: [{ foodId: 'food-com-suon-nuong', quantity: 1 }],
    });
  });

  it('handles direct phrasing "TÔI MUỐN ĐẶT Cơm Tấm Sườn Nướng có giá 65.000đ" without needing raw "đặt món"', async () => {
    const userId = 'user-test-1';
    mockLlmService.parseOrderItems.mockResolvedValueOnce([
      {
        id: 'food-com-suon-nuong',
        name: 'Cơm Tấm Sườn Nướng',
        quantity: 1,
        price: 65000,
        restaurantId: 'rest-1',
        restaurantName: 'Quán Cơm Tấm Sài Gòn',
      },
    ]);

    const reply = await chatService.generateReply(
      'TÔI MUỐN ĐẶT Cơm Tấm Sườn Nướng có giá 65.000đ',
      userId,
      undefined,
      [],
    );

    expect(reply.action).toBe('confirmOrder');
    expect(reply.reply).toContain('Đơn hàng hiện tại của bạn là: 1 Cơm Tấm Sườn Nướng');
    const metadata = reply.metadata as ChatMetadata;
    expect(metadata.isOrdering).toBe(true);
    expect(metadata.orderItems[0].name).toBe('Cơm Tấm Sườn Nướng');
  });

  it('requires authentication when unauthenticated user tries to order', async () => {
    const reply = await chatService.generateReply(
      'TÔI MUỐN ĐẶT Cơm Tấm Sườn Nướng có giá 65.000đ',
      undefined, // not logged in
      undefined,
      [],
    );

    expect(reply.action).toBe('requireAuth');
    expect(reply.reply).toContain('bạn vui lòng đăng nhập tài khoản');
  });
});
