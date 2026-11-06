"use client";

import { adminService } from "@/api/admin";
import type { PaginatedResponse } from "@/api/response.interface";
import { userApi } from "@/api/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import type { Order } from "@/interface";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  BadgeCheck,
  CheckCircle2,
  ClockIcon,
  Package,
  RotateCcw,
  Store,
  Truck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type JSX, useEffect, useState } from "react";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipper_received: "Tài xế đã nhận",
  delivering: "Đang giao",
  completed: "Hoàn thành",
  canceled: "Đã hủy",
  processing_payment: "Đang xử lý thanh toán",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipper_received: "bg-purple-50 text-purple-700 border-purple-200",
  delivering: "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  canceled: "bg-red-50 text-red-700 border-red-200",
  processing_payment: "bg-purple-50 text-purple-700 border-purple-200",
};

const STATUS_ICONS: Record<string, JSX.Element> = {
  pending: <ClockIcon className="w-3.5 h-3.5" />,
  confirmed: <Package className="w-3.5 h-3.5" />,
  shipper_received: <Truck className="w-3.5 h-3.5" />,
  delivering: <Truck className="w-3.5 h-3.5" />,
  completed: <BadgeCheck className="w-3.5 h-3.5" />,
  canceled: <XCircle className="w-3.5 h-3.5" />,
  processing_payment: <ClockIcon className="w-3.5 h-3.5" />,
};

const PAGE_SIZE = 5;

const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-2xl shadow-xs border border-slate-100 p-6 mb-4 space-y-3">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-slate-200 rounded-lg w-1/3" />
        <div className="h-3 bg-slate-100 rounded-md w-1/4" />
      </div>
      <div className="h-6 bg-slate-100 rounded-full w-24" />
    </div>
    <div className="h-10 bg-slate-50 rounded-xl w-full" />
    <div className="flex justify-between items-center pt-2">
      <div className="h-5 bg-slate-200 rounded-md w-28" />
      <div className="h-8 bg-slate-100 rounded-xl w-20" />
    </div>
  </div>
);

