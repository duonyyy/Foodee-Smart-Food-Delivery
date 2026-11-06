"use client";

import { Check, Flame, History, Plus, RefreshCw, Rocket, Sparkles, Tag, X } from "lucide-react";
import type { ChatMetadata } from "./types";

interface QuickActionChipsProps {
  action?: string;
  metadata?: ChatMetadata;
  disabled?: boolean;
  onSelect: (payload: string) => void;
  onRequireAuth?: () => void;
}

interface ChipItem {
  id: string;
  label: string;
  payload: string;
  icon?: typeof Check;
  variant?: "primary" | "secondary" | "danger";
  isAuthAction?: boolean;
}

export default function QuickActionChips({
  action,
  metadata,
  disabled,
  onSelect,
  onRequireAuth,
}: QuickActionChipsProps) {
  const getChips = (): ChipItem[] => {
    switch (action) {
      case "confirmOrder":
        return [
          {
            id: "confirm-order",
            label: "Xác nhận & Tiếp tục",
            payload: "tiếp tục",
            icon: Check,
            variant: "primary",
          },
          {
            id: "add-food",
            label: "Thêm món khác",
            payload: "cho tôi chọn thêm món",
            icon: Plus,
            variant: "secondary",
          },
          {
            id: "cancel-order",
            label: "Hủy đơn",
            payload: "hủy",
            icon: X,
            variant: "danger",
          },
        ];

      case "confirmRestaurant":
        return [
          {
            id: "confirm-rest",
            label: "Đúng quán này",
            payload: "đồng ý",
            icon: Check,
            variant: "primary",
          },
          {
            id: "change-rest",
            label: "Đổi quán khác",
            payload: "đổi quán khác",
            icon: RefreshCw,
            variant: "secondary",
          },
          {
            id: "cancel-rest",
            label: "Hủy",
            payload: "hủy",
            icon: X,
            variant: "danger",
          },
        ];

      case "chooseAddress":
        const addressCount = Array.isArray(metadata?.addresses) ? metadata.addresses.length : 0;
        const addressChips: ChipItem[] = [];
        for (let i = 0; i < Math.min(addressCount, 3); i++) {
          addressChips.push({
            id: `addr-${i + 1}`,
            label: `Giao địa chỉ ${i + 1}`,
            payload: String(i + 1),
            icon: Check,
            variant: "primary",
          });
        }
        addressChips.push({
          id: "cancel-address",
          label: "Hủy",
          payload: "hủy",
          icon: X,
          variant: "danger",
        });
        return addressChips;

      case "choosePayment":
        return [
          {
            id: "pay-cod",
            label: "Tiền mặt (COD)",
            payload: "cod",
            icon: Check,
            variant: "primary",
          },
          {
            id: "pay-card",
            label: "Thẻ ngân hàng",
            payload: "card",
            icon: Check,
            variant: "secondary",
          },
          {
            id: "cancel-payment",
            label: "Hủy",
            payload: "hủy",
            icon: X,
            variant: "danger",
          },
        ];

      case "confirmCreateOrder":
        return [
          {
            id: "submit-order",
            label: "Xác nhận tạo đơn ngay",
            payload: "có",
            icon: Rocket,
            variant: "primary",
          },
          {
            id: "cancel-create",
            label: "Hủy bỏ",
            payload: "hủy",
            icon: X,
            variant: "danger",
          },
        ];

      case "retryOrder":
        return [
          {
            id: "retry-search",
            label: "Gợi ý món hot",
            payload: "Món nào đang hot?",
            icon: Flame,
            variant: "primary",
          },
          {
            id: "retry-cheap",
            label: "Món rẻ nhất",
            payload: "Món nào rẻ nhất?",
            icon: Tag,
            variant: "secondary",
          },
          {
            id: "retry-cancel",
            label: "Bắt đầu lại",
            payload: "hủy",
            icon: RefreshCw,
            variant: "danger",
          },
        ];

      case "requireAuth":
        return [
          {
            id: "auth-login",
            label: "Đăng nhập ngay",
            payload: "",
            icon: Check,
            variant: "primary",
            isAuthAction: true,
          },
        ];

      default:
        // Default exploration chips when not in a strict ordering flow
        if (metadata?.isOrdering) {
          return [
            {
              id: "flow-cancel",
              label: "Hủy quy trình đặt",
              payload: "hủy",
              icon: X,
              variant: "danger",
            },
          ];
        }
        return [
          {
            id: "default-suggest",
            label: "Gợi ý món",
            payload: "Gợi ý món ngon hôm nay",
            icon: Sparkles,
            variant: "secondary",
          },
          {
            id: "default-reorder",
            label: "Đơn gần đây",
            payload: "Cho tôi xem đơn gần đây",
            icon: History,
            variant: "secondary",
          },
          {
            id: "default-hot",
            label: "Món hot",
            payload: "Món nào đang hot?",
            icon: Flame,
            variant: "secondary",
          },
        ];
    }
  };

  const chips = getChips();
  if (chips.length === 0) return null;

  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 scrollbar-none"
      role="group"
      aria-label="Gợi ý thao tác nhanh"
    >
      {chips.map((chip) => {
        const Icon = chip.icon;
        const isPrimary = chip.variant === "primary";
        const isDanger = chip.variant === "danger";

        const baseStyle =
          "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50";

        let colorStyle =
          "border border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5 hover:text-primary";
        if (isPrimary) {
          colorStyle =
            "border border-primary bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm";
        } else if (isDanger) {
          colorStyle =
            "border border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100";
        }

        return (
          <button
            key={chip.id}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (chip.isAuthAction && onRequireAuth) {
                onRequireAuth();
              } else {
                onSelect(chip.payload);
              }
            }}
            className={`${baseStyle} ${colorStyle}`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
}
