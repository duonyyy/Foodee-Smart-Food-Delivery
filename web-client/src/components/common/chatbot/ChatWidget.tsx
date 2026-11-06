"use client";

import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useAuthModal } from "@/context/modal-context";
import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import EmptyState from "./EmptyState";
import QuickActionChips from "./QuickActionChips";
import TypingIndicator from "./TypingIndicator";
import type {
  ChatApiResponse,
  ChatMessageModel,
  ChatMetadata,
  FoodSuggestion,
} from "./types";

const isClient = typeof window !== "undefined";
const sendSound = isClient ? new Audio("/sounds/send.mp3") : null;
const receiveSound = isClient ? new Audio("/sounds/receive.mp3") : null;
const MASCOT_IMAGE_SRC = "/mascot_background_removed.png";
const FALLBACK_MASCOT_IMAGE_SRC = "/bot-avatar.png";

const SESSION_MESSAGES_KEY = "foodee_chat_messages";
const SESSION_METADATA_KEY = "foodee_chat_metadata";
const LOCAL_MUTED_KEY = "foodee_chat_muted";

const initialMetadata: ChatMetadata = {
  orderItems: [],
  addresses: [],
  isOrdering: false,
  isFoodConfirmed: false,
  isRestaurantConfirmed: false,
  isAddressConfirmed: false,
  isPaymentConfirmed: false,
  isQuickReorder: false,
  quickOrderOptions: [],
};

const createMessage = (
  from: ChatMessageModel["from"],
  data: Pick<ChatMessageModel, "text" | "foodCards" | "action">,
): ChatMessageModel => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  from,
  createdAt: new Date(),
  ...data,
});

const getReplyText = (data: ChatApiResponse) => {
  if (typeof data.reply === "string") return data.reply;
  return data.reply?.reply || "Bot không trả lời được.";
};

const getSuggestions = (data: ChatApiResponse): FoodSuggestion[] => {
  if (
    typeof data.reply !== "string" &&
    Array.isArray(data.reply?.suggestions)
  ) {
    return data.reply.suggestions;
  }

  return Array.isArray(data.suggestions) ? data.suggestions : [];
};

