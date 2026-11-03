# KẾ HOẠCH CHUYỂN ĐỔI TOÀN DIỆN CHO WEB-CLIENT: TỪ GRAPHQL SANG SOCKET.IO

> **Dự án:** FOODE Web Client (`Next.js 15 App Router` + `React 19`)  
> **Mục tiêu:** Tháo dỡ hoàn toàn Apollo Client & GraphQL Subscriptions, thay thế bằng Socket.io Client tinh gọn; giảm 100KB bundle JS, tăng tốc độ tải trang và đồng bộ hoàn hảo với backend.

---

## I. KẾT QUẢ KHẢO SÁT GRAPHQL TRÊN `WEB-CLIENT`

Sau khi quét toàn bộ thư mục `web-client/src`:

### 1. Sự thật về GraphQL trong Frontend
* **Không có bất kỳ GraphQL Query hay Mutation nào:** Toàn bộ thao tác fetch dữ liệu (Menu, Món ăn, Đặt hàng, Nhà hàng, User, Giỏ hàng) đều đang chạy bằng **REST API (`fetch` / `axios`)**.
* **Chỉ dùng duy nhất cho 4 Subscriptions (WebSocket):**
  1. `orderSubscriptions.ts`: Nhận đơn mới cho Chủ nhà hàng (`OrderCreated`) và Cập nhật trạng thái đơn cho Khách (`OrderStatusUpdated`).
  2. `shipperSubscriptions.ts`: Cập nhật toạ độ GPS tài xế (`ShipperLocationUpdated`).
  3. `messengerSubscriptions.ts`: Nhận tin nhắn chat mới (`MessageSent`).
  4. `notificationSubscriptions.ts`: Nhận chuông thông báo (`NotificationAdded`).

### 2. Danh sách 16 files bị ảnh hưởng trực tiếp

```
web-client/src/
├── lib/graphql/
│   ├── apolloClient.ts                              <-- Khởi tạo Apollo Link & WS Link
│   └── subscriptions/
│       ├── orderSubscriptions.ts                     <-- GQL Order Subscriptions
│       ├── shipperSubscriptions.ts                   <-- GQL Shipper GPS
│       ├── messengerSubscriptions.ts                 <-- GQL Chat Message
│       └── notificationSubscriptions.ts              <-- GQL Notifications
├── hooks/
│   ├── use-order-subscription.ts                    <-- Hook nhận đơn mới của Owner
│   └── use-order-status-subscription.ts             <-- Hook tracking đơn của Customer
├── context/
│   └── owner-notification-context.tsx               <-- Nhận thông báo realtime cho Owner
└── app/
    ├── (main)/
    │   ├── _components/main-providers.tsx           <-- Bọc <ApolloProvider>
    │   ├── _components/navigation/navbar.tsx         <-- Subscribe chuông thông báo
    │   ├── order/[id]/page.tsx                      <-- Theo dõi đơn hàng & GPS shipper
    │   └── messenger/page.tsx                       <-- Chat realtime Khách - Shipper
    └── (owner)/
        ├── layout.tsx                               <-- Bọc <ApolloProvider>
        └── restaurant/[id]/edit/
            ├── messenger/page.tsx                   <-- Chat realtime Chủ quán - Khách
            └── order-list/...                       <-- Danh sách đơn realtime
```

---

## II. THIẾT KẾ KIẾN TRÚC MỤC TIÊU VỚI SOCKET.IO

```mermaid
flowchart TD
    subgraph "Next.js 15 App (web-client)"
        RootLayout["Root Layout / MainProviders"]
        SocketProvider["<SocketProvider> (Quản lý Singleton Socket)"]
        RootLayout --> SocketProvider
        
        subgraph "Custom Hooks (Tự động Join/Leave Room)"
            HookOrder["useOrderTracking(orderId)"]
            HookRest["useRestaurantOrders(restaurantId)"]
            HookChat["useChat(conversationId)"]
            HookNotify["useNotifications()"]
        end

        SocketProvider --> HookOrder
        SocketProvider --> HookRest
        SocketProvider --> HookChat
        SocketProvider --> HookNotify

        HookOrder --> PageOrder["Trang /order/[id]"]
        HookRest --> PageOwner["Trang Quản lý đơn hàng Owner"]
        HookChat --> PageMessenger["Trang /messenger"]
        HookNotify --> CompNavbar["Chuông thông báo Navbar"]
    end

    subgraph "Core API Backend"
        SocketServer["NestJS Socket.io Gateways"]
    end

    SocketProvider <==>|WebSocket WSS (JWT Authenticated)| SocketServer
```

---

## III. MÃ NGUỒN TRIỂN KHAI CHI TIẾT (STEP-BY-STEP)

### Bước 1: Cài đặt thư viện Socket.io Client

```bash
npm --prefix web-client install socket.io-client
```
*(Gói `socket.io-client` chỉ nặng ~10KB minified, nhẹ hơn gấp 8 lần so với bộ `@apollo/client` + `graphql`)*.

