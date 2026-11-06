"use client";

import { Banknote, CreditCard, ShieldCheck } from "lucide-react";

interface PaymentSelectorProps {
  selectedMethod?: "cod" | "card";
  onSelect: (method: "cod" | "card") => void;
}

export default function PaymentSelector({
  selectedMethod,
  onSelect,
}: PaymentSelectorProps) {
  return (
    <div className="space-y-2 pt-1" role="group" aria-label="Chọn phương thức thanh toán">
      <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
        <CreditCard className="h-3.5 w-3.5 text-primary" />
        <span>Chọn phương thức thanh toán:</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSelect("cod")}
          className={`flex items-start gap-2.5 rounded-2xl border p-3 text-left transition-all duration-200 active:scale-[0.98] ${
            selectedMethod === "cod"
              ? "border-primary bg-primary/5 shadow-xs"
              : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50/80"
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Banknote className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900">Tiền mặt (COD)</p>
            <p className="text-[11px] text-slate-500 leading-4 mt-0.5">
              Thanh toán trực tiếp cho shipper
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect("card")}
          className={`flex items-start gap-2.5 rounded-2xl border p-3 text-left transition-all duration-200 active:scale-[0.98] ${
            selectedMethod === "card"
              ? "border-primary bg-primary/5 shadow-xs"
              : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50/80"
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900">Thẻ / Ví điện tử</p>
            <p className="text-[11px] text-slate-500 leading-4 mt-0.5">
              Thanh toán online an toàn
            </p>
          </div>
        </button>
      </div>

      <p className="flex items-center gap-1 text-[10px] text-slate-400 pt-0.5">
        <ShieldCheck className="h-3 w-3 text-emerald-500" />
        <span>Giao dịch được bảo vệ an toàn 100% bởi Foodee</span>
      </p>
    </div>
  );
}