const getAction = (data: ChatApiResponse): string | undefined => {
  if (data.action) return data.action;
  if (typeof data.reply !== "string" && data.reply?.action) {
    return data.reply.action;
  }
  return undefined;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageModel[]>(() => {
    if (!isClient) return [];
    try {
      const saved = sessionStorage.getItem(SESSION_MESSAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((m: ChatMessageModel) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        }));
      }
    } catch {
      // Ignore corrupted session storage
    }
    return [];
  });

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showLauncherPrompt, setShowLauncherPrompt] = useState(true);
  const [mascotSrc, setMascotSrc] = useState(MASCOT_IMAGE_SRC);
  const [metadata, setMetadata] = useState<ChatMetadata>(() => {
    if (!isClient) return initialMetadata;
    try {
      const saved = sessionStorage.getItem(SESSION_METADATA_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore corrupted session storage
    }
    return initialMetadata;
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (!isClient) return false;
    return localStorage.getItem(LOCAL_MUTED_KEY) === "true";
  });

  const chatRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();
  const { openModal } = useAuthModal();

  const { addToCart } = useCart();

  const hasUnreadBotMessage =
    !open && messages.some((message) => message.from === "bot");

  // Synchronize messages to sessionStorage
  useEffect(() => {
    if (!isClient) return;
    try {
      sessionStorage.setItem(SESSION_MESSAGES_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Synchronize metadata to sessionStorage and localStorage
  useEffect(() => {
    if (!isClient) return;
    try {
      sessionStorage.setItem(SESSION_METADATA_KEY, JSON.stringify(metadata));
      localStorage.setItem("metadata", JSON.stringify(metadata));
    } catch {}
  }, [metadata]);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping, open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(LOCAL_MUTED_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const handleResetChat = useCallback(() => {
    const confirmed = window.confirm(
      "Bạn có muốn làm mới cuộc trò chuyện và bắt đầu lại không?",
    );
    if (!confirmed) return;

    setMessages([]);
    setMetadata(initialMetadata);
    try {
      sessionStorage.removeItem(SESSION_MESSAGES_KEY);
      sessionStorage.removeItem(SESSION_METADATA_KEY);
      localStorage.removeItem("metadata");
    } catch {}
  }, []);

  const sendMessage = useCallback(
    async (messageOverride?: string) => {
      const messageToSend = (messageOverride ?? input).trim();
      if (!messageToSend || isTyping) return;

      setMessages((prev) => [
        ...prev,
        createMessage("user", { text: messageToSend }),
      ]);

      if (!isMuted) {
        sendSound?.play().catch(() => {});
      }

      setInput("");
      setIsTyping(true);

      try {
        const token = await getToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const apiBase = (
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        ).replace(/\/$/, "");

        const history = messages.slice(-8).map((m) => ({
          role: m.from === "user" ? ("user" as const) : ("bot" as const),
          text: m.text,
        }));

        const res = await fetch(`${apiBase}/chat`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            userMessage: messageToSend,
            metadata,
            history,
          }),
        });

        if (!res.ok) {
          const error = (await res.json()) as { message?: string };
          throw new Error(error.message || "Lỗi không xác định từ server");
        }

        const data = (await res.json()) as ChatApiResponse;

        setMessages((prev) => [
          ...prev,
          createMessage("bot", {
            text: getReplyText(data),
            foodCards: getSuggestions(data),
            action: getAction(data),
          }),
        ]);

        setMetadata((prev) => ({
          ...prev,
          isOrdering: data.metadata?.isOrdering ?? prev.isOrdering,
          isFoodConfirmed:
            data.metadata?.isFoodConfirmed ?? prev.isFoodConfirmed,
          isRestaurantConfirmed:
            data.metadata?.isRestaurantConfirmed ??
            prev.isRestaurantConfirmed,
          isAddressConfirmed:
            data.metadata?.isAddressConfirmed ?? prev.isAddressConfirmed,
          isPaymentConfirmed:
            data.metadata?.isPaymentConfirmed ?? prev.isPaymentConfirmed,
          orderItems: (data.metadata?.orderItems as unknown[]) ?? prev.orderItems,
          addresses: (data.metadata?.addresses as unknown[]) ?? prev.addresses,
          quickOrderOptions:
            data.metadata?.quickOrderOptions ?? prev.quickOrderOptions,
          isQuickReorder:
            data.metadata?.isQuickReorder ?? prev.isQuickReorder,
        }));

        if (!isMuted) {
          receiveSound?.play().catch(() => {});
        }
      } catch (err) {
        console.error("[BOT ERROR]", err);
        const errorText =
          err instanceof Error &&
          err.message &&
          !err.message.includes("Token không tồn tại")
            ? err.message
            : "Xin lỗi, hệ thống AI đang bận một chút. Bạn thử lại sau vài giây nhé!";

        setMessages((prev) => [
          ...prev,
          createMessage("bot", {
            text: errorText,
          }),
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [getToken, input, isMuted, isTyping, messages, metadata],
  );

  const handleOrderDirect = useCallback(
    (foodName: string) => {
      sendMessage(`Tôi muốn đặt ${foodName}`);
    },
    [sendMessage],
  );

  const handleAddToCart = useCallback(
    (food: FoodSuggestion) => {
      addToCart(food.id, 1);
    },
    [addToCart],
  );

  const latestBotMessage = [...messages].reverse().find((m) => m.from === "bot");
  const activeAction = latestBotMessage?.action;

  return (
    <section
      className="fixed bottom-0 right-0 z-[60] sm:bottom-6 sm:right-6 pointer-events-none"
      aria-label="Foodee Assistant"
    >
      <div
        className={`origin-bottom-right transition-all duration-300 ease-out ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0"
        }`}
      >
        {open && (
          <div
            className="fixed inset-0 sm:static flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl shadow-slate-900/15 sm:h-[580px] sm:w-[400px] sm:rounded-3xl sm:border sm:border-slate-200"
            role="dialog"
            aria-modal="false"
            aria-labelledby="foodee-assistant-title"
          >
            <div id="foodee-assistant-title" className="sr-only">
              Foodee Assistant
            </div>
            <ChatHeader
              onClose={() => setOpen(false)}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              onResetChat={handleResetChat}
            />

            <div
              ref={chatRef}
              className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-4 py-4"
              aria-live="polite"
            >
              {messages.length === 0 && !isTyping ? (
                <EmptyState onSelectSuggestion={sendMessage} />
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    metadata={metadata}
                    onSelectOrder={sendMessage}
                    onRequireAuth={() => openModal("login")}
                    onOrderDirect={handleOrderDirect}
                    onAddToCart={handleAddToCart}
                  />
                ))
              )}

              {isTyping && (
                <div className="flex gap-2">
                  <div className="h-8 w-8 shrink-0" aria-hidden="true" />
                  <TypingIndicator />
                </div>
              )}
            </div>

            {/* Quick Action Chips directly above ChatInput */}
            <div className="border-t border-slate-100 bg-white pt-1">
              <QuickActionChips
                action={activeAction}
                metadata={metadata}
                disabled={isTyping}
                onSelect={(payload) => sendMessage(payload)}
                onRequireAuth={() => openModal("login")}
              />
              <ChatInput
                value={input}
                disabled={isTyping}
                onChange={setInput}
                onSubmit={() => sendMessage()}
              />
            </div>
          </div>
        )}
      </div>

      {!open && (
        <div className="relative pointer-events-auto flex items-end justify-end p-4 sm:p-0 gap-2 sm:gap-3">
          {showLauncherPrompt && (
            <div className="relative mb-12 hidden max-w-[240px] animate-[chat-slide-up_260ms_ease-out] sm:block">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="group rounded-2xl rounded-br-md border border-slate-200 bg-sky-100 px-5 py-4 text-left shadow-xl shadow-slate-900/12 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-sky-50 hover:shadow-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Mở hỗ trợ đặt món"
              >
                <span className="block text-sm font-extrabold text-slate-950">
                  Bạn cần hỗ trợ gì?
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">
                  Mình có thể gợi ý món ngon, tìm đơn cũ hoặc đặt món giúp bạn ngay
                  trong chat.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowLauncherPrompt(false)}
                className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-600 text-white shadow-xs transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Ẩn gợi ý hỗ trợ"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="absolute -right-2 bottom-5 h-4 w-4 rotate-45 border-r border-t border-slate-200 bg-sky-100" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative flex h-[112px] w-[92px] items-end justify-center transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-[140px] sm:w-[116px]"
            aria-label="Mở trợ lý đặt món Foodee"
          >
            <span className="absolute bottom-0 h-10 w-20 rounded-full bg-slate-900/10 blur-md sm:w-24" />
            <span className="relative h-full w-full drop-shadow-2xl">
              <Image
                src={mascotSrc}
                alt=""
                fill
                sizes="116px"
                className="object-contain object-bottom"
                priority={false}
                onError={() => setMascotSrc(FALLBACK_MASCOT_IMAGE_SRC)}
              />
            </span>
            {hasUnreadBotMessage && (
              <span
                className="absolute right-2 top-3 h-4 w-4 rounded-full border-2 border-white bg-red-500 shadow-xs"
                aria-label="Có tin nhắn mới"
              />
            )}
          </button>
        </div>
      )}
    </section>
  );
}
