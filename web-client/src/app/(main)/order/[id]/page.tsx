"use client";

import { adminService } from "@/api/admin";
import type { AdminOrderDetail } from "@/api/admin";
import { userApi } from "@/api/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { ConversationType } from "@/interface";
import { useDeliverySocket, useOrderSocket } from "@/shared/socket";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  RotateCcw,
  Star,
  Store,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Dynamic imports for modal dialogs and map
const RatingModal = dynamic(() => import("./_components/rating-modal"), { ssr: false });
const ShipperRatingModal = dynamic(() => import("./_components/shipper-rating-modal"), { ssr: false });
const Map = dynamic(() => import("@/components/common/map"), { ssr: false });

const STATUS_CONFIG = {
  pending: {
    label: "Chờ xác nhận",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock className="w-4 h-4" />,
    bgColor: "bg-amber-500"
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <CheckCircle2 className="w-4 h-4" />,
    bgColor: "bg-blue-500"
  },
  shipper_received: {
    label: "Tài xế đã nhận",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: <Package className="w-4 h-4" />,
    bgColor: "bg-purple-500"
  },
  delivering: {
    label: "Đang giao hàng",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    icon: <Truck className="w-4 h-4" />,
    bgColor: "bg-orange-500"
  },
  completed: {
    label: "Hoàn thành",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="w-4 h-4" />,
    bgColor: "bg-emerald-500"
  },
  canceled: {
    label: "Đã hủy",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: <XCircle className="w-4 h-4" />,
    bgColor: "bg-red-500"
  },
};

const PROGRESS_STEPS = [
  { key: "pending", label: "Chờ xác nhận", icon: Clock },
  { key: "confirmed", label: "Đã xác nhận", icon: CheckCircle2 },
  { key: "shipper_received", label: "Tài xế nhận đơn", icon: Package },
  { key: "delivering", label: "Đang giao", icon: Truck },
  { key: "completed", label: "Hoàn thành", icon: CheckCircle2 },
];