---

### Bước 2: Tạo `SocketContext` & `SocketProvider` tập trung

Tạo file mới: `web-client/src/lib/socket/socket-context.tsx`:

```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const socketInstance: Socket = io(apiUrl, {
      auth: { token: token ? `Bearer ${token}` : '' },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('📶 Socket.io connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('📶 Socket.io disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('📶 Socket.io connection error:', error.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
```

---

### Bước 3: Thay thế `ApolloProvider` tại các Layouts

#### 1. Tại `web-client/src/app/(main)/_components/main-providers.tsx`:
Thay `<ApolloProvider client={apolloClient}>` bằng `<SocketProvider>`:

```tsx
import { SocketProvider } from "@/lib/socket/socket-context";

export default function MainProviders({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      <NotificationProvider>
        <AuthModalProvider>
          <CartProvider>
            <CartDrawerProvider>
              <GeoLocationProvider>
                {children}
                <ChatWidget />
                <CartDrawer />
              </GeoLocationProvider>
            </CartDrawerProvider>
          </CartProvider>
        </AuthModalProvider>
      </NotificationProvider>
    </SocketProvider>
  );
}
```

#### 2. Tại `web-client/src/app/(owner)/layout.tsx`:
Tương tự, bọc bằng `<SocketProvider>` thay vì Apollo:

```tsx
'use client';

import { SocketProvider } from '@/lib/socket/socket-context';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <SocketProvider>{children}</SocketProvider>;
}
```

---

### Bước 4: Xây dựng các Custom Hooks thay thế hoàn toàn GQL Subscriptions

#### 1. Hook Theo Dõi Đơn Hàng & Toạ Độ Shipper
Tạo file: `web-client/src/hooks/use-order-tracking-socket.ts` (thay thế cho `use-order-status-subscription.ts` và `SHIPPER_LOCATION_SUBSCRIPTION`):

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/lib/socket/socket-context';

export interface OrderStatusPayload {
  orderId: string;
  status: string;
  updatedAt: string;
}

export interface ShipperLocationPayload {
  shipperId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export function useOrderTrackingSocket(orderId: string, shipperId?: string) {
  const { socket, isConnected } = useSocket();
  const [orderStatus, setOrderStatus] = useState<OrderStatusPayload | null>(null);
  const [shipperLocation, setShipperLocation] = useState<ShipperLocationPayload | null>(null);

  useEffect(() => {
    if (!socket || !isConnected || !orderId) return;

    // Vào room theo dõi đơn hàng
    socket.emit('order:join', { orderId });

    socket.on('order:status_updated', (data: OrderStatusPayload) => {
      if (data.orderId === orderId) {
        setOrderStatus(data);
      }
    });

    // Nếu đơn có tài xế, lắng nghe vị trí GPS của tài xế
    if (shipperId) {
      socket.emit('shipper:subscribe_location', { shipperId });
      socket.on('shipper:location_updated', (data: ShipperLocationPayload) => {
        if (data.shipperId === shipperId) {
          setShipperLocation(data);
        }
      });
    }

    return () => {
      socket.emit('order:leave', { orderId });
      socket.off('order:status_updated');
      if (shipperId) {
        socket.emit('shipper:unsubscribe_location', { shipperId });
        socket.off('shipper:location_updated');
      }
    };
  }, [socket, isConnected, orderId, shipperId]);

  return { orderStatus, shipperLocation };
}
```

#### 2. Hook Nhận Đơn Mới Cho Nhà Hàng (Owner)
Tạo file: `web-client/src/hooks/use-restaurant-orders-socket.ts` (thay thế cho `use-order-subscription.ts`):

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/lib/socket/socket-context';

export function useRestaurantOrdersSocket(restaurantId: string, onNewOrder?: (order: any) => void) {
  const { socket, isConnected } = useSocket();
  const [latestOrder, setLatestOrder] = useState<any>(null);

  useEffect(() => {
    if (!socket || !isConnected || !restaurantId) return;

    socket.emit('restaurant:join', { restaurantId });

    socket.on('restaurant:order_created', (newOrder: any) => {
      setLatestOrder(newOrder);
      if (onNewOrder) onNewOrder(newOrder);
    });

    return () => {
      socket.emit('restaurant:leave', { restaurantId });
      socket.off('restaurant:order_created');
    };
  }, [socket, isConnected, restaurantId, onNewOrder]);

  return { latestOrder };
}
```

#### 3. Hook Chat Trực Tuyến (Messenger)
Tạo file: `web-client/src/hooks/use-chat-socket.ts` (thay thế cho `messengerSubscriptions.ts`):

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/lib/socket/socket-context';

export function useChatSocket(conversationId: string) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!socket || !isConnected || !conversationId) return;

    socket.emit('chat:join', { conversationId });

    socket.on('chat:message_received', (newMessage: any) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.emit('chat:leave', { conversationId });
      socket.off('chat:message_received');
    };
  }, [socket, isConnected, conversationId]);

  const sendMessage = (content: string, metadata?: any) => {
    if (!socket) return;
    socket.emit('chat:send_message', { conversationId, content, metadata });
  };

  return { messages, sendMessage };
}
```

#### 4. Hook Chuông Thông Báo (Notifications)
Tạo file: `web-client/src/hooks/use-notifications-socket.ts` (thay thế cho `notificationSubscriptions.ts`):

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/lib/socket/socket-context';

export function useNotificationsSocket(userId?: string) {
  const { socket, isConnected } = useSocket();
  const [newNotification, setNewNotification] = useState<any>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('notification:received', (notification: any) => {
      setNewNotification(notification);
    });

    return () => {
      socket.off('notification:received');
    };
  }, [socket, isConnected]);

  return { newNotification };
}
```