export default function OrderPage() {
  const [tab, setTab] = useState<"current" | "completed" | "history">("current");
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyStatus, setHistoryStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);

  const { getToken } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  // Fetch current orders (pending, confirmed, shipper_received, delivering)
  useEffect(() => {
    if (tab !== "current") return;
    setLoading(true);
    const fetchCurrentOrders = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await userApi.order.getMyOrders(token, 1, 50);
        setCurrentOrders(
          res.items
            .filter((order) => order.status !== "completed" && order.status !== "canceled")
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      } catch {
        setCurrentOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentOrders();
  }, [tab, getToken]);

  // Fetch completed orders
  useEffect(() => {
    if (tab !== "completed") return;
    setLoading(true);
    const fetchCompletedOrders = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await userApi.order.getMyOrders(token, 1, 50, "completed");
        setCompletedOrders(
          res.items.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      } catch {
        setCompletedOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedOrders();
  }, [tab, getToken]);

  // Fetch history orders (paginated, filtered)
  useEffect(() => {
    if (tab !== "history") return;
    setLoading(true);
    const fetchHistoryOrders = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const statusParam = historyStatus ? historyStatus : undefined;
        const res: PaginatedResponse<Order> = await userApi.order.getMyOrders(
          token,
          historyPage,
          PAGE_SIZE,
          statusParam
        );
        setHistoryOrders(
          res.items.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
        setHistoryTotalPages(res.totalPages || 1);
      } catch {
        setHistoryOrders([]);
        setHistoryTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchHistoryOrders();
  }, [tab, historyPage, historyStatus, getToken]);

  const handleReorder = async (e: React.MouseEvent, order: Order) => {
    e.preventDefault();
    e.stopPropagation();
    if (!order.id) return;
    setReorderingOrderId(order.id);
    try {
      const token = await getToken();
      let itemsToReorder: { foodId?: string; quantity?: number }[] = [];
      if (order.orderDetails && order.orderDetails.length > 0) {
        itemsToReorder = order.orderDetails.map((d) => ({
          foodId: d.food?.id,
          quantity: d.quantity,
        }));
      } else if (token) {
        const fullOrder = await adminService.Order.getOrderById(token, order.id);
        itemsToReorder = (fullOrder.orderDetails || []).map((d) => ({
          foodId: d.food?.id,
          quantity: d.quantity,
        }));
      }

      if (itemsToReorder.length === 0) {
        toast.error("Không tìm thấy món ăn trong đơn hàng này");
        return;
      }

      let count = 0;
      for (const item of itemsToReorder) {
        if (item.foodId) {
          await addToCart(item.foodId, item.quantity || 1);
          count++;
        }
      }

      if (count > 0) {
        toast.success(`Đã thêm ${count} món vào giỏ hàng!`);
        router.push("/checkout");
      } else {
        toast.error("Các món trong đơn này hiện không khả dụng");
      }
    } catch (err) {
      console.error("Reorder failed:", err);
      toast.error("Không thể thêm món vào giỏ hàng");
    } finally {
      setReorderingOrderId(null);
    }
  };

  const renderOrderCard = (order: Order, allowReorder = false) => {
    const isReorderingThis = reorderingOrderId === order.id;
    const itemsPreview =
      order.orderDetails && order.orderDetails.length > 0
        ? order.orderDetails
            .map((d) => `${d.quantity || 1}x ${d.food?.name || "Món ăn"}`)
            .join(", ")
        : null;

    return (
      <Card
        key={order.id}
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md group"
      >
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-primary shrink-0" />
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                  {order.restaurant?.name || "Nhà hàng đối tác"}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Đặt lúc: {order.createdAt ? formatDate(order.createdAt) : "Gần đây"} • #{order.id.slice(-6).toUpperCase()}
              </p>
            </div>

            <Badge
              variant="outline"
              className={`px-3 py-1 rounded-full border text-xs font-bold ${
                STATUS_COLORS[order.status || "pending"] || "bg-slate-50 text-slate-700"
              }`}
            >
              {STATUS_ICONS[order.status || "pending"]}
              <span className="ml-1.5">
                {STATUS_LABELS[order.status || ""] || order.status}
              </span>
            </Badge>
          </div>

          {itemsPreview && (
            <div className="mb-4 rounded-xl bg-slate-50 px-3.5 py-2 text-xs text-slate-600 line-clamp-2 border border-slate-100">
              <span className="font-semibold text-slate-800">Món đã đặt: </span>
              {itemsPreview}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Tổng tiền</span>
              <div className="text-base sm:text-lg font-black text-primary">
                {formatPrice(order.total || 0)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {allowReorder && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleReorder(e, order)}
                  disabled={isReorderingThis}
                  className="rounded-xl border-slate-200 text-xs font-bold hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${isReorderingThis ? "animate-spin text-primary" : ""}`} />
                  {isReorderingThis ? "Đang thêm..." : "Đặt lại"}
                </Button>
              )}

              <Button
                asChild
                size="sm"
                className="rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
              >
                <Link href={`/order/${order.id}`}>
                  Chi tiết
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TabButton = ({
    active,
    onClick,
    children,
    count,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    count?: number;
  }) => (
    <button
      type="button"
      className={`flex-1 py-4 px-4 text-center font-bold text-sm transition-all duration-200 relative ${
        active
          ? "text-primary bg-white border-b-2 border-primary shadow-2xs"
          : "text-slate-500 bg-slate-50/70 hover:bg-slate-100 hover:text-slate-800"
      }`}
      onClick={onClick}
    >
      <span className="flex items-center justify-center gap-2">
        {children}
        {count !== undefined && count > 0 && (
          <Badge
            variant="secondary"
            className="text-xs px-2 py-0.5 bg-primary/10 text-primary font-bold"
          >
            {count}
          </Badge>
        )}
      </span>
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen bg-slate-50/50">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Đơn hàng của tôi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý và theo dõi tiến trình đơn hàng của bạn
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <TabButton
            active={tab === "current"}
            onClick={() => setTab("current")}
            count={currentOrders.length}
          >
            <Package className="w-4 h-4" />
            Đang xử lý
          </TabButton>
          <TabButton
            active={tab === "completed"}
            onClick={() => setTab("completed")}
            count={completedOrders.length}
          >
            <CheckCircle2 className="w-4 h-4" />
            Hoàn thành
          </TabButton>
          <TabButton
            active={tab === "history"}
            onClick={() => setTab("history")}
          >
            <ClockIcon className="w-4 h-4" />
            Lịch sử
          </TabButton>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Current Orders Tab */}
          {tab === "current" && (
            <div className="space-y-4">
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : currentOrders.length === 0 ? (
                <div className="text-center text-slate-400 py-16 space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Package className="w-8 h-8 opacity-60" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700">
                    Không có đơn hàng nào đang xử lý
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Bạn chưa có đơn đặt món nào đang trong quá trình chuẩn bị hoặc giao hàng.
                  </p>
                  <div className="pt-2">
                    <Button asChild className="rounded-xl font-bold bg-primary text-primary-foreground">
                      <Link href="/search">Khám phá món ăn ngay</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                currentOrders.map((order) => renderOrderCard(order, false))
              )}
            </div>
          )}

          {/* Completed Orders Tab */}
          {tab === "completed" && (
            <div className="space-y-4">
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : completedOrders.length === 0 ? (
                <div className="text-center text-slate-400 py-16 space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <CheckCircle2 className="w-8 h-8 opacity-60" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700">
                    Chưa có đơn hàng hoàn thành
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Các đơn hàng đã giao thành công sẽ hiển thị ở đây để bạn dễ dàng đặt lại.
                  </p>
                </div>
              ) : (
                completedOrders.map((order) => renderOrderCard(order, true))
              )}
            </div>
          )}

          {/* History Tab */}
          {tab === "history" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-700">
                  Lọc theo trạng thái:
                </span>
                <Select
                  value={historyStatus || "all"}
                  onValueChange={(value) => {
                    setHistoryStatus(value === "all" ? "" : value);
                    setHistoryPage(1);
                  }}
                >
                  <SelectTrigger
                    className="w-48 bg-white rounded-xl text-xs font-semibold h-9"
                    aria-label="Lọc theo trạng thái"
                  >
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">Tất cả trạng thái</SelectItem>
                    <SelectItem value="completed" className="text-xs">Hoàn thành</SelectItem>
                    <SelectItem value="canceled" className="text-xs">Đã hủy</SelectItem>
                    <SelectItem value="processing_payment" className="text-xs">
                      Đang xử lý thanh toán
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : historyOrders.length === 0 ? (
                <div className="text-center text-slate-400 py-16 space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <ClockIcon className="w-8 h-8 opacity-60" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700">Không có đơn hàng</h3>
                  <p className="text-xs text-slate-500">
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc đã chọn
                  </p>
                </div>
              ) : (
                historyOrders.map((order) => renderOrderCard(order, order.status === "completed" || order.status === "canceled"))
              )}

              {/* Pagination */}
              {historyTotalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-6 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={historyPage <= 1}
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    className="rounded-xl px-4 text-xs font-bold"
                  >
                    Trước
                  </Button>
                  <span className="text-xs font-medium text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    Trang{" "}
                    <span className="font-extrabold text-slate-900">{historyPage}</span> /{" "}
                    {historyTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={historyPage >= historyTotalPages}
                    onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                    className="rounded-xl px-4 text-xs font-bold"
                  >
                    Sau
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
