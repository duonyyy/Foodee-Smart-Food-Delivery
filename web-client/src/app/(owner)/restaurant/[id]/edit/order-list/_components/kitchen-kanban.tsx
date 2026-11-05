"use client";

import React from "react";
import { Order, OrderDetail } from "@/interface";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  User,
  CheckCircle,
  XCircle,
  ChefHat,
  Bike,
  Eye,
  Printer,
  PackageCheck,
  Clock,
  ArrowRight,
} from "lucide-react";

interface KitchenKanbanProps {
  orders: Order[];
  updatingOrders: Set<string>;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  onViewOrder: (order: Order) => void;
  getElapsedTimeText: (createdAt: string) => string;
}

export function KitchenKanban({
  orders,
  updatingOrders,
  onUpdateStatus,
  onViewOrder,
  getElapsedTimeText,
}: KitchenKanbanProps) {
  // Categorize orders into the 4 canonical KDS columns
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const confirmedOrders = orders.filter((o) => o.status === "confirmed");
  const waitingDriverOrders = orders.filter(
    (o) =>
      o.status === "delivering" ||
      o.status === "shipper_received" ||
      o.status === "ready"
  );
  const finishedOrders = orders.filter(
    (o) => o.status === "completed" || o.status === "canceled"
  );

  const handlePrintReceipt = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    const itemsHtml = (order.orderDetails || [])
      .map(
        (item: OrderDetail) => `
          <tr style="border-bottom: 1px dashed #ccc;">
            <td style="padding: 6px 0; font-weight: bold;">${item.food?.name || "Món ăn"}</td>
            <td style="padding: 6px 0; text-align: center;">x${item.quantity || 1}</td>
            <td style="padding: 6px 0; text-align: right;">${((Number(item.price) || 0) * (item.quantity || 1)).toLocaleString("vi-VN")}đ</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Phiếu Bếp - #${order.id.slice(-6).toUpperCase()}</title>
          <style>
            body { font-family: monospace, sans-serif; padding: 15px; font-size: 13px; color: #111; }
            .header { text-align: center; border-bottom: 1px double #000; padding-bottom: 8px; margin-bottom: 10px; }
            .title { font-size: 16px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .note { background: #f0f0f0; padding: 6px; border-radius: 4px; margin: 8px 0; font-weight: bold; }
            .footer { margin-top: 15px; text-align: center; font-size: 11px; border-top: 1px dashed #999; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">PHIẾU CHẾ BIẾN BẾP (KDS)</div>
            <div>Mã đơn: #${order.id.slice(-6).toUpperCase()}</div>
            <div>Giờ đặt: ${new Date(order.createdAt).toLocaleTimeString("vi-VN")}</div>
          </div>
          <div><strong>Khách:</strong> ${order.user?.name || "Khách hàng"} - ${order.user?.phone || ""}</div>
          ${order.note ? `<div class="note">Ghi chú: ${order.note}</div>` : ""}
          <table>
            <thead>
              <tr style="border-bottom: 1px solid #000;">
                <th style="text-align: left; padding: 4px 0;">Món</th>
                <th style="text-align: center; padding: 4px 0;">SL</th>
                <th style="text-align: right; padding: 4px 0;">Giá</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || '<tr><td colspan="3" style="padding: 8px 0; text-align:center;">Chi tiết đơn hàng</td></tr>'}
            </tbody>
          </table>
          <div style="margin-top: 12px; text-align: right; font-weight: bold; font-size: 14px;">
            Tổng tiền: ${(order.total || 0).toLocaleString("vi-VN")} đ
          </div>
          <div class="footer">Foodee Kitchen System - In lúc ${new Date().toLocaleTimeString("vi-VN")}</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const renderKanbanCard = (
    order: Order,
    columnType: "pending" | "confirmed" | "waiting_driver" | "finished"
  ) => {
    const isUpdating = updatingOrders.has(order.id);
    const elapsedTime = getElapsedTimeText(order.createdAt);
    const diffMinutes = Math.floor(
      (Date.now() - new Date(order.createdAt).getTime()) / 60000
    );
    const isOverdue = columnType === "pending" && diffMinutes >= 5;

    return (
      <div
        key={order.id}
        onClick={() => onViewOrder(order)}
        className={`group relative flex flex-col justify-between rounded-2xl border bg-card p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
          isOverdue
            ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-400/50"
            : columnType === "pending"
            ? "border-amber-400/80 bg-amber-50/15 shadow-xs ring-1 ring-amber-400/30"
            : columnType === "confirmed"
            ? "border-sky-300/80 bg-sky-50/10"
            : columnType === "waiting_driver"
            ? "border-purple-300/80 bg-purple-50/10"
            : "border-border/80 hover:border-primary/40"
        }`}
      >
        <div>
          {/* Card Top Header */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/50">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-foreground">
                #{order.id.slice(-6).toUpperCase()}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isOverdue
                    ? "bg-rose-500 text-white animate-pulse"
                    : columnType === "pending"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground"
                }`}
              >
                <Clock className="h-2.5 w-2.5" />
                <span>{isOverdue ? `⚠️ ${elapsedTime}` : elapsedTime}</span>
              </span>
            </div>
            <StatusBadge status={order.status || "pending"} size="sm" />
          </div>

          {/* Customer & Info */}
          <div className="py-2.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-foreground font-semibold">
              <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{order.user?.name || "Khách hàng"}</span>
              </div>
              {order.user?.phone && (
                <span className="text-[11px] font-bold text-primary">
                  {order.user.phone}
                </span>
              )}
            </div>

            {/* Note box */}
            {order.note && (
              <div className="rounded-lg border border-amber-200/80 bg-amber-50 dark:bg-amber-950/20 p-2 text-[11px] text-amber-900 dark:text-amber-300 leading-tight">
                <span className="font-bold">Ghi chú:</span> {order.note}
              </div>
            )}

            {/* Order Details preview */}
            {order.orderDetails && order.orderDetails.length > 0 && (
              <div className="pt-1 border-t border-border/40 space-y-1">
                {order.orderDetails.slice(0, 3).map((item: OrderDetail, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="truncate max-w-[170px]">
                      • {item.food?.name || "Món ăn"}
                    </span>
                    <span className="font-bold shrink-0">x{item.quantity || 1}</span>
                  </div>
                ))}
                {order.orderDetails.length > 3 && (
                  <p className="text-[10px] text-muted-foreground italic">
                    +{order.orderDetails.length - 3} món khác...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card Footer / 1-Touch Actions */}
        <div className="pt-2.5 mt-1 border-t border-border/50 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-muted-foreground block">Tổng tiền</span>
            <span className="text-sm font-black text-primary">
              {(order.total || 0).toLocaleString("vi-VN")}₫
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handlePrintReceipt(e, order)}
              className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-slate-800"
              title="In phiếu chế biến bếp"
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>

            {/* Column 1: Đơn mới -> Nhận đơn (confirmed) */}
            {columnType === "pending" && (
              <>
                <Button
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus(order.id, "confirmed")}
                  className="h-8 px-3 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-xs"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  <span>{isUpdating ? "..." : "Nhận đơn"}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus(order.id, "canceled")}
                  className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                  title="Hủy đơn"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Column 2: Đang làm -> Xong món, chuyển sang Chờ tài xế (delivering) */}
            {columnType === "confirmed" && (
              <Button
                size="sm"
                disabled={isUpdating}
                onClick={() => onUpdateStatus(order.id, "delivering")}
                className="h-8 px-3 rounded-lg text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-xs"
              >
                <ChefHat className="h-3.5 w-3.5 mr-1" />
                <span>{isUpdating ? "..." : "Xong món"}</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}

            {/* Column 3: Chờ tài xế -> Đã lấy (completed) */}
            {columnType === "waiting_driver" && (
              <Button
                size="sm"
                disabled={isUpdating}
                onClick={() => onUpdateStatus(order.id, "completed")}
                className="h-8 px-2.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
              >
                <PackageCheck className="h-3.5 w-3.5 mr-1" />
                <span>{isUpdating ? "..." : "Đã giao tài xế"}</span>
              </Button>
            )}

            {/* Column 4: Đã lấy -> Xem chi tiết */}
            {columnType === "finished" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewOrder(order)}
                className="h-8 px-2 rounded-lg text-xs font-medium text-slate-500"
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                <span>Chi tiết</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {/* 1. Column: Đơn mới */}
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/20 p-3.5 flex flex-col gap-3 min-h-[450px]">
        <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-900 dark:text-amber-300">
              Đơn mới
            </h3>
          </div>
          <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            {pendingOrders.length}
          </span>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            Chưa có đơn hàng mới
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-0.5">
            {pendingOrders.map((order) => renderKanbanCard(order, "pending"))}
          </div>
        )}
      </div>

      {/* 2. Column: Đang làm */}
      <div className="rounded-2xl border border-sky-200/80 bg-sky-50/20 p-3.5 flex flex-col gap-3 min-h-[450px]">
        <div className="flex items-center justify-between pb-2 border-b border-sky-200/60">
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-sky-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-sky-900 dark:text-sky-300">
              Đang làm
            </h3>
          </div>
          <span className="text-xs font-black px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
            {confirmedOrders.length}
          </span>
        </div>

        {confirmedOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            Bếp đang trống
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-0.5">
            {confirmedOrders.map((order) => renderKanbanCard(order, "confirmed"))}
          </div>
        )}
      </div>

      {/* 3. Column: Chờ tài xế */}
      <div className="rounded-2xl border border-purple-200/80 bg-purple-50/20 p-3.5 flex flex-col gap-3 min-h-[450px]">
        <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
          <div className="flex items-center gap-2">
            <Bike className="h-4 w-4 text-purple-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-purple-900 dark:text-purple-300">
              Chờ tài xế
            </h3>
          </div>
          <span className="text-xs font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
            {waitingDriverOrders.length}
          </span>
        </div>

        {waitingDriverOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            Không có đơn chờ tài xế
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-0.5">
            {waitingDriverOrders.map((order) =>
              renderKanbanCard(order, "waiting_driver")
            )}
          </div>
        )}
      </div>

      {/* 4. Column: Đã lấy */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 dark:bg-muted/30 p-3.5 flex flex-col gap-3 min-h-[450px]">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-border">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Đã lấy
            </h3>
          </div>
          <span className="text-xs font-black px-2 py-0.5 rounded-full bg-slate-200 dark:bg-muted text-slate-700 dark:text-slate-200">
            {finishedOrders.length}
          </span>
        </div>

        {finishedOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            Chưa có đơn đã lấy
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-0.5">
            {finishedOrders.slice(0, 15).map((order) =>
              renderKanbanCard(order, "finished")
            )}
          </div>
        )}
      </div>
    </div>
  );
}