const formatPrice = (price: string | number) => {
  return Number(price).toLocaleString("vi-VN") + "đ";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("vi-VN", {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Define the ShipperLocation type (you can move this to a types file if you want)
export interface ShipperLocation {
  shipperId: string;
  latitude: number;
  longitude: number;
  updatedAt: string; // or Date, but GraphQL usually returns ISO string
}

// --- Child component for shipper location via Socket.io ---
function ShipperLocationSubscriber({
  shipperId,
  orderId,
  onData,
}: {
  shipperId: string;
  orderId?: string;
  onData: (data: { shipperLocationUpdated: ShipperLocation }) => void;
}) {
  useDeliverySocket({
    shipperId,
    orderId,
    onLocationUpdated: (payload) => {
      onData({
        shipperLocationUpdated: {
          shipperId: payload.shipperId,
          latitude: payload.latitude,
          longitude: payload.longitude,
          updatedAt: payload.updatedAt,
        },
      });
    },
  });
  return null;
}

export default function OrderDetailPage() {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { getToken } = useAuth();
  const { user } = useAuth();
  const userId = user?.id;
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);

  const [shipperLocationData, setShipperLocationData] = useState<{ shipperLocationUpdated: ShipperLocation } | null>(null);
  const { addToCart } = useCart();
  const [isReordering, setIsReordering] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const handleReorder = async () => {
    if (!order?.orderDetails || order.orderDetails.length === 0) return;
    setIsReordering(true);
    try {
      for (const item of order.orderDetails) {
        if (item.food?.id) {
          await addToCart(item.food.id, item.quantity || 1);
        }
      }
      toast.success(`Đã thêm ${order.orderDetails.length} món vào giỏ hàng!`);
      router.push("/checkout");
    } catch (err) {
      console.error("Failed to reorder:", err);
      toast.error("Không thể thêm món vào giỏ hàng");
    } finally {
      setIsReordering(false);
    }
  };

  const handleChatWithShipper = async () => {
    if (!user) {
      toast.info("Vui lòng đăng nhập để nhắn tin với tài xế");
      return;
    }
    const token = await getToken();
    const shipperId = order?.shippingDetail?.shipper?.id;
    if (!token || !shipperId) {
      toast.error("Không tìm thấy thông tin tài xế để kết nối");
      return;
    }
    try {
      setStartingChat(true);
      await userApi.messenger.createOrGetConversation(token, {
        participantId: shipperId,
        orderId: order.id,
        conversationType: ConversationType.CUSTOMER_SHIPPER,
      });
      router.push("/messenger");
    } catch (err) {
      console.error("Failed to start chat with shipper:", err);
      toast.error("Không thể kết nối trò chuyện với tài xế lúc này");
    } finally {
      setStartingChat(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      const token = await getToken();
      if (!token || !orderId) return;

      try {
        console.log("[DEBUG] Fetching order with ID:", orderId);
        const res = await adminService.Order.getOrderById(token, orderId);
        setOrder(res);
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, getToken]);

  const handleReviewSubmitted = async () => {
    const token = getToken ? getToken() : null;
    if (!token || !orderId) return;

    try {
      const res = await adminService.Order.getOrderById(token, orderId);
      setOrder(res);
    } catch (err) {
      console.error("Failed to refresh order", err);
    }
  };

  // Real-time order status tracking via Socket.io
  useOrderSocket({
    orderId,
    userId,
    onStatusUpdated: (payload) => {
      if (payload && payload.orderId === orderId) {
        setOrder((prev) =>
          prev && prev.status !== payload.status
            ? { ...prev, status: payload.status }
            : prev
        );

        if (payload.status === "shipper_received" || payload.status === "delivering") {
          const token = getToken ? getToken() : null;
          if (token && orderId) {
            adminService.Order.getOrderById(token, orderId).then(setOrder).catch(console.error);
          }
        }
      }
    },
  });

  useEffect(() => {
    if (order) {
      setUserLocation({
        lat: order.address?.latitude || 0,
        lng: order.address?.longitude || 0,
      });
    }
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-500 mb-6">Đơn hàng có thể đã bị xóa hoặc không tồn tại</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const defaultAddress = order.user.address.find(addr => addr.isDefault) || order.user.address[0];
  const currentStepIndex = PROGRESS_STEPS.findIndex((s) => s.key === order.status);

  // Find shipper info if available
  const shipper = order.shippingDetail?.shipper;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="rounded-xl hover:bg-slate-100">
                <Link href="/order" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-semibold text-xs sm:text-sm">Đơn hàng của tôi</span>
                </Link>
              </Button>
              <span className="text-gray-300">/</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                  Đơn hàng #{order.id.slice(-8).toUpperCase()}
                </h1>
                <p className="text-xs text-gray-500">
                  Đặt lúc {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`px-3.5 py-1.5 text-xs font-bold border ${statusConfig.color}`}>
                {statusConfig.icon}
                <span className="ml-1.5">{statusConfig.label}</span>
              </Badge>
              {(order.status === "completed" || order.status === "canceled") && (
                <Button
                  size="sm"
                  onClick={handleReorder}
                  disabled={isReordering}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs"
                >
                  <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${isReordering ? "animate-spin" : ""}`} />
                  {isReordering ? "Đang xử lý..." : "Đặt lại đơn này"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Trạng thái đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {order.status === "canceled" ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center space-y-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                      <XCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-rose-900">Đơn hàng này đã bị hủy</h3>
                    <p className="text-sm text-rose-700 max-w-md mx-auto">
                      Rất tiếc vì sự bất tiện này. Nếu đơn hàng đã được thanh toán trực tuyến, số tiền sẽ được tự động hoàn lại theo chính sách hoàn tiền của Foodee.
                    </p>
                    <div className="pt-2 flex flex-wrap justify-center gap-3">
                      <Button
                        onClick={handleReorder}
                        disabled={isReordering}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${isReordering ? "animate-spin" : ""}`} />
                        {isReordering ? "Đang thêm món..." : "Đặt lại đơn này"}
                      </Button>
                      <Button variant="outline" size="sm" asChild className="text-xs font-semibold">
                        <Link href="/search">Khám phá món khác</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative pt-2 pb-1">
                    {/* Connecting progress line */}
                    <div className="absolute top-5 left-8 right-8 h-1 bg-gray-200 -z-0">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: `${(Math.max(0, currentStepIndex) / (PROGRESS_STEPS.length - 1)) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                      {PROGRESS_STEPS.map((step, index) => {
                        const StepIcon = step.icon;
                        const isCurrent = index === currentStepIndex;
                        const isPassed = currentStepIndex >= 0 && index < currentStepIndex;

                        return (
                          <div key={step.key} className="flex flex-col items-center flex-1">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                isCurrent
                                  ? "bg-primary border-primary text-white ring-4 ring-primary/20 shadow-md scale-110"
                                  : isPassed
                                  ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                                  : "bg-white border-gray-300 text-gray-400"
                              }`}
                            >
                              <StepIcon className="w-4 h-4" />
                            </div>
                            <p
                              className={`text-xs mt-2 text-center font-medium ${
                                isCurrent
                                  ? "text-primary font-bold"
                                  : isPassed
                                  ? "text-emerald-700 font-semibold"
                                  : "text-gray-400"
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Restaurant Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Thông tin nhà hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={order.restaurant.avatar} alt={order.restaurant.name} />
                    <AvatarFallback>{order.restaurant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{order.restaurant.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{order.restaurant.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{order.restaurant.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{order.restaurant.phoneNumber}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-1 mt-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600">
                        {order.restaurant.address.street}, {order.restaurant.address.ward}, {order.restaurant.address.district}, {order.restaurant.address.city}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items with Individual Rating */}
            <Card>
              <CardHeader>
                <CardTitle>Món ăn đã đặt</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {order.orderDetails.map((item) => (
                  <div key={item.id} className="p-6 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={item.food.image}
                          alt={item.food.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.food.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.food.description}</p>
                        {item.food.discountPercent && Number(item.food.discountPercent) > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm line-through text-gray-400">
                              {formatPrice(item.food.price)}
                            </span>
                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-600">
                              -{item.food.discountPercent}%
                            </Badge>
                          </div>
                        )}
                        {item.note && (
                          <div className="flex items-start gap-1 mt-2">
                            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span className="text-sm text-gray-600">{item.note}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                        <p className="font-semibold text-emerald-600">
                          {formatPrice(item.price)}
                        </p>
                        {/* Individual rating buttons removed */}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Theo dõi đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[400px] rounded-xl overflow-hidden">
                  {/* Start shipper location subscription when status is shipper_received OR delivering */}
                  {(order.status === "shipper_received" || order.status === "delivering") ? (
                    <>
                      {order.shippingDetail && order.shippingDetail.shipper?.id && (
                        <ShipperLocationSubscriber
                          shipperId={order.shippingDetail.shipper.id}
                          orderId={order.id}
                          onData={setShipperLocationData}
                        />
                      )}
                      
                      {/* Shipper Info */}
                      {shipper && (
                        <div className="mb-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Truck className="w-5 h-5" />
                                Thông tin tài xế
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-row items-start gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <Avatar>
                                  <AvatarImage src={shipper.avatar} alt={shipper.name} />
                                  <AvatarFallback>{shipper.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-semibold">{shipper.name}</h4>
                                  <p className="text-sm text-gray-600">{shipper.phone}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {order.status === "shipper_received" 
                                      ? "Tài xế đang đến nhà hàng" 
                                      : "Tài xế đang giao hàng đến bạn"
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 ml-auto">
                                <Button
                                  size="sm"
                                  onClick={handleChatWithShipper}
                                  disabled={startingChat}
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                  {startingChat ? "Đang kết nối..." : "Nhắn tin với tài xế"}
                                </Button>
                                {shipper.phone && (
                                  <Button size="sm" variant="outline" asChild className="text-xs font-semibold">
                                    <a href={`tel:${shipper.phone}`}>
                                      <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                                      Gọi điện
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                      
                      {/* Map with shipper tracking */}
                      <Map
                        shipperLocation={shipperLocationData?.shipperLocationUpdated}
                        userLocation={userLocation}
                      />
                    </>
                  ) : order.status === "completed" ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <CheckCircle2 className="w-16 h-16 mb-4 text-green-500" />
                      <p className="text-lg font-semibold text-green-600">Đơn hàng đã được giao thành công!</p>
                      <p className="text-sm">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi</p>
                    </div>
                  ) : order.status === "canceled" ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <XCircle className="w-16 h-16 mb-4 text-red-500" />
                      <p className="text-lg font-semibold text-red-600">Đơn hàng đã bị hủy</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Loader2 className="animate-spin w-10 h-10 mb-4" />
                      <p>
                        {order.status === "pending" 
                          ? "Đang chờ nhà hàng xác nhận đơn hàng..." 
                          : order.status === "confirmed"
                          ? "Hệ thống đang tìm tài xế giao hàng cho bạn..."
                          : "Đang xử lý đơn hàng..."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={order.user.avatar} alt={order.user.name} />
                    <AvatarFallback>{order.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{order.user.name}</h4>
                    <p className="text-sm text-gray-600">{order.user.email}</p>
                    <p className="text-sm text-gray-600">{order.user.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            {defaultAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Địa chỉ giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {defaultAddress.label && (
                      <Badge variant="outline" className="text-xs">
                        {defaultAddress.label}
                      </Badge>
                    )}
                    <p className="text-sm">
                      {defaultAddress.street}
                    </p>
                    <p className="text-sm text-gray-600">
                      {defaultAddress.ward}, {defaultAddress.district}, {defaultAddress.city}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Phương thức:</span>
                  <span className="font-medium">
                    {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Trạng thái:</span>
                  <Badge variant={order.isPaid ? "default" : "outline"} className="text-xs">
                    {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </Badge>
                </div>
                {order.paymentDate && (
                  <div className="flex justify-between text-sm">
                    <span>Ngày thanh toán:</span>
                    <span>{formatDate(order.paymentDate)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold text-emerald-600">
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Note */}
            {order.note && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Ghi chú
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{order.note}</p>
                </CardContent>
              </Card>
            )}

              {/* Actions */}
              <div className="space-y-3">
                {/* Đánh giá tài xế */}
                {order.status === 'completed' && order.reviewInfo && !order.reviewInfo.hasReviewedShipper && order.shippingDetail?.shipper && (
                  <ShipperRatingModal
                    shipper={order.shippingDetail.shipper}
                    onSubmitted={handleReviewSubmitted}
                    trigger={
                      <Button className="w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white hover:from-blue-500 hover:to-purple-600">
                        <Star className="w-4 h-4 mr-2" />
                        Đánh giá tài xế
                      </Button>
                    }
                  />
                )}

                {/* Đánh giá món ăn */}
                {order.status === 'completed' && order.reviewInfo && !order.reviewInfo.hasReviewedFood && (
                  <RatingModal
                    orderDetails={order.orderDetails}
                    onReviewSubmitted={handleReviewSubmitted}
                    trigger={
                      <Button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white">
                        <Star className="w-4 h-4 mr-2" />
                        Đánh giá món ăn
                      </Button>
                    }
                  />
                )}

                {/* Liên hệ hỗ trợ
                <Button variant="outline" className="w-full">
                  Liên hệ hỗ trợ
                </Button> */}
              </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}
