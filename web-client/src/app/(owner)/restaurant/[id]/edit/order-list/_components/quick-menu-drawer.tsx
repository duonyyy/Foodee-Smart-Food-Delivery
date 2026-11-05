"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { userApi } from "@/api/user";
import { useAuth } from "@/context/auth-context";
import { FoodDetail } from "@/interface";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Search, Loader2, RefreshCw, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface QuickMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
}

export function QuickMenuDrawer({
  open,
  onOpenChange,
  restaurantId,
}: QuickMenuDrawerProps) {
  const { getToken } = useAuth();
  const [foods, setFoods] = useState<FoodDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "available" | "unavailable">("all");

  const loadFoods = async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const items = await userApi.food.getFoodsByRestaurant(restaurantId);
      setFoods(items || []);
    } catch (error) {
      console.error("Failed to load restaurant foods for quick toggle:", error);
      toast.error("Không thể tải danh sách món ăn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadFoods();
    }
  }, [open, restaurantId]);

  const handleToggleStatus = async (food: FoodDetail) => {
    if (!food.id) return;
    const nextStatus = food.status === "available" ? "hidden" : "available";
    const prevStatus = food.status;

    // Optimistic update
    setFoods((prev) =>
      prev.map((item) =>
        item.id === food.id ? { ...item, status: nextStatus } : item
      )
    );
    setUpdatingId(food.id);

    try {
      const token = getToken();
      if (!token) throw new Error("Chưa đăng nhập");

      await userApi.food.updateFoodStatus(token, food.id, nextStatus);

      toast.success(
        nextStatus === "available"
          ? `Món "${food.name}" đã chuyển sang trạng thái: CÒN MÓN`
          : `Món "${food.name}" đã đánh dấu: HẾT MÓN (Tạm ngừng bán)`
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái món:", error);
      // Rollback
      setFoods((prev) =>
        prev.map((item) =>
          item.id === food.id ? { ...item, status: prevStatus } : item
        )
      );
      toast.error("Không thể cập nhật trạng thái món ăn. Vui lòng thử lại!");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesSearch =
        !searchQuery.trim() ||
        food.name.toLowerCase().includes(searchQuery.toLowerCase().trim());

      if (!matchesSearch) return false;

      if (filterMode === "available") return food.status === "available";
      if (filterMode === "unavailable") return food.status !== "available";
      return true;
    });
  }, [foods, searchQuery, filterMode]);

  const outOfStockCount = useMemo(() => {
    return foods.filter((f) => f.status !== "available").length;
  }, [foods]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-md w-full p-0 flex flex-col h-full bg-card">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-bold flex items-center gap-2">
              <span>Bật/Tắt Hết Món Nhanh</span>
              {outOfStockCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  {outOfStockCount} món hết
                </span>
              )}
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadFoods}
              disabled={loading}
              className="h-8 w-8 p-0"
              title="Làm mới thực đơn"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cập nhật trạng thái món tức thì cho khách hàng mà không cần vào trang chỉnh sửa chi tiết.
          </p>

          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 pt-2">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                filterMode === "all"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Tất cả ({foods.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("available")}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                filterMode === "available"
                  ? "bg-emerald-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Còn món ({foods.length - outOfStockCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("unavailable")}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                filterMode === "unavailable"
                  ? "bg-rose-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Hết món ({outOfStockCount})
            </button>
          </div>

          {/* Search box */}
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tên món ăn..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Food List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading && foods.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Đang tải thực đơn...</span>
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground space-y-1">
              <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p>Không tìm thấy món ăn nào phù hợp</p>
            </div>
          ) : (
            filteredFoods.map((food) => {
              const isAvailable = food.status === "available";
              const isUpdating = updatingId === food.id;

              return (
                <div
                  key={food.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isAvailable
                      ? "border-border/80 bg-card hover:border-emerald-300"
                      : "border-rose-200 bg-rose-50/30 dark:bg-rose-950/10"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/50">
                      {food.image ? (
                        <Image
                          src={food.image}
                          alt={food.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
                          Món
                        </div>
                      )}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-[9px] font-black text-white px-1 py-0.5 rounded bg-rose-600/90 uppercase tracking-tighter">
                            Hết
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${!isAvailable ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {food.name}
                      </p>
                      <p className="text-[11px] font-semibold text-primary">
                        {(Number(food.price) || 0).toLocaleString("vi-VN")}₫
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                          isAvailable ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isAvailable ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Còn hàng
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" /> Hết món
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* 1-touch Quick Toggle Button */}
                  <Button
                    size="sm"
                    variant={isAvailable ? "outline" : "default"}
                    disabled={isUpdating}
                    onClick={() => handleToggleStatus(food)}
                    className={`h-8 px-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isAvailable
                        ? "border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                    }`}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isAvailable ? (
                      "Báo hết"
                    ) : (
                      "Mở bán lại"
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
