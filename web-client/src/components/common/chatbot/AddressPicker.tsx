"use client";

import { Check, MapPin, Plus } from "lucide-react";
import Link from "next/link";

export interface AddressItem {
  id: string;
  street: string;
  ward: string | null;
  district: string | null;
  city: string;
}

interface AddressPickerProps {
  addresses: AddressItem[];
  selectedId?: string;
  onSelect: (index: number) => void;
}

export default function AddressPicker({
  addresses,
  selectedId,
  onSelect,
}: AddressPickerProps) {
  if (!addresses || addresses.length === 0) return null;

  return (
    <div className="space-y-2 pt-1" role="group" aria-label="Chọn địa chỉ giao hàng">
      <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 text-primary" />
        <span>Chọn địa chỉ giao hàng:</span>
      </p>

      <div className="grid gap-2">
        {addresses.map((address, index) => {
          const fullAddress = [address.street, address.ward, address.district, address.city]
            .filter(Boolean)
            .join(", ");
          const isSelected = selectedId === address.id;

          return (
            <button
              key={address.id || index}
              type="button"
              onClick={() => onSelect(index)}
              className={`group flex items-start gap-3 rounded-2xl border p-3 text-left transition-all duration-200 active:scale-[0.98] ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50/80"
              }`}
            >
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isSelected
                    ? "border-primary bg-primary text-white"
                    : "border-slate-300 bg-white text-transparent group-hover:border-primary"
                }`}
              >
                <Check className="h-3 w-3 stroke-[3]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900">
                  Địa chỉ #{index + 1}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-slate-600 line-clamp-2">
                  {fullAddress}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                  <span>👉 Giao đến địa chỉ này</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <Link
        href="/profile/addresses"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-primary transition-colors pt-1"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Quản lý hoặc thêm địa chỉ mới</span>
      </Link>
    </div>
  );
}
