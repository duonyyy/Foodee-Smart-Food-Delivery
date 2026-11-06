"use client";

import { CheckCircle2, Clock, ExternalLink, MessageSquare, PackageCheck } from "lucide-react";
import Link from "next/link";

interface OrderSuccessCardProps {
  orderId: string;
  total?: number;
  onContinueChat?: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN").format(Number(amount)) + "đ";

export default function OrderSuccessCard({
  orderId,
  total,
  onContinueChat,
}: OrderSuccessCardProps) {
  return (
    <article
      className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50/70 to-white p-4 shadow-sm space-y-3.5"
      aria-label="Xác nhận đơn hàng thành công"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
          <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
        </div>
        <div>
          <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
            Đặt đơn thành công
          </span>
          <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
            Mã đơn: #{orderId.slice(0, 8).toUpperCase()}
          </h4>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-3 space-y-2 text-xs">
        {total !== undefined && (
          <div className="flex items-center justify-between text-slate-600">
            <span>Tổng thanh toán:</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {formatCurrency(total)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-emerald-600" />
            <span>Thời gian dự kiến:</span>
          </span>
          <span className="font-bold text-slate-900">25 - 30 phút</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1">
            <PackageCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Trạng thái:</span>
          </span>
          <span className="font-bold text-emerald-700">Đã gửi nhà hàng</span>
        </div>
      </div>

      <div className="space-y-2 pt-0.5">
        <Link
          href={`/order/${orderId}`}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span>📦 Theo dõi đơn hàng trực tiếp</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        {onContinueChat && (
          <button
            type="button"
            onClick={onContinueChat}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Tiếp tục trò chuyện với MiXiBot</span>
          </button>
        )}
      </div>
    </article>
  );
}

