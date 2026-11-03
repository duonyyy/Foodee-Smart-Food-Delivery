# ERD Foodee từ entity và migration

Sơ đồ này mô tả **PostgreSQL schema dự kiến sau khi chạy đủ migration**: 28 bảng nghiệp vụ được tạo qua 37 migration trong [`src/migrations`](../core-api/src/migrations). Mã nguồn có 27 entity class, nhưng [`entity-registry.ts`](../core-api/src/infra/database/entity-registry.ts) chỉ đăng ký 26; `promotion_redemptions` có entity và migration riêng, còn `role_permissions` là bảng nối Many-to-Many. Đây là bản đọc mã nguồn, **chưa đối chiếu với database đang chạy**. Tên bảng/cột giữ nguyên chữ hoa, chữ thường của PostgreSQL; ví dụ `address`, `orderDetails`, `shippingDetails` là tên thực tế trong migration. Bảng bookkeeping `migrations` của TypeORM không tính vào 28 bảng nghiệp vụ.

Ký hiệu `PK` là khóa chính, `FK` là khóa ngoại, `UK` là duy nhất. Các bảng được lặp lại giữa các sơ đồ chỉ để dễ đọc. Đường nối chỉ biểu diễn **FK có trong migration**. Một cột có tên `...Id` mà không có FK được liệt kê ở cuối tài liệu.

## 1. Tài khoản, phân quyền và thực đơn

```mermaid
erDiagram
    roles {
        uuid id PK
        enum name UK
    }
    permissions {
        uuid id PK
        varchar name UK
    }
    role_permissions {
        uuid role_id PK, FK
        uuid permission_id PK, FK
    }
    users {
        varchar id PK
        uuid role_id FK
        varchar username UK
        varchar phone UK
    }
    address {
        uuid id PK
        varchar userId FK
        varchar street
        varchar city
    }
    restaurants {
        uuid id PK
        varchar owner_id FK
        uuid addressId FK
        varchar name
        enum status
    }
    restaurant_approval_audits {
        uuid id PK
        uuid restaurant_id FK
        uuid actor_user_id
        varchar action
    }
    categories {
        uuid id PK
        varchar name
    }
    foods {
        uuid id PK
        uuid restaurant_id FK
        uuid category_id FK
        varchar name
        decimal price
    }
    toppings {
        uuid id PK
        uuid food_id FK
        varchar name
        decimal price
    }

    roles ||--o{ users : "users.role_id"
    roles ||--o{ role_permissions : "role_permissions.role_id"
    permissions ||--o{ role_permissions : "role_permissions.permission_id"
    users ||--o{ address : "address.userId"
    users ||--o| restaurants : "restaurants.owner_id"
    address ||--o{ restaurants : "restaurants.addressId"
    restaurants ||--o{ restaurant_approval_audits : "restaurant_id"
    restaurants ||--o{ foods : "foods.restaurant_id"
    categories ||--o{ foods : "foods.category_id"
    foods ||--o{ toppings : "toppings.food_id"
```

`categories` là danh mục chung: bảng này **không có `restaurant_id`**. `restaurant_approval_audits.actor_user_id` là `uuid`, còn `users.id` là `varchar(28)`; migration chỉ tạo index, không tạo FK tới `users`. Một `owner_id` có ràng buộc unique nên hiện một user sở hữu tối đa một restaurant qua cột đó.

## 2. Đặt hàng, thanh toán, khuyến mãi và đánh giá

```mermaid
erDiagram
    users {
        varchar id PK
    }
    restaurants {
        uuid id PK
    }
    address {
        uuid id PK
    }
    promotions {
        uuid id PK
        varchar code
    }
    foods {
        uuid id PK
    }
    orders {
        uuid id PK
        varchar user_id FK
        uuid restaurant_id FK
        uuid address_id FK
        uuid promotion_id FK
        uuid shippingDetail_id FK
        enum status
        int total
    }
    orderDetails {
        uuid id PK
        uuid order_id FK
        uuid food_id FK
        int quantity
        varchar food_name_snapshot
        decimal unit_price_snapshot
        text selected_toppings
    }
    shippingDetails {
        uuid id PK
        uuid order_id FK
        varchar user_id FK
        enum status
    }
    checkouts {
        uuid id PK
        uuid orderId FK
        varchar customerId
        decimal amount
        enum status
    }
    promotion_redemptions {
        uuid id PK
        uuid order_id FK, UK
        varchar customer_id FK
        uuid promotion_id FK
        varchar status
    }
    reviews {
        uuid id PK
        varchar user_id FK
        uuid food_id FK
        varchar shipper_id FK
        uuid order_id FK
        enum type
    }
    pending_shipper_assignments {
        uuid id PK
        uuid order_id FK
        int priority
    }

    users ||--o{ orders : "orders.user_id"
    restaurants ||--o{ orders : "orders.restaurant_id"
    address ||--o{ orders : "orders.address_id"
    promotions ||--o{ orders : "orders.promotion_id"
    orders ||--o{ orderDetails : "orderDetails.order_id"
    foods ||--o{ orderDetails : "orderDetails.food_id"
    orders ||--o| shippingDetails : "shippingDetails.order_id"
    shippingDetails ||--o| orders : "orders.shippingDetail_id"
    users ||--o{ shippingDetails : "shippingDetails.user_id"
    orders ||--o{ checkouts : "checkouts.orderId"
    orders ||--o| promotion_redemptions : "promotion_redemptions.order_id"
    users ||--o{ promotion_redemptions : "promotion_redemptions.customer_id"
    promotions ||--o{ promotion_redemptions : "promotion_redemptions.promotion_id"
    orders ||--o{ reviews : "reviews.order_id"
    users ||--o{ reviews : "reviews.user_id"
    users ||--o{ reviews : "reviews.shipper_id"
    foods ||--o{ reviews : "reviews.food_id"
    orders ||--o{ pending_shipper_assignments : "order_id"
```

