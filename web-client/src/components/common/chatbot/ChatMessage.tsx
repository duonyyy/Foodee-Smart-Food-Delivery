import Image from "next/image";
import AddressPicker, { type AddressItem } from "./AddressPicker";
import ChatFoodCard from "./FoodCard";
import OrderCard from "./OrderCard";
import OrderSuccessCard from "./OrderSuccessCard";
import PaymentSelector from "./PaymentSelector";
import type { ChatMessageModel, ChatMetadata, FoodSuggestion } from "./types";

interface ChatMessageProps {
  message: ChatMessageModel;
  metadata: ChatMetadata;
  onSelectOrder: (message: string) => void;
  onRequireAuth?: () => void;
  onOrderDirect?: (foodName: string) => void;
  onAddToCart?: (food: FoodSuggestion) => void;
}

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

export default function ChatMessage({
  message,
  metadata,
  onSelectOrder,
  onRequireAuth,
  onOrderDirect,
  onAddToCart,
}: ChatMessageProps) {
  const isUser = message.from === "user";
  const showQuickReorder =
    !isUser &&
    message.text?.includes("Bạn muốn đặt lại đơn nào?") &&
    metadata.isQuickReorder &&
    Array.isArray(metadata.quickOrderOptions) &&
    metadata.quickOrderOptions.length > 0;

  const showAddressPicker =
    !isUser &&
    message.action === "chooseAddress" &&
    Array.isArray(metadata.addresses) &&
    metadata.addresses.length > 0;

  const showPaymentSelector =
    !isUser && message.action === "choosePayment";

  const showOrderSuccess =
    !isUser &&
    (message.action === "placeOrder" ||
      (Boolean(metadata.orderId) &&
        message.text?.includes("tạo thành công")));

  return (
    <div
      className={`flex animate-[chat-slide-up_220ms_ease-out] gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white">
          <Image
            src="/mascot_background_removed.png"
            alt=""
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className={`max-w-[85%] space-y-2 ${isUser ? "items-end" : ""}`}>
        {message.text && (
          <div
            className={`whitespace-pre-wrap break-words px-4 py-3 text-sm leading-6 shadow-xs ${
              isUser
                ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground font-medium"
                : "rounded-2xl rounded-bl-md bg-slate-100 text-slate-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {!isUser && message.action === "requireAuth" && onRequireAuth && (
          <button
            type="button"
            onClick={onRequireAuth}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
          >
            <span>🔐 Đăng nhập tài khoản ngay</span>
            <span aria-hidden="true">→</span>
          </button>
        )}

        {!isUser && message.foodCards && message.foodCards.length > 0 && (
          <div className="grid gap-2">
            {message.foodCards.map((food) => (
              <ChatFoodCard
                key={food.id}
                food={food}
                onOrderDirect={onOrderDirect}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}

        {showAddressPicker && (
          <AddressPicker
            addresses={metadata.addresses as AddressItem[]}
            selectedId={
              typeof metadata.selectedAddress === "object" &&
              metadata.selectedAddress !== null &&
              "id" in metadata.selectedAddress
                ? String(metadata.selectedAddress.id)
                : undefined
            }
            onSelect={(index) => onSelectOrder(String(index + 1))}
          />
        )}

        {showPaymentSelector && (
          <PaymentSelector
            selectedMethod={
              metadata.selectedPaymentMethod === "cod" ||
              metadata.selectedPaymentMethod === "card"
                ? metadata.selectedPaymentMethod
                : undefined
            }
            onSelect={(method) => onSelectOrder(method)}
          />
        )}

        {showOrderSuccess && metadata.orderId && (
          <OrderSuccessCard
            orderId={String(metadata.orderId)}
            total={typeof metadata.total === "number" ? metadata.total : undefined}
            onContinueChat={() => onSelectOrder("Cảm ơn bot")}
          />
        )}

        {showQuickReorder && (
          <div className="grid gap-2">
            {metadata.quickOrderOptions?.map((order, index) => (
              <OrderCard
                key={order.orderId || index}
                order={order}
                index={index}
                onSelect={onSelectOrder}
              />
            ))}
          </div>
        )}

        <p
          className={`px-1 text-[11px] font-medium text-slate-400 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