---

## IV. LỘ TRÌNH 4 BƯỚC THI CÔNG TRÊN WEB-CLIENT

```
[Bước 1: Setup SocketProvider] ──► [Bước 2: Migrate Order Tracking] ──► [Bước 3: Migrate Chat & Thông báo] ──► [Bước 4: Gỡ bỏ Apollo]
Cài socket.io-client             Cập nhật trang /order/[id]          Cập nhật trang /messenger            Gỡ bỏ @apollo/client
Bọc SocketProvider tại layout    và trang Quản lý đơn của Owner      và chuông thông báo Navbar           và xóa thư mục lib/graphql
```

### Bước 1: Setup Hạ Tầng Socket Client (1 ngày)
- Cài đặt `socket.io-client`.
- Tạo `SocketProvider` và bọc vào `main-providers.tsx` và `owner/layout.tsx`.
- Lúc này, cả ApolloProvider và SocketProvider có thể chạy song song (không xung đột).

### Bước 2: Migrate Trang Đơn Hàng & Quản Lý Nhà Hàng (1 - 2 ngày)
- Sửa trang `web-client/src/app/(main)/order/[id]/page.tsx` sử dụng hook `useOrderTrackingSocket`.
- Sửa trang `web-client/src/app/(owner)/restaurant/[id]/edit/order-list/...` sử dụng `useRestaurantOrdersSocket`.
- Kiểm tra tính năng nhận đơn mới có chuông reo và toạ độ tài xế chạy trên bản đồ.

### Bước 3: Migrate Trang Chat & Chuông Thông Báo (1 ngày)
- Sửa trang `web-client/src/app/(main)/messenger/page.tsx` và `owner/.../messenger/page.tsx` sử dụng `useChatSocket`.
- Sửa `owner-notification-context.tsx` và `navbar.tsx` sử dụng `useNotificationsSocket`.

### Bước 4: Tháo Dỡ Hoàn Toàn Apollo & Dọn Dẹp (Nửa ngày)
1. Xóa thư mục `web-client/src/lib/graphql`.
2. Xóa các hooks cũ: `use-order-subscription.ts`, `use-order-status-subscription.ts`.
3. Chạy lệnh gỡ bỏ packages:
   ```bash
   npm --prefix web-client uninstall @apollo/client graphql graphql-ws
   ```
4. Chạy kiểm tra TypeScript và Build:
   ```bash
   npm --prefix web-client run typecheck
   npm --prefix web-client run build
   ```

---

## V. HIỆU QUẢ SAU CHUYỂN ĐỔI ĐỐI VỚI `WEB-CLIENT`

| Chỉ số hiệu năng | Sử dụng GraphQL Apollo (Hiện tại) | Sử dụng Socket.io (Mục tiêu) | Mức cải thiện |
| :--- | :---: | :---: | :---: |
| **Kích thước JavaScript Bundle** | Nặng thêm ~95KB (min+gzip) | **Chỉ ~10KB (min+gzip)** | **Giảm ~85KB tải mạng** |
| **Tốc độ Tải trang ban đầu (FCP/LCP)** | Chậm hơn do nạp Apollo Link & cache | **Nhanh hơn rõ rệt** | **Tăng điểm Google Lighthouse** |
| **Rủi ro Memory Leak trên Trình duyệt** | Có (Apollo InMemoryCache giữ cache lâu) | **Không (Event listener dọn sạch khi unmount)** | **Web chạy mượt, không đơ tab** |
| **Độ dễ bảo trì (Maintainability)** | Phức tạp (Cần hiểu GQL syntax, split links) | **Rất dễ (Bất kỳ dev React nào cũng làm được)** | **Dễ tuyển dụng & bàn giao** |

---

## VI. KẾT LUẬN

Phương án chuyển đổi `web-client` sang **Socket.io** hoàn toàn khả thi, mạch lạc và mang lại lợi ích trực tiếp cho người dùng cuối (trang web tải nhanh hơn, nhẹ hơn, kết nối ổn định hơn).

Việc tiến hành đồng thời với backend theo kế hoạch trên sẽ giúp hệ sinh thái **FOODE** trở nên đồng nhất, hiện đại và chuẩn mực.