Hai bảng `orders` và `shippingDetails` đang giữ **hai FK ngược chiều**, mỗi cột có unique để biểu diễn 1–1. Đây là cấu trúc hiện tại trong migration, không phải hai quan hệ giao hàng khác nhau. `checkouts.orderId` vẫn có FK tới `orders`, dù entity Payment chỉ khai báo cột scalar; một order có thể có nhiều checkout. `checkouts.customerId` là snapshot, không có FK tới `users`. Topping đã chọn được lưu trong `orderDetails.selected_toppings` dạng JSON, không có bảng nối tới `toppings`.

Đánh giá không bị giới hạn thành “một review cho mỗi order”. Migration tạo unique có điều kiện theo `(order_id, user_id, food_id)` cho review món và `(order_id, user_id, shipper_id)` cho review tài xế; `reviews.order_id` cho dữ liệu cũ vẫn nullable.

## 3. Hồ sơ tài xế và hội thoại

```mermaid
erDiagram
    users {
        varchar id PK
    }
    shipperCertificateInfos {
        uuid id PK
        varchar user_id FK, UK
        varchar cccd
        enum status
    }
    shipper_profiles {
        varchar user_id PK, FK
        boolean is_available
        int max_active_deliveries
    }
    orders {
        uuid id PK
    }
    restaurants {
        uuid id PK
    }
    conversations {
        uuid id PK
        varchar participant1_id FK
        varchar participant2_id FK
        uuid orderId FK
        uuid restaurantId FK
        enum conversationType
    }
    messages {
        uuid id PK
        uuid conversation_id FK
        varchar sender_id FK
        uuid replyToMessageId FK
        text content
    }

    users ||--o| shipperCertificateInfos : "user_id"
    users ||--o| shipper_profiles : "user_id"
    users ||--o{ conversations : "participant1_id"
    users ||--o{ conversations : "participant2_id"
    orders ||--o{ conversations : "orderId"
    restaurants ||--o{ conversations : "restaurantId"
    conversations ||--o{ messages : "conversation_id"
    users ||--o{ messages : "sender_id"
    messages ||--o{ messages : "replyToMessageId"
```

`shipperCertificateInfos` và `shipper_profiles` đều nối với `users`, nhưng **không có FK trực tiếp giữa hai bảng**. `shipper_profiles` là mô hình Delivery mới; migration còn giữ các cột thống kê tài xế cũ trong `users` để tương thích.

## 4. Bảng sự kiện, projection và cấu hình độc lập

```mermaid
erDiagram
    outbox_events {
        uuid id PK
        varchar aggregate_type
        uuid aggregate_id
        varchar idempotency_key UK
        jsonb payload
        enum status
    }
    delivery_earnings_events {
        uuid id PK
        uuid order_id UK
        varchar shipper_id
        float earnings
    }
    analytics_order_metrics {
        uuid id PK
        uuid order_id UK
        varchar restaurant_id
        varchar customer_id
        varchar shipper_id
        decimal total
    }
    notifications {
        uuid id PK
        varchar receiveUser
        varchar idempotency_key UK
        boolean isRead
    }
    notification_dead_letters {
        uuid id PK
        varchar recipient_user_id
        varchar idempotency_key UK
        jsonb payload
    }
    system_constraints {
        int id PK
        float max_delivery_distance
        int max_active_deliveries
    }
```

Các bảng ở phần này **không có FK tới bảng nghiệp vụ khác** theo migration hiện tại. `order_id`, `shipper_id`, `aggregate_id`, `receiveUser` và `recipient_user_id` là tham chiếu logic hoặc snapshot, không được PostgreSQL cưỡng chế bằng FK. `outbox_events.aggregate_id` còn phụ thuộc `aggregate_type`, nên không thể coi mặc định là `orders.id`.

## Điểm cần kiểm tra khi so với database thật

1. Chạy `SELECT id, timestamp, name FROM migrations ORDER BY timestamp;` để biết môi trường đã áp dụng đến migration nào. Nếu chưa chạy hết, ERD này có thể khác schema thật.
2. Đối chiếu ràng buộc FK thực tế bằng `pg_constraint`; các entity TypeORM và migration có chỗ biểu diễn khác nhau, rõ nhất là `checkouts.orderId`, `reviews.order_id` và `promotion_redemptions.customer_id`.
3. [`PromotionRedemption`](../core-api/src/entities/promotion-redemption.entity.ts) chưa có trong `DATABASE_ENTITIES` và [`autoLoadEntities`](../core-api/src/infra/database/database.options.ts) được đặt `false`. Migration vẫn tạo bảng, nhưng đường truy cập repository TypeORM của entity này cần được kiểm tra và sửa riêng trước khi coi tính năng áp mã là ổn định.
4. Tài liệu [`DATABASE_DESIGN.md`](DATABASE_DESIGN.md) là mô tả kiến trúc cũ; một số tên bảng, cardinality và quan hệ ở đó không đúng với migration hiện tại. Dùng sơ đồ này khi cần đối chiếu database triển khai.
