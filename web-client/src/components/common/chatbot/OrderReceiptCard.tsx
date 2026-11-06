"use client";

import { CreditCard, MapPin, Receipt, Rocket, Store, X } from "lucide-react";
import type { ChatMetadata } from "./types";

interface OrderReceiptCardProps {
  metadata: ChatMetadata;
  onConfirm: () => void;
  onCancel: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN").format(Number(amount)) + "đ";

interface OrderItemInfo {
  id?: string;
  name?: string;
  quantity?: number;
  price?: number;
  restaurantName?: string;
}

export default function OrderReceiptCard({
  metadata,
  onConfirm,
  onCancel,
}: OrderReceiptCardProps) {
  const items = (Array.isArray(metadata.orderItems) ? metadata.orderItems : []) as OrderItemInfo[];
  if (items.length === 0) return null;

  const restaurantName = items[0]?.restaurantName || "Nhà hàng đối tác";
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0,
  );
  const shippingFee = 15000;
  const total = subtotal + shippingFee;

  const address = metadata.selectedAddress;
  const addressText = address
    ? [address.street, address.ward, address.district, address.city].filter(Boolean).join(", ")
    : "Chưa chọn địa chỉ";

  const paymentText =
    metadata.selectedPaymentMethod === "card"
      ? "Thẻ ngân hàng / Ví điện tử"
      : "Tiền mặt khi nhận hàng (COD)";

  return (
    <article
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
      aria-label="Phiếu tóm tắt đơn hàng"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">Chi tiết đơn hàng dự kiến</h4>
            <p className="text-[10px] text-slate-500">Vui lòng kiểm tra kỹ trước khi xác nhận</p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-slate-600">
        <div className="flex items-start gap-2">
          <Store className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="font-bold text-slate-800 line-clamp-1">{restaurantName}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="text-slate-600 line-clamp-1">{addressText}</span>
        </div>
        <div className="flex items-start gap-2">
          <CreditCard className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="text-slate-600">{paymentText}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-3 space-y-2 text-xs border border-slate-100">
        <div className="space-y-1 border-b border-slate-200/60 pb-2">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="flex justify-between items-center text-slate-700">
              <span className="line-clamp-1 flex-1 pr-2">
                <span className="font-bold">{item.quantity || 1}x</span> {item.name}
              </span>
              <span className="font-semibold shrink-0">
                {formatCurrency((item.price || 0) * (item.quantity || 1))}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-slate-500 text-[11px]">
          <span>Tiền món:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-500 text-[11px]">
          <span>Phí giao hàng:</span>
          <span>{formatCurrency(shippingFee)}</span>
        </div>
        <div className="flex justify-between items-center text-slate-900 font-extrabold text-sm pt-1 border-t border-slate-200/60">
          <span>Tổng thanh toán:</span>
          <span className="text-primary text-base">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Rocket className="h-3.5 w-3.5" />
          <span>Xác nhận tạo đơn</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          <span>Hủy</span>
        </button>
      </div>
    </article>
  );
}
