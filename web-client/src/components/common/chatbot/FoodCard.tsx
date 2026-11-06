"use client";

import { Check, ExternalLink, ShoppingCart, Star, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { FoodSuggestion } from "./types";

interface ChatFoodCardProps {
  food: FoodSuggestion;
  onOrderDirect?: (foodName: string) => void;
  onAddToCart?: (food: FoodSuggestion) => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(Number(price)) + "đ";

export default function ChatFoodCard({
  food,
  onOrderDirect,
  onAddToCart,
}: ChatFoodCardProps) {
  const [imageError, setImageError] = useState(false);
  const [added, setAdded] = useState(false);
  const imageSrc = imageError || !food.image ? "/images/placeholder-food.jpg" : food.image;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(food);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-28 w-full bg-slate-100">
        <Image
          src={imageSrc}
          alt={food.name}
          fill
          className="object-cover"
          sizes="320px"
          onError={() => setImageError(true)}
        />
        {food.rating !== undefined && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {food.rating.toFixed(1)}
          </span>
        )}
        <Link
          href={food.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm backdrop-blur-xs transition hover:bg-white hover:text-primary"
          aria-label={`Xem chi tiết ${food.name} ở tab mới`}
          title="Xem chi tiết"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="line-clamp-1 text-sm font-bold text-slate-900" title={food.name}>
              {food.name}
            </h4>
            {food.restaurantName && (
              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                {food.restaurantName}
              </p>
            )}
          </div>
          <p className="shrink-0 text-sm font-extrabold text-primary">
            {formatPrice(food.price)}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {onOrderDirect && (
            <button
              type="button"
              onClick={() => onOrderDirect(food.name)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-xs transition hover:bg-primary/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Đặt ngay</span>
            </button>
          )}

          {onAddToCart && (
            <button
              type="button"
              onClick={handleAddToCart}
              className={`inline-flex items-center justify-center gap-1 rounded-xl border px-3 py-2 text-xs font-bold transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                added
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              }`}
              aria-label={`Thêm ${food.name} vào giỏ hàng`}
            >
              {added ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Đã thêm</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Giỏ hàng</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
