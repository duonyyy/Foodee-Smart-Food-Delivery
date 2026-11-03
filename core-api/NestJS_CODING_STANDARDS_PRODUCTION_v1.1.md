# CODING STANDARDS — NestJS Production

> **Phiên bản tài liệu:** 1.1.0  
> **Cập nhật:** 2026-10-29  
> **Phạm vi:** Backend NestJS + TypeScript, REST API; không bắt buộc DDD, Clean Architecture hoặc Domain-First.  
> **Mục tiêu:** Dễ đọc, dễ kiểm thử, an toàn, dễ vận hành và nhất quán giữa các thành viên/AI coding agents.

## 0. Quy ước và cách áp dụng

- **MUST / MUST NOT:** Bắt buộc. Vi phạm phải sửa trước khi merge, trừ khi có ngoại lệ được duyệt và ghi nhận.
- **SHOULD / SHOULD NOT:** Mặc định nên áp dụng. Ngoại lệ cần lý do kỹ thuật rõ ràng trong PR/ADR.
- **MAY:** Tùy chọn theo nhu cầu.
- **Example:** Mã ví dụ minh họa hợp đồng/quy tắc; không phải là toàn bộ ứng dụng chạy độc lập.
- **Ưu tiên khi xung đột:** An toàn & tính đúng đắn > API contract > tính nhất quán mã nguồn > sở thích cá nhân.
- **Ngôn ngữ:** Tên mã nguồn, API, schema, commit và log field **MUST** dùng tiếng Anh. README/tài liệu nghiệp vụ **MAY** dùng tiếng Việt. Không dùng tiếng Việt không dấu để đặt tên biến.
- **Phạm vi phiên bản:** Chỉ sử dụng các bản NestJS/Node.js/TypeScript đang được hỗ trợ và tương thích lẫn nhau. Node.js production **MUST** thuộc nhánh Active/Maintenance LTS; pin version bằng `.nvmrc`/`.node-version`, `engines` và lockfile.
- **Quy tắc hiện hữu:** Khi bổ sung vào repository đang chạy, thay đổi quy ước có tính breaking phải có kế hoạch migration; không đổi hàng loạt chỉ để đẹp code.

### 0.1. Các quyết định mặc định của repository

| Chủ đề | Mặc định |
|---|---|
| Tổ chức code | Cấu trúc **NestJS feature-based** đơn giản (`module`, `controller`, `service`, `dto`); không áp đặt DDD/layered architecture |
| Transport | REST JSON, prefix `/api`, URI versioning `/api/v1` |
| Ngôn ngữ | TypeScript `strict: true` |
| Input validation | DTO class + `class-validator` + `class-transformer` + global `ValidationPipe` |
| Output | Response DTO/map explicit; **không** trả ORM entity trực tiếp |
| Errors | HTTP status chuẩn + Problem Details tương thích RFC 9457 (qua global filter) |
| Format/lint | Prettier + ESLint flat config + type-aware TypeScript linting |
| Database | ORM tùy dự án; persistence tách khỏi HTTP contract; migration bắt buộc |
| Dependency injection | NestJS constructor injection, token rõ ràng |
| AuthZ | Deny-by-default, kiểm tra quyền ở mức resource và tenant |
| Tests | Unit + integration + e2e + security cases; chạy tự động trong CI |
| Observability | Structured JSON logs + correlation/request ID + metrics/traces |

Nếu dự án thay đổi một mặc định ảnh hưởng đến nhiều thành viên (ví dụ GraphQL, ORM, thư viện validation), **MUST** cập nhật README/tài liệu kỹ thuật; **MAY** viết ADR khi quyết định có tác động dài hạn.

---

## 1. Nguyên tắc thiết kế

1. **Single responsibility:** Một class/hàm chỉ nên có một trách nhiệm rõ ràng.
2. **High cohesion, low coupling:** Đặt controller, service, DTO gần feature tương ứng; tránh phụ thuộc vòng và dùng code chung khi thực sự cần.
3. **Explicit over implicit:** DTO rõ ràng; return type rõ ràng; authorization rõ ràng; lỗi rõ ràng.
4. **Fail fast:** Validate config khi khởi động, validate dữ liệu tại boundary, không âm thầm nuốt lỗi.
5. **Secure by default:** Input untrusted, principle of least privilege, không rò rỉ dữ liệu.
6. **Backward compatibility:** API public phải giữ contract trong cùng major version hoặc có lộ trình deprecation.
7. **Testability:** Logic cần test nên có dependency inject được; tránh phụ thuộc trực tiếp response/raw request, global singleton hoặc external I/O không thể mock.
8. **Observability:** Một request/job quan trọng phải truy vết được từ ingress tới database, queue, external call.
9. **Simplicity:** Không bắt buộc DDD, Clean Architecture, CQRS, event sourcing, generic repository hoặc microservices khi chưa có nhu cầu rõ ràng.

---

## 2. Quy tắc đặt tên (Naming Conventions)

### 2.1. Bảng quy chuẩn

| Thành phần | Quy ước | Đúng | Không nên |
|---|---|---|---|
| Biến, tham số | `camelCase`, danh từ có nghĩa | `orderId`, `totalAmount` | `OrderId`, `a`, `data1` |
| Hàm/phương thức | `camelCase`, động từ + đối tượng | `calculateOrderTotal()` | `Calculation()`, `doStuff()` |
| Boolean | `is`/`has`/`can`/`should` | `isActive`, `hasPermission` | `activeFlag`, `check` |
| Class | `PascalCase`, danh từ/role | `OrdersService`, `CreateOrderDto` | `orders_service`, `OrderManagerThing` |
| Interface/type | `PascalCase`, **không tiền tố `I`** | `CreateOrderInput`, `OrderSummary` | `ICreateOrder`, `TOrder` |
| Enum | `PascalCase`; member `UPPER_SNAKE_CASE` | `OrderStatus.PENDING` | `orderStatus.pending` |
| Hằng số module-level | `UPPER_SNAKE_CASE` khi là cấu hình bất biến | `MAX_PAGE_SIZE` | `max_page_size` |
| File/thư mục | `kebab-case` | `create-order.dto.ts` | `CreateOrderDto.ts`, `createOrder.ts` |
| Nest module | tên feature + `Module` | `OrdersModule` | `OrderModuleManager` |
| Controller | danh từ resource số nhiều + `Controller` | `OrdersController` | `ManageOrdersController` |
| Service | tên feature + `Service` | `OrdersService` | `CommonService` |
| Repository (nếu có) | resource/entity + `Repository` | `OrdersRepository` | `DbHelper` |
| Guard | hành vi + `Guard` | `JwtAuthGuard`, `PermissionsGuard` | `AuthCheck` |
| Pipe/Filter/Interceptor | hậu tố NestJS chuẩn | `ParseOrderIdPipe`, `HttpExceptionFilter` | `FilterUtil` |
| DTO input | `Create/Update/Query` + noun + `Dto` | `CreateOrderDto` | `OrderDto` dùng cho mọi mục đích |
| DTO output | noun + `ResponseDto` | `OrderResponseDto` | `OrderEntity` trả ra HTTP |
| Event | sự kiện **đã xảy ra**, quá khứ | `OrderCreatedEvent` | `CreateOrderEvent` |
| Command/job | hành động được yêu cầu | `SendInvoiceJob`, `CancelOrderCommand` | `InvoiceThing` |
| Test | tên file gốc + `.spec.ts`/`.e2e-spec.ts` | `orders.service.spec.ts` | `test1.ts` |
| Env var | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `JWT_ISSUER` | `jwtSecret` |
| DB table/column | `snake_case` (nếu chọn SQL convention) | `order_items`, `created_at` | `OrderItemTable` |
| API path | lowercase, plural resource, `kebab-case` khi nhiều từ | `/purchase-orders` | `/GetPurchaseOrders`, `/order_list` |

> **Ngoại lệ:** Tên framework/library bắt buộc (`OnModuleInit`, `APP_GUARD`, `DTO`), tên khóa từ external contract hoặc database legacy có thể giữ nguyên, nhưng phải mapping tại boundary.

### 2.2. Đặt tên biến theo ý nghĩa

```ts
// ✅ Good
const customerId = order.customerId;
const pendingOrders = orders.filter((order) => order.status === OrderStatus.PENDING);
const isEligibleForDiscount = subtotalInCents >= MINIMUM_DISCOUNT_AMOUNT_CENTS;
const expiresAt = new Date(Date.now() + tokenTtlMs);

// ❌ Bad
const id = order.customerId;
const arr = orders.filter((x) => x.status === 'PENDING');
const flag = subtotalInCents > 1000;
const time = new Date();
```

- **MUST** phân biệt `orderId` với `customerId`; không đặt `id` chung chung ngoài phạm vi rất nhỏ/hiển nhiên.
- **MUST** thể hiện đơn vị cho giá trị dễ nhầm: `timeoutMs`, `durationSeconds`, `priceInCents`, `fileSizeBytes`.
- **MUST** dùng `At` cho thời điểm (`createdAt`, `expiresAt`), `Date` cho ngày lịch (`invoiceDate`) và `Ms`/`Seconds` cho khoảng thời gian.
- **MUST** dùng danh từ số nhiều cho collection: `orders`, `orderItems`, `customerIds`.
- **SHOULD** dùng `const` theo mặc định; `let` chỉ khi cần gán lại; **MUST NOT** dùng `var`.
- **MUST NOT** đặt tên `temp`, `obj`, `payload`, `result`, `data`, `info` khi có thể nêu cụ thể ý nghĩa nghiệp vụ. Các tên này **MAY** dùng ở adapter/serializer khi ngữ cảnh đủ hẹp.
- **MUST NOT** dùng tên gây hiểu nhầm kiểu dữ liệu, như `orders` cho một `Order` đơn lẻ.

### 2.3. Tên hàm theo hành vi và contract

| Ý nghĩa | Tên khuyến nghị | Contract |
|---|---|---|
| Tìm bản ghi có thể không tồn tại | `findById(id)` | `Promise<Order \| null>` |
| Lấy bắt buộc tồn tại | `getById(id)` | `Promise<Order>` hoặc throw typed not-found |
| Liệt kê theo tiêu chí | `listByCustomer(customerId)` | `Promise<Order[]>` |
| Tạo | `createOrder(input)` | thực hiện business action |
| Cập nhật | `updateOrder(id, input)` | thay đổi bản ghi |
| Chuyển trạng thái | `approveOrder(id)`, `cancelOrder(id)` | áp dụng transition/invariant |
| Kiểm tra boolean | `hasAccessToOrder(actor, order)` | trả `boolean` |
| Xác thực và báo lỗi | `assertCanCancelOrder(actor, order)` | trả `void` hoặc throw |
| Chuyển đổi dữ liệu | `mapOrderToResponse(order)` | hàm thuần, không I/O |
| Tính toán | `calculateOrderTotal(items)` | hàm thuần, có return type |
| Gọi external service | `fetchExchangeRate()` | tên cho thấy có I/O |

- **MUST** tránh `handle()`, `process()`, `execute()` cho service thông thường nếu có thể đặt cụ thể; **MAY** dùng `execute()` cho `CommandHandler`/`UseCase` theo pattern đã thống nhất.
- **MUST** tránh hàm có boolean parameter khó đọc: `updateOrder(order, true)`; dùng options object hoặc hàm rõ nghĩa.
- **SHOULD** ưu tiên hàm thuần cho tính toán nghiệp vụ; tách I/O khỏi calculation.
- **SHOULD** giới hạn số tham số trực tiếp khoảng 3; nếu phức tạp, dùng typed parameter object.
- **MUST** đặt tên bất đồng bộ theo hành vi, **không** bắt buộc hậu tố `Async` (vì return type đã thể hiện `Promise`).

### 2.4. Tên số ít/số nhiều, enum, hằng số

```ts
export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
}

export const MAX_PAGE_SIZE = 100;

export interface CreateOrderInput {
  customerId: string;
  items: Array<{ productId: string; quantity: number }>;
}
```

- **MUST** chọn một casing cho enum wire values (`UPPER_SNAKE_CASE` theo mặc định) và giữ ổn định trong API/database.
- **MUST** không tái sử dụng một enum nội bộ như public API khi hai contract có vòng đời thay đổi độc lập; mapping nếu cần.
- **SHOULD** dùng `as const` object hoặc string union thay enum khi giúp giảm coupling/runtime code; chọn nhất quán theo codebase.

---

## 3. TypeScript & Clean Code

### 3.1. Type safety

- **MUST** bật `strict: true`, `noImplicitOverride: true`, `noFallthroughCasesInSwitch: true`.
- **MUST NOT** dùng explicit `any` trong application code; dữ liệu chưa biết phải dùng `unknown` và narrow/validate.
- **MUST** khai báo return type cho exported functions, public service methods, controller handlers và public library APIs.
- **MUST** xử lý `Promise` (`await`, `return`, `void` có chủ đích và cơ chế ghi nhận lỗi); không floating promises.
- **MUST NOT** dùng non-null assertion (`!`) để che thiếu validation, trừ trường hợp đã chứng minh invariant tại vị trí đó.
- **SHOULD** dùng `readonly` cho dependency và cấu trúc immutable.
- **SHOULD** ưu tiên `type` cho union/composition, `interface` cho public object contract có nhu cầu extend; không áp đặt khi không mang lại lợi ích.
- **SHOULD** tránh `as Type` để bỏ qua type check; tại external boundary parse/validate runtime.
- **MUST** xử lý exhaustiveness khi switch domain states quan trọng.

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.DRAFT:
      return 'Draft';
    case OrderStatus.PENDING:
      return 'Pending';
    case OrderStatus.APPROVED:
      return 'Approved';
    case OrderStatus.CANCELLED:
      return 'Cancelled';
    default:
      return assertNever(status);
  }
}
```

### 3.2. Kích thước và tổ chức code

- **SHOULD** giữ hàm ở quy mô một nhiệm vụ, thường dưới khoảng 30–50 dòng; đây là tín hiệu review, **không** là giới hạn cứng.
- **SHOULD** giữ class trong phạm vi một capability; class > ~300 dòng phải xem xét tách trách nhiệm, không tự động tách chỉ vì số dòng.
- **SHOULD** dùng guard clauses/early returns để giảm nesting.
- **MUST** không đưa business rule vào generic helper `utils.ts` nếu thuộc domain cụ thể.
- **MUST** không tạo `base.service.ts`, `base.repository.ts`, `common-helper.ts` quá tổng quát khi abstraction chưa có ít nhất hai use case thực sự.
- **MUST** không comment diễn giải hiển nhiên; comment phải nói **vì sao**, đặc biệt với trade-off, business invariant, concurrency workaround.
- **MUST NOT** để `TODO`/`FIXME` không ticket hoặc owner trong code production trọng yếu.

---

## 4. Cấu trúc thư mục NestJS đơn giản

### 4.1. Mặc định: tổ chức theo feature của NestJS (không bắt buộc DDD)

```text
src/
├── main.ts
├── app.module.ts
├── config/                         # Cấu hình ứng dụng và validate env
├── common/                         # Guard, filter, decorator, pipe tái sử dụng thực sự
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   └── interceptors/
├── database/                       # PrismaService / TypeORM config / migrations tooling
└── modules/
    ├── auth/
    │   ├── dto/
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   └── auth.module.ts
    ├── orders/
    │   ├── dto/
    │   │   ├── create-order.dto.ts
    │   │   ├── update-order.dto.ts
    │   │   ├── list-orders-query.dto.ts
    │   │   └── order-response.dto.ts
    │   ├── orders.controller.ts
    │   ├── orders.service.ts
    │   ├── orders.repository.ts     # Tùy chọn, khi truy vấn/persistence phức tạp
    │   └── orders.module.ts
    └── products/
        ├── dto/
        ├── products.controller.ts
        ├── products.service.ts
        └── products.module.ts
test/
└── e2e/
```

- **SHOULD** gom `controller`, `service`, `dto` và `module` của cùng một feature vào một thư mục để dễ tìm và bảo trì.
- **MUST** đặt đúng trách nhiệm: controller xử lý HTTP; service xử lý nghiệp vụ, authorization liên quan resource và điều phối dữ liệu.
- **MUST NOT** truy vấn database trực tiếp từ controller.
- **MAY** gọi Prisma/TypeORM trực tiếp từ service cho CRUD đơn giản. **MAY** tách `repository`/data-access khi query lặp lại, phức tạp hoặc cần test độc lập.
- **MAY** tạo thêm `entities/`, `types/`, `interfaces/`, `mappers/`, `constants/`, `repositories/` khi feature thật sự cần; không tạo thư mục rỗng cho đủ mẫu.
- **MUST NOT** áp đặt `domain/`, `application/`, `infrastructure/`, ports/adapters, use-case class hay domain events cho mọi module.
- **SHOULD** tránh import trực tiếp những file triển khai nội bộ của feature khác; dùng public service được export từ Nest module khi cần chia sẻ.
- **SHOULD** tránh circular dependency và lạm dụng `forwardRef()`; xem lại cách tách trách nhiệm khi gặp vòng lặp.
- **SHOULD** chỉ đưa code vào `common/` khi nó thực sự generic và có người sử dụng; không dùng `common/` làm nơi chứa mọi business logic.
- **MAY** tách thêm layer/DDD/CQRS sau này nếu nghiệp vụ tăng độ phức tạp và có quyết định thiết kế cụ thể. Đây **không phải điều kiện** để code đạt chuẩn production.

### 4.2. Trách nhiệm của các thành phần NestJS

| Thành phần | Nên làm | Không nên làm |
|---|---|---|
| Controller | Route, params, DTO, HTTP status, response mapping | SQL/ORM calls, business branching phức tạp |
| Service | Business rules, resource authorization, transaction orchestration, phối hợp dữ liệu | Dùng `res.status()` hoặc trả raw response một cách không cần thiết |
| Repository (tùy chọn) | Gom query phức tạp, tối ưu truy cập dữ liệu, mapping storage | Quyết định HTTP status hoặc xử lý routing |
| Guard | Authentication/authorization trước handler | Chứa toàn bộ business transaction |
| Pipe | Parse, validate, transform input | Ghi database tùy tiện |
| Interceptor | Logging/tracing/metrics/response cross-cutting | Chứa nghiệp vụ riêng của feature |
| Exception filter | Chuẩn hóa lỗi, mã trạng thái và log | Lộ dữ liệu nội bộ hoặc nuốt lỗi |

---

## 5. Dependency Injection & NestJS modules

- **MUST** khai báo provider qua Nest DI, không tự `new SomeService()` nếu service có dependency được container quản lý.
- **MUST** dùng `private readonly`/`readonly` cho constructor-injected dependencies.
- **MUST** dùng DI token rõ ràng (`@Inject(TOKEN)`) nếu inject interface; với class provider thông thường có thể inject trực tiếp qua constructor.
- **SHOULD** chỉ export những providers cần được module khác dùng; không export tất cả theo thói quen.
- **SHOULD** tránh service locator `ModuleRef.get()` trong luồng thông thường.
- **SHOULD** tránh request-scoped provider trừ khi thực sự cần; đánh giá ảnh hưởng performance và propagation.
- **MUST** cấu hình adapter theo module; không dùng shared mutable state để truyền user/tenant context giữa requests.

```ts
@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorizationService: AuthorizationService,
  ) {}
}
```

> Ví dụ minh họa constructor injection trong service. `PrismaService` chỉ là ví dụ nếu dự án dùng Prisma; TypeORM hoặc ORM khác cũng hợp lệ. Không bắt buộc tạo `Repository` abstraction.

---

## 6. REST API Standards

### 6.1. URL, resource, version

- **MUST** dùng `/api/v{major}` cho public REST APIs (ví dụ `/api/v1/orders`). Nest `URI` versioning mặc định đặt version sau global prefix.
- **MUST** dùng danh từ resource số nhiều: `/orders`, `/order-items`, `/customers`.
- **MUST NOT** gắn động từ CRUD trong URL: `/getOrders`, `/createOrder`, `/deleteUser`.
- **MUST** dùng `kebab-case` khi path có nhiều từ, không `snake_case` hoặc PascalCase.
- **SHOULD** giới hạn nested resource 1–2 cấp: `/orders/{orderId}/items`; dùng top-level resource/filter cho quan hệ sâu.
- **MUST** giữ path IDs và query parameters có ý nghĩa, type/documentation rõ ràng.
- **MUST** API version major khi thay đổi contract breaking; không nhất thiết tạo v2 chỉ vì thêm optional response field.
- **MUST** ghi lộ trình deprecation trước khi xóa/đổi semantics của API đang sử dụng.
- **SHOULD** public APIs hỗ trợ OpenAPI machine-readable và có owner/service name.

```http
GET    /api/v1/orders
GET    /api/v1/orders/{orderId}
POST   /api/v1/orders
PUT    /api/v1/orders/{orderId}
PATCH  /api/v1/orders/{orderId}
DELETE /api/v1/orders/{orderId}
POST   /api/v1/orders/{orderId}/cancellations
```

> Với business action, ưu tiên mô hình **resource của hành động** như `cancellations` khi có lịch sử/trạng thái riêng; `POST /orders/{id}/cancel` **MAY** chấp nhận nếu được tài liệu hóa và nhất quán. Không cố gò mọi workflow phức tạp vào CRUD.

### 6.2. HTTP method semantics

| Method | Mục đích | Idempotent theo HTTP semantics? | Response thông dụng |
|---|---|---|---|
| GET | Đọc, không gây thay đổi nghiệp vụ | Có | `200` |
| POST | Tạo resource/khởi chạy action | Không mặc định | `201`/`200`/`202` |
| PUT | Thay thế toàn bộ representation theo contract | Có | `200`/`204` |
| PATCH | Cập nhật một phần | Không đảm bảo; tùy patch semantics | `200`/`204` |
| DELETE | Xóa resource theo contract | Có | `204` |

- **MUST NOT** thay đổi state trong GET (kể cả đánh dấu đã đọc nếu đó là một business mutation có ý nghĩa).
- **MUST** trả `201 Created` khi tạo resource đồng bộ; **SHOULD** thêm `Location` trỏ resource mới khi phù hợp.
- **MUST** trả body rỗng với `204 No Content`.
- **MUST** trả `202 Accepted` khi đã nhận nhưng chưa hoàn thành tác vụ; nên cung cấp `operationId`/status endpoint.
- **MUST** không mô tả PUT là partial update; nếu dùng PUT, contract thay thế phải được định nghĩa rõ.
- **MUST** phân biệt idempotency của HTTP method với exactly-once execution; không được hứa exactly-once chỉ nhờ `Idempotency-Key`.

### 6.3. HTTP status codes

| Status | Sử dụng |
|---|---|
| `200 OK` | Đọc/cập nhật thành công có body |
| `201 Created` | Resource đã tạo |
| `202 Accepted` | Job đã nhận, xử lý async |
| `204 No Content` | Thành công không body |
| `400 Bad Request` | DTO/query/path không hợp lệ hoặc cú pháp input sai |
| `401 Unauthorized` | Chưa được xác thực/token không hợp lệ |
| `403 Forbidden` | Đã xác thực nhưng không đủ quyền |
| `404 Not Found` | Resource không tồn tại hoặc chủ động che tồn tại theo policy |
| `409 Conflict` | Trạng thái xung đột, unique violation, stale write/business conflict |
| `412 Precondition Failed` | `If-Match`/ETag precondition không khớp |
| `413 Content Too Large` | Request vượt size limit |
| `415 Unsupported Media Type` | Content type không hỗ trợ |
| `422 Unprocessable Content` | **MAY** dùng cho validation semantic theo contract thống nhất; mặc định DTO errors dùng `400` |
| `429 Too Many Requests` | Rate-limit exceeded; kèm `Retry-After` khi phù hợp |
| `500 Internal Server Error` | Lỗi server không dự kiến; không tiết lộ internals |
| `502/503/504` | Dependency/gateway/service unavailable/timeout tùy vị trí và semantics |

- **MUST NOT** trả `200` cho lỗi và nhét `success:false` bên trong body.
- **MUST NOT** trả `500` cho những lỗi nghiệp vụ có thể dự kiến.
- **MUST** xác định status theo contract, không theo thói quen.

### 6.4. Request fields, pagination, sort, filters

- **MUST** dùng JSON field names `camelCase`: `customerId`, `createdAt`.
- **MUST** cung cấp giới hạn page size, sorting whitelist, filtering whitelist; không nối SQL từ user input.
- **Default offset pagination:** `page` bắt đầu từ `1`, `limit` mặc định `20`, max `100` (điều chỉnh theo endpoint và đo đạc).
- **Default sort:** `sort=-createdAt` cho DESC, `sort=createdAt` cho ASC. Các giá trị phải được parse/allowlist.
- **SHOULD** dùng cursor pagination cho bảng lớn, high-write stream hoặc infinite scroll; cursor opaque, sort ổn định, tie-breaker bằng ID.
- **MUST** có stable ordering nếu phân trang.
- **MUST** tránh `select=*` hoặc expose field tùy ý nếu chưa có field-level authorization.

```http
GET /api/v1/orders?page=1&limit=20&status=PENDING&sort=-createdAt
```

```json
{
  "data": [
    {
      "id": "f9403c37-6ef3-4114-89b0-5a5bda0ed1a1",
      "status": "PENDING",
      "createdAt": "2026-10-29T08:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 154,
    "totalPages": 8
  }
}
```

- **Default response contract:** Resource đơn lẻ trả **object DTO trực tiếp**, list paginated trả `{ data, meta }`. Không bọc `{ success, message, data }` cho mọi response nếu không có yêu cầu từ API platform.
- **MUST** phân biệt metadata pagination với business data; `totalItems` **MAY** bỏ khi cursor/count quá đắt, nhưng phải document rõ.
- **MUST** dùng ISO 8601 UTC cho timestamp dạng `...Z`; ngày lịch dùng `YYYY-MM-DD`.
- **MUST** có quy ước decimal/monetary rõ (xem §12).

### 6.5. API error contract — Problem Details

Tổ chức **MUST** chuẩn hóa error response. Mặc định sử dụng cấu trúc tương thích RFC 9457, content type `application/problem+json`. Đây **không phải** response mặc định của NestJS: phải tự triển khai exception filter/mapping và test.

```json
{
  "type": "https://api.example.com/problems/order-not-cancellable",
  "title": "Order cannot be cancelled",
  "status": 409,
  "detail": "Only pending orders can be cancelled.",
  "instance": "/api/v1/orders/f9403c37-6ef3-4114-89b0-5a5bda0ed1a1/cancellations",
  "code": "ORDER_NOT_CANCELLABLE",
  "requestId": "req_8c1f6b",
  "errors": []
}
```

- **MUST** giữ `type`, `title`, `status`, `detail`, `instance` đúng ý nghĩa RFC 9457 khi được sử dụng; `code`, `requestId`, `errors` là extensions của tổ chức.
- **MUST** dùng `code` ổn định, `UPPER_SNAKE_CASE`, ví dụ `ORDER_NOT_FOUND`, `ORDER_NOT_CANCELLABLE`.
- **MUST** không trả stack trace, SQL, secrets, nội dung exception từ driver ra client.
- **MUST** map validation failures thành field errors có cấu trúc; ví dụ `errors: [{ "field": "items[0].quantity", "code": "MIN", "message": "quantity must be at least 1" }]`.
- **MUST** trả `Content-Type: application/problem+json` khi theo contract này.
- **SHOULD** tài liệu hóa error codes theo domain; không sử dụng message text để client phân nhánh xử lý.

### 6.6. OpenAPI contract

- **MUST** có `@ApiTags`, `@ApiOperation` (cho endpoint public), response status/schema và auth requirement cho API mới.
- **MUST** dùng các DTO riêng biệt cho create/update/query/response, không dùng DB entity làm schema public.
- **MUST** mô tả ví dụ, enum, constraint, nullable, pagination, expected errors ở nơi có ích.
- **MUST** kiểm thử/generate OpenAPI trong CI, phát hiện breaking changes theo policy.
- **SHOULD** generate typed API client từ OpenAPI cho frontend/integrations khi hệ thống đủ lớn.
- **MUST** bảo vệ Swagger UI trong production hoặc không expose publicly; OpenAPI artifact vẫn có thể xuất offline/qua CI.

---

## 7. DTO, Validation, Serialization

### 7.1. Input DTO rules

- **MUST** validate tất cả input tại transport boundary: body, query, params, headers liên quan và webhook payload.
- **MUST** dùng class-based DTO với decorator khi dùng global `ValidationPipe` mặc định; TypeScript `interface` không cung cấp runtime metadata.
- **MUST** kết hợp `whitelist: true` + `forbidNonWhitelisted: true` để từ chối mass assignment/field dư.
- **MUST** bật `transform: true`, nhưng tránh implicit type conversion không kiểm soát; validate số, boolean, enum, UUID rõ ràng.
- **MUST** dùng `@IsOptional()` khi field có thể vắng; phân biệt `undefined`, `null` và empty string theo contract.
- **MUST** có `@ValidateNested()` và `@Type(() => ChildDto)` khi validate object/array nested bằng class-validator/class-transformer.
- **MUST** validate list length, string length, numeric ranges, URL/file size và định dạng ID.
- **MUST** không tin client truyền `userId`, `tenantId`, `role`, `price`/`total` nếu các field đó phải do server xác định hoặc xác minh.
- **MUST** thực hiện database/business validation bổ sung sau syntactic validation; DTO không thay business rules.

```ts
// main.ts — đoạn cấu hình minh họa
app.setGlobalPrefix('api');
app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: false },
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    validationError: { target: false, value: false },
  }),
);
```

```ts
// modules/orders/api/dto/create-order.dto.ts
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID('4')
  productId!: string;

  @IsInt()
  @Min(1)
  @Max(10_000)
  quantity!: number;
}

export class CreateOrderDto {
  @IsUUID('4')
  customerId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
```

> `customerId` ở ví dụ có thể hợp lệ với admin flow. Trong user flow, **MUST** lấy identity/tenant context từ authenticated principal rồi kiểm tra quyền; không tin `customerId` client gửi một cách mặc định.

### 7.2. Response DTO and serialization

- **MUST** không trả trực tiếp ORM model, đặc biệt entity có `passwordHash`, `secret`, `internalNotes`, `costPrice`, v.v.
- **MUST** map chỉ những field thuộc API contract, áp dụng field-level permissions khi cần.
- **SHOULD** dùng response DTO mapper rõ ràng thay vì phụ thuộc hoàn toàn vào `ClassSerializerInterceptor` để giấu field nhạy cảm.
- **MUST** kiểm tra runtime response theo schema/contract ở những integration có rủi ro cao.
- **MUST** không expose enum/private implementation detail nếu chưa là public contract.
- **MUST** tránh circular JSON serialization.

---

## 8. Controller & Service coding pattern

```ts
// modules/orders/orders.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@ApiTags('orders')
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':orderId')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiOkResponse({ type: OrderResponseDto })
  async getById(
    @Param('orderId', new ParseUUIDPipe({ version: '4' })) orderId: string,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersService.getById(orderId);
    return OrderResponseDto.fromOrder(order);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an order' })
  @ApiCreatedResponse({ type: OrderResponseDto })
  async create(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    const order = await this.ordersService.createOrder(dto);
    return OrderResponseDto.fromOrder(order);
  }
}
```

**Lưu ý về ví dụ:** `OrdersService` phải thực hiện authorization/tenant checks theo principal đã xác thực; controller trên cố tình lược bỏ auth guard/decorator để tập trung vào naming và phân lớp. Endpoint **không được** đưa ra production theo đúng đoạn minh họa nếu chưa bổ sung authentication/authorization, exception mapping, response DTO và OpenAPI errors.

- **MUST** controller mỏng, không chứa query ORM hoặc business branching phức tạp.
- **SHOULD** service trả dữ liệu có kiểu rõ ràng, không thao tác trực tiếp raw HTTP `Response`; có thể throw Nest exceptions trong ứng dụng REST đơn giản.
- **SHOULD** dùng mã lỗi nhất quán; với logic được tái sử dụng bởi HTTP, queues hoặc jobs, có thể dùng typed business errors và map sang HTTP tại filter.
- **SHOULD** dùng Nest module `imports`/`exports` khi chia sẻ service giữa features; không import file private bằng đường dẫn xuyên module.
- **MUST** kiểm tra quyền trên từng resource trong service hoặc lớp dữ liệu thích hợp, không chỉ dựa vào guard ở route.

---

## 9. Error handling, exceptions & retries

- **MUST** phân loại: validation errors, authentication/authorization errors, business conflicts, dependency failures, unexpected errors.
- **MUST** log lỗi unexpected với exception cause và requestId/tracing context; không tiết lộ chi tiết nhạy cảm cho user.
- **MUST** không `catch` rồi `return null`/`false` nếu làm mất nguyên nhân lỗi, trừ trường hợp contract được định nghĩa rõ.
- **MUST** không catch-all `throw new InternalServerErrorException(error.message)` vì rò rỉ message nội bộ.
- **MUST** có global exception filter/adapter bảo đảm error contract §6.5.
- **MUST** map DB unique constraint sang conflict code phù hợp; không match error theo substring message nếu driver có error code ổn định.
- **MUST** xác định timeout, retry, backoff và jitter khi gọi external dependency; chỉ retry thao tác retry-safe/idempotent.
- **MUST** tránh retry vô hạn; đặt attempt cap và DLQ/alert cho queue consumer.
- **SHOULD** dùng exception `cause` để giữ original stack trong internal logs.
- **MUST** không swallow lỗi trong background jobs; job fail/ack semantics phải theo queue contract.

**Bảng chọn nơi throw:** DTO/Pipe → `400`; Guard/Auth → `401`/`403`; Service → Nest HTTP exception hoặc typed business error; ORM/Repository → map driver error an toàn; Global filter → HTTP Problem Details.

---

## 10. Security baseline — bắt buộc trước production

### 10.1. Identity & authorization

- **MUST** áp dụng authentication cho private endpoints và ghi rõ public endpoints.
- **MUST** verify token signature, expiry, issuer, audience và thuật toán cho token scheme đã chọn; không tin JWT decoded chưa verified.
- **MUST** kiểm tra authorization ở **function level**, **resource/object level** và **field level** khi cần; role guard đơn thuần không bảo vệ IDOR/BOLA.
- **MUST** derive `actorId`, `tenantId`, roles/scopes từ trusted auth context, không chỉ từ client header/body/query.
- **MUST** enforce tenant isolation trong **mọi** query/update/delete liên quan dữ liệu tenant (gồm cache, search, files, events); có tests cross-tenant.
- **MUST** lưu mật khẩu bằng password-hashing algorithm phù hợp (ví dụ Argon2id/bcrypt với cấu hình được đánh giá), không hash bằng SHA-256 thuần.
- **MUST** rotate/revoke credentials theo threat model; dùng short-lived credentials khi có thể.
- **MUST** bảo vệ login/password reset bằng abuse prevention và rate limits thích hợp.

### 10.2. Input, output & infrastructure

- **MUST** dùng parameterized queries/ORM bindings; **MUST NOT** interpolate user input vào raw SQL.
- **MUST** chống SSRF ở chức năng fetch URL: allowlist target, reject private/link-local/metadata IP ranges khi không hợp lệ, kiểm soát redirects và DNS rebinding theo threat model.
- **MUST** giới hạn request payload/file upload sizes, content types, parsers, query complexity và request duration.
- **MUST** cấu hình CORS bằng origin allowlist; không dùng wildcard với credentials.
- **MUST** dùng HTTPS/TLS khi truyền dữ liệu nhạy cảm, bật security headers phù hợp với adapter.
- **MUST** xử lý CSRF nếu auth dựa cookie và trình duyệt tự gửi credential.
- **MUST** đặt secrets trong secret manager/env injection; **MUST NOT** commit `.env`, private keys, access tokens.
- **MUST** redaction `authorization`, `cookie`, passwords, tokens, payment/personal data trong logs/traces.
- **MUST** kiểm tra dependency vulnerabilities, license/compliance và update khi có advisory liên quan.
- **MUST** chạy process/container bằng non-root khi khả thi; chỉ mở port và quyền filesystem tối thiểu.
- **MUST** bảo vệ admin/internal endpoints, health details, Swagger UI và metrics theo exposure policy.
- **SHOULD** dùng distributed rate limiter ở gateway/shared store khi deploy multi-replica; in-memory throttling chỉ có hiệu lực trong từng instance.

**Security acceptance:** PR thêm resource ID-based API phải có ít nhất một test chứng minh user A **không thể** đọc/sửa/xóa resource thuộc user B hoặc tenant khác.

---

## 11. Database, Data Access & Transactions

### 11.1. Schema & naming

- **MUST** dùng migrations có version; **MUST NOT** dựa vào ORM auto-sync trong production.
- **MUST** dùng unique/foreign-key/check constraints thích hợp để enforce invariants tại DB, không chỉ check ở service.
- **MUST** thiết kế indexes dựa truy vấn thực tế (`WHERE`, `JOIN`, `ORDER BY`), đo query plan.
- **MUST** quản lý timestamps nhất quán (`created_at`, `updated_at`) và UTC.
- **MUST** phân biệt hard delete vs soft delete; soft delete phải được áp dụng nhất quán vào unique indexes, query và retention.
- **MUST** xử lý concurrent writes (`version`/optimistic lock, row lock hoặc transaction isolation thích hợp).
- **SHOULD** dùng UUID/ULID hoặc loại ID được chuẩn hóa tại platform; tuyệt đối không nhầm opaque ID với authorization.
- **MUST** backup và có quy trình thử restore; database migrations có kế hoạch rollback/forward-fix.

### 11.2. Data access rules

- **MUST** không query DB trực tiếp trong controller. Với CRUD đơn giản, service **MAY** truy cập ORM trực tiếp; repository/data-access riêng chỉ **SHOULD** có khi giúp quản lý truy vấn, tái sử dụng hoặc kiểm thử.
- **MUST** chỉ select cần thiết, tránh N+1 queries, unbounded scans và `findMany()` không limit trên bảng lớn.
- **MUST** filter theo tenant và permission khi đọc/sửa/xóa nếu dữ liệu thuộc phạm vi riêng tư; ưu tiên enforce ở query.
- **SHOULD** đặt tên truy vấn theo tác vụ khi tách repository: `findById`, `findByIdForTenant`, `listByCustomer`; tránh generic `findAll(filters: any)` không kiểm soát.
- **SHOULD** tách storage model khỏi public DTO.
- **MUST** không gọi external HTTP hoặc queue publish non-transactional ở giữa DB transaction dài.

### 11.3. Transaction & events

- **MUST** gom các thay đổi cần atomicity vào một DB transaction.
- **MUST** xử lý race conditions (ví dụ decrement inventory, balance transfer, unique reservation) với consistency strategy phù hợp.
- **MUST** xác định rõ behavior khi một bước sau DB commit thất bại.
- **SHOULD** dùng **transactional outbox** nếu một business mutation cần phát sự kiện đáng tin cậy sau commit; không giả định DB commit + publish message là atomic.
- **MUST** thiết kế consumers idempotent và chịu được event delivery ít nhất một lần khi broker có tính chất đó.
- **MUST** không dựa vào thứ tự event khi broker/partition không đảm bảo; có version/order key nếu yêu cầu.
- **SHOULD** có retention/cleanup cho outbox/inbox và quan sát backlog.

---

## 12. Money, Dates, IDs & Serialization

- **MUST NOT** dùng IEEE-754 `number` để tính toán tiền với fractional precision tùy ý; dùng integer minor units (nếu currency có minor units cố định phù hợp) hoặc Decimal từ library/DB tương thích.
- **MUST** xác định currency và scale, ví dụ `amountMinor`, `currency: 'VND'` hoặc decimal string theo API contract; không mặc định mọi currency có 2 decimal places.
- **MUST** quy định cách rounding/tax allocation tại business logic và test boundary cases.
- **MUST** lưu timestamp dưới UTC; chuyển timezone địa phương ở UI hoặc nơi hiển thị được chỉ định.
- **MUST** phân biệt instant và calendar date; business cutoffs phải áp dụng timezone theo nghiệp vụ.
- **MUST** chuyển `bigint`/Decimal thành string hoặc representation được chuẩn hóa trước khi JSON serialization; không serialize raw `bigint`.
- **MUST** validate UUID/ULID theo chính loại ID đã chọn; không ép mọi loại ID thành `ParseIntPipe`.
- **SHOULD** dùng opaque cursor/identifiers cho API public và không lộ thông tin nội bộ không cần thiết.

---

## 13. Configuration & Environment

- **MUST** có `.env.example` **không chứa secrets**, mô tả env bắt buộc và giá trị ví dụ an toàn.
- **MUST** validate environment **khi bootstrap** bằng Joi/Zod/class-validator hoặc schema tương đương. Không để lỗi env bộc lộ giữa request production.
- **MUST** truy cập config qua typed `ConfigService`/configuration provider; không gọi `process.env.*` rải rác trong business modules.
- **MUST** phân biệt build-time và runtime configuration.
- **MUST** không log nguyên config object hoặc secrets.
- **MUST** giữ dev/staging/prod khác nhau ở cấu hình, không viết `if (isProd)` rải rác cho business behavior.
- **SHOULD** cấu hình các tham số có ảnh hưởng availability: connection pool, external timeout, retry, worker concurrency, shutdown grace period.
- **SHOULD** có feature flags cho rollout lớn, nhưng không để flag tồn tại vô hạn không owner.

```dotenv
# .env.example (ví dụ, không dùng giá trị này trong production)
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/app
JWT_ISSUER=http://localhost:3000
JWT_AUDIENCE=app-api
LOG_LEVEL=info
```

---

## 14. Logging, Monitoring & Observability

- **MUST** dùng structured logs (JSON trong production) qua Nest Logger abstraction hoặc logger tích hợp (ví dụ Pino).
- **MUST** log có context tối thiểu: `timestamp`, `level`, `service`, `environment`, `requestId`/`traceId`, `event`/`message`.
- **SHOULD** thêm `actorId`/`tenantId` dạng an toàn khi cần audit/debug, tuyệt đối không log access tokens.
- **MUST** propagate correlation/trace context qua HTTP, queue và jobs; không tin request ID từ bên ngoài nếu không validate/normalize.
- **MUST** redaction hoặc loại bỏ payload có dữ liệu nhạy cảm.
- **MUST** có metrics tối thiểu: request rate, errors (4xx/5xx), latency, dependency latency/failure, queue depth, DB pool saturation.
- **SHOULD** có distributed tracing bằng OpenTelemetry hoặc công cụ tương thích.
- **MUST** có liveness/readiness probes tách biệt về semantics; readiness chỉ báo có thể nhận traffic, không leak chi tiết credentials.
- **MUST** xử lý graceful shutdown và release resources đang mở; worker phải có stop/drain policy.
- **MUST** cấu hình alerts theo SLO/SLI thực tế, không chỉ monitor CPU.
- **MUST** ghi audit trail cho các hành vi nhạy cảm (phê duyệt, xóa, thay đổi role, giao dịch); audit log bất biến ở mức phù hợp với threat model.

```json
{
  "level": "info",
  "service": "orders-api",
  "requestId": "req_8c1f6b",
  "event": "order.created",
  "orderId": "f9403c37-6ef3-4114-89b0-5a5bda0ed1a1",
  "durationMs": 45
}
```

---

## 15. External APIs, Messaging, Jobs & Idempotency

### 15.1. HTTP integrations

- **MUST** encapsulate external service calls trong client/adapter (`PaymentGatewayClient`, `ErpClient`), không gọi HTTP trực tiếp trong controller.
- **MUST** có timeouts (connect/read/request tùy client), retry policy, error mapping, rate-limit strategy.
- **MUST** validate responses từ bên thứ ba như dữ liệu untrusted; không assume shape chỉ vì có TypeScript type.
- **MUST** kiểm soát outbound secrets, URL và logging.
- **SHOULD** dùng circuit breaker/bulkhead cho critical dependencies khi thực tế cần.
- **MUST** không dùng retry tự động cho giao dịch ghi không idempotent nếu provider không có idempotency guarantee.

### 15.2. Webhooks

- **MUST** verify signature, timestamp/replay window, body bytes nguyên gốc theo protocol của provider.
- **MUST** xử lý duplicate/out-of-order delivery và acknowledge theo contract của provider.
- **MUST** không giả định event nhận = event duy nhất; lưu provider event ID hoặc inbox dedup.
- **MUST** phân biệt `delivery succeeded` và `business processing completed`; xử lý background nếu provider timeout ngắn.

### 15.3. Idempotency keys

- **SHOULD** hỗ trợ `Idempotency-Key` cho POST tạo giao dịch, thanh toán, phát hành chứng từ hoặc những operation khó retry an toàn.
- **MUST** scope idempotency key theo actor/tenant và operation; không dùng key global thiếu context.
- **MUST** kiểm tra payload fingerprint; cùng key nhưng payload khác phải trả conflict theo contract.
- **MUST** lưu result/status atomically và quản lý in-progress concurrency, TTL, retention.
- **MUST** không nhận định idempotency là exactly-once; external side effects vẫn cần phối hợp guarantee với upstream/downstream.

### 15.4. Background jobs

- **MUST** cấu hình bounded concurrency, max attempts, exponential backoff + jitter, job timeout, DLQ/manual recovery phù hợp.
- **MUST** job payload nhỏ, versioned; không chứa password/token/PII nếu không cần.
- **MUST** job handler idempotent khi có thể và có alert khi thất bại dai dẳng.
- **MUST** có owner và business identifier trong logs/metrics.

---

## 16. Caching & Performance

- **MUST** xác định cache key namespace và tenant/user scope; không để dữ liệu tenant A rơi vào cache của tenant B.
- **MUST** có TTL hoặc invalidation strategy được document; không cache dữ liệu nhạy cảm mà thiếu kiểm soát.
- **MUST** benchmark/measure trước khi tối ưu; ưu tiên DB indexes, query shape, payload size, batching trước caching phức tạp.
- **MUST** tránh synchronous CPU-heavy operations trên Node.js request thread; offload sang worker/job khi cần.
- **MUST** giới hạn payload, page size, upload size, query/time budgets.
- **SHOULD** dùng ETag/conditional requests ở resource phù hợp, có concurrency/version checks cho update khi cần.
- **SHOULD** thiết lập performance budget/SLO cho latency p95/p99.

---

## 17. Testing standards

### 17.1. Phân tầng test

| Loại | Phạm vi | Yêu cầu |
|---|---|---|
| Unit | Hàm tính toán và services được mock dependency | **MUST** cho business logic quan trọng |
| Integration | Repository + DB thực/testcontainer, external adapter | **MUST** cho query/transaction/migration quan trọng |
| E2E | HTTP app bootstrapped, guards/pipes/filters/serialization | **MUST** cho public/critical API workflows |
| Contract | OpenAPI schema, consumer/provider integration | **SHOULD** khi có multiple clients/services |
| Security | Unauthorized, IDOR/BOLA, mass assignment, tenant isolation | **MUST** cho private resources |
| Load/resilience | Hot paths, dependency failures, concurrency | **MUST** trước release cho hệ thống có SLO/giao dịch quan trọng |

### 17.2. Rules

- **MUST** viết test theo **Given–When–Then** (tên hoặc cấu trúc), không test implementation detail vô ích.
- **MUST** test happy path + boundary + invalid input + failure + unauthorized/forbidden cho endpoint quan trọng.
- **MUST** test authorization bằng ít nhất hai actors/tenants trong use case có ownership.
- **MUST** test concurrent update/transaction cho workflow có inventory, payments, balances, reservations.
- **MUST** tests độc lập, deterministic; mock time/random/HTTP theo nhu cầu.
- **MUST** không dùng production DB/secret trong test.
- **MUST** chạy migrations trong integration environment; không chỉ mock ORM/repository khi muốn test persistence behavior.
- **SHOULD** đặt unit tests gần source (`*.spec.ts`) và e2e tại `test/e2e/`.
- **SHOULD** đặt coverage gate cho **new/changed critical code** (ví dụ từ 80% branches trở lên tùy team), nhưng không dùng coverage % thay thế chất lượng test.
- **MUST** đảm bảo build, lint, typecheck, tests qua CI trước merge.

```ts
describe('OrdersService.cancelOrder', () => {
  it('rejects cancellation when the order is already approved', async () => {
    // Given: approved order owned by the actor
    // When: cancelOrder is called
    // Then: ORDER_NOT_CANCELLABLE is raised and no write happens
  });
});
```

---

## 18. ESLint, Prettier, TypeScript tooling

### 18.1. Source formatting

**Default Prettier:** 2-space indentation, single quotes, semicolons, trailing commas `all`, print width `100`, LF line endings. Dùng Prettier thay tranh cãi style trong PR.

```json
// .prettierrc — bỏ dòng chú thích này khi tạo JSON thực
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

- **MUST** dùng ESLint flat config (`eslint.config.mjs` hoặc dạng tương thích version đang dùng), typescript-eslint, Prettier.
- **SHOULD** bắt đầu từ `recommendedTypeChecked` và `stylisticTypeChecked` của typescript-eslint; cân nhắc `strictTypeChecked` khi team chấp nhận chi phí migrate.
- **MUST** bật `parserOptions.projectService: true` hoặc cấu hình typed-linting tương đương được tài liệu hóa.
- **MUST** kiểm tra các rule về unused imports/vars, unsafe operations, unhandled promises, `no-explicit-any`, non-null assertions và consistent type imports theo policy.
- **MUST** để auto-format và auto-fix lint trước PR; không tắt rule diện rộng chỉ để qua CI.
- **MUST** khi disable rule tại dòng cụ thể phải có lý do ngay cạnh directive.
- **MUST** kiểm tra compatibility với NestJS decorators và TypeScript compiler options; không copy lint config mà chưa chạy thử.

### 18.2. TypeScript config tham khảo

```json
// tsconfig.json — các compilerOptions cốt lõi (đoạn minh họa)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "useUnknownInCatchVariables": true,
    "skipLibCheck": true
  }
}
```

**Ghi chú:** Với một số NestJS decorators/DI patterns, việc bật `strictPropertyInitialization` giữ nguyên từ `strict` có thể cần definite assignment `!` trên các property DTO được populated qua reflection. Ngoại lệ này chỉ dành cho DTO được runtime validate/transform; không nới lỏng toàn bộ mã nguồn. Ví dụ §7 dùng `!` ở DTO vì đặc thù decorator metadata.

### 18.3. Package scripts chuẩn

Các script này là **contract CI** (không phải drop-in code nếu package manager/tooling khác nhau):

```json
{
  "scripts": {
    "format": "prettier --write \"{src,test}/**/*.{ts,js,json}\"",
    "format:check": "prettier --check \"{src,test}/**/*.{ts,js,json}\"",
    "lint": "eslint \"{src,test}/**/*.ts\" --max-warnings 0",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "build": "nest build",
    "test": "jest",
    "test:ci": "jest --ci --runInBand --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

- **MUST** đồng bộ script path với cấu trúc thực tế (`test/`, `tests/`, `apps/`, `packages/`, v.v.).
- **MUST** chỉ dùng **một** package manager và commit lockfile tương ứng.
- **SHOULD** dùng Git hooks (Husky/lefthook + lint-staged) để chạy lint/format nhanh, nhưng CI là source of truth.

---

## 19. Git, Branches, Commits & Pull Requests

- **MUST** dùng Conventional Commits: `feat(orders): add order cancellation`, `fix(auth): reject expired tokens`.
- **SHOULD** branch naming: `feat/order-cancellation`, `fix/cross-tenant-access`, `chore/upgrade-nest`.
- **MUST** PR có mô tả mục đích, phạm vi, test evidence, breaking changes và migration/rollout plan nếu cần.
- **MUST** review ít nhất một người khác cho production code; critical security/payment/schema changes cần reviewer có domain ownership.
- **MUST** không merge khi CI failed, có secrets, debug logs, unsafe migration hoặc unresolved critical comments.
- **MUST** dùng migrations backward-compatible trong rolling deployment: expand → deploy compatible code → backfill → contract.
- **MUST** không chứa binary/build outputs/secrets trong Git trừ tài sản có lý do rõ ràng.
- **SHOULD** squash hoặc giữ history theo team policy, nhưng commit messages phải có giá trị truy vết.
- **SHOULD** dùng CODEOWNERS/ADR cho quyết định lớn và những feature nhạy cảm.

---

## 20. CI/CD & Release Gates

**Required pipeline gates (theo thứ tự logic; có thể chạy song song):**

1. Install dependencies theo lockfile (`npm ci`/`pnpm install --frozen-lockfile`/...);
2. `format:check`;
3. `lint`;
4. `typecheck`;
5. Unit tests;
6. Integration tests với services/database phù hợp;
7. E2E/API contract tests;
8. Dependency + secret scanning;
9. Build artifacts và kiểm tra container image;
10. Migration compatibility + deploy staging + smoke tests (trước production);
11. Production release qua approved deployment strategy, health checks và rollback/forward-fix plan.

**MUST**:

- CI fail khi bước bắt buộc fail; không `|| true` để lách quality gates.
- Deploy artifact immutable/pinned version; không `latest` mơ hồ ở production.
- Inject secrets tại runtime qua cơ chế an toàn, không bake vào image.
- Đánh giá DB migration tương thích với code cũ/mới trong rolling update.
- Có liveness/readiness, graceful shutdown và timeout budgets phù hợp orchestration.
- Ghi release version/commit SHA trong logs/metrics.
- Có khả năng rollback ứng dụng; các DB migrations không thuận nghịch phải có forward-fix plan.

**SHOULD**:

- Dùng canary/blue-green khi rủi ro cao;
- Kiểm tra image bằng SBOM/scanner;
- Có performance regression check cho endpoints critical;
- Có OpenAPI breaking-change detection.

---

## 21. Khi dự án có nhiều feature hoặc tích hợp

Một dự án NestJS có thể có `orders`, `inventory`, `billing`, `auth`, `integrations` hoặc `agents`. Không cần áp dụng Domain-First/DDD để triển khai các feature này.

- **SHOULD** xác định service nào chịu trách nhiệm xử lý một nghiệp vụ, tránh logic trùng lặp ở nhiều controllers/jobs.
- **MUST** kiểm tra authentication, authorization và tenant isolation ở nơi thực thi thao tác, kể cả request từ queue, cron hoặc AI agent.
- **MUST NOT** cho integrations/agents truy cập database để bỏ qua kiểm tra quyền và nghiệp vụ của service hiện có.
- **SHOULD** dùng các Nest providers được export/import khi nhiều feature cần gọi nhau; cân nhắc event/queue nếu thật sự cần xử lý bất đồng bộ.
- **MAY** áp dụng kiến trúc nhiều lớp, DDD, CQRS hay microservices khi đã có nhu cầu rõ, không xem đó là tiêu chí bắt buộc của coding standards này.

---

## 22. Anti-patterns — không chấp nhận trong PR

```ts
// ❌ Controller truy vấn DB và chứa business logic
@Post('createOrder')
async create(@Body() body: any) {
  const order = await this.prisma.order.create({ data: body });
  return { success: true, data: order };
}

// ❌ Che lỗi
try {
  await this.paymentGateway.charge(input);
} catch {
  return true;
}

// ❌ Trust client tenantId cho authorization
return this.prisma.order.findMany({ where: { tenantId: query.tenantId } });

// ❌ Không có timeout và không await
this.httpClient.post(externalUrl, payload);

// ❌ Gửi toàn bộ ORM entity ra API
return this.userRepository.findById(userId); // Có thể chứa passwordHash, secrets
```

Các mẫu trên là **ví dụ phản diện**, không phải code được khuyến khích chạy. Đặc biệt, `@Body() body: any` và ORM `create({ data: body })` tạo nguy cơ mass assignment.

---

## 23. Definition of Done — PR Checklist

### API & naming

- [ ] Tên file/class/hàm/biến theo §2, không abbreviation mơ hồ.
- [ ] Endpoint dùng REST semantics, URL versioning, status đúng, OpenAPI cập nhật.
- [ ] Request/response DTO riêng; input được validate ở tất cả boundaries.
- [ ] Không expose ORM entity/secrets/private fields.
- [ ] Error code và response tương thích Problem Details contract.

### Architecture & data

- [ ] Controller mỏng; nghiệp vụ ở service; không có ORM query trong controller.
- [ ] Không thêm circular dependency hoặc import trực tiếp file triển khai nội bộ của feature khác.
- [ ] Migrations có review; constraints/indexes/transaction đúng.
- [ ] Concurrency/idempotency/event delivery đã được xem xét nếu có side effects.
- [ ] Query giới hạn dữ liệu, pagination, tenant isolation khi cần.

### Security & operations

- [ ] Authentication, function/object/field-level authorization đầy đủ.
- [ ] Có security test cho IDOR/BOLA/cross-tenant và mass assignment (nếu áp dụng).
- [ ] Không log secrets/PII; logs có requestId/traceId.
- [ ] External calls có timeout/retry policy, webhook được xác minh.
- [ ] Config validated; health/readiness, monitoring và alert impact đã xem xét.

### Quality & release

- [ ] `format:check`, `lint`, `typecheck`, `build`, tests pass.
- [ ] Unit/integration/e2e/contract tests phù hợp rủi ro đã bổ sung.
- [ ] Breaking changes/deprecation/DB migration/rollout documented.
- [ ] PR description và reviewers đầy đủ; không secrets, debug code hoặc bypass lint.

---

## 24. Thang đánh giá khi review code

| Severity | Ý nghĩa | Ví dụ | Merge? |
|---|---|---|---|
| **BLOCKER** | Lỗ hổng, mất dữ liệu, phá contract, test fail | BOLA/IDOR, SQL injection, lộ secrets, wrong money calculation, unsafe migration | Không |
| **MAJOR** | Vi phạm chuẩn ảnh hưởng maintainability/correctness | Không DTO, không auth test, unbounded query, swallow error, circular dependency mới | Không, trừ exception được duyệt |
| **MINOR** | Chưa nhất quán, ít rủi ro | Tên hàm thiếu rõ ràng, duplicated mapper nhỏ, comment lỗi thời | Có thể theo team policy; ghi follow-up |
| **SUGGESTION** | Cải thiện tùy chọn | Refactor hàm ngắn hơn, tối ưu nhỏ chưa cần | Có |

> Không dùng naming/format để chặn PR khi cùng thay đổi đang có lỗi bảo mật hoặc correctness nghiêm trọng hơn. Ưu tiên giải quyết theo severity.

---

## 25. Quick reference cho lập trình viên và AI coding agents

Trước khi viết code:

1. Xác định feature/module sẽ sửa và contract hiện có; ưu tiên pattern đơn giản đã dùng trong repository.
2. Chọn REST route + status + request/response DTO + error codes.
3. Xác định actor, tenant, authorization và dữ liệu nhạy cảm.
4. Xác định consistency: transaction, concurrency, idempotency, external event.
5. Viết service xử lý nghiệp vụ + tests; controller chỉ lo phần HTTP.
6. Update OpenAPI, migration, docs, observability, CI.

**Không bao giờ tự động:**

- Nới lỏng authZ, tắt validation, disable ESLint/TS strict, viết raw SQL không bind params;
- Thêm `any`, `@ts-ignore`, non-null assertion vào application code để lách lỗi type;
- Phá API public hoặc migration có data loss mà không yêu cầu approval;
- Bỏ qua tests hoặc giả vờ tests đã pass khi chưa chạy;
- Đưa secrets, production data hoặc PII vào prompt/log/test fixtures;
- Tự tạo shared abstraction/global module khi chưa có nhu cầu thật.

**Ưu tiên:** Đúng nghiệp vụ → an toàn dữ liệu → backwards compatibility → testability → maintainability → hiệu năng đo đạc.

---

## 26. Tài liệu tham chiếu (official / normative)

- NestJS Documentation: https://docs.nestjs.com/
- NestJS Controllers: https://docs.nestjs.com/controllers
- NestJS Providers: https://docs.nestjs.com/providers
- NestJS Modules: https://docs.nestjs.com/modules
- NestJS Validation: https://docs.nestjs.com/techniques/validation
- NestJS Exception Filters: https://docs.nestjs.com/exception-filters
- NestJS Versioning: https://docs.nestjs.com/techniques/versioning
- NestJS Serialization: https://docs.nestjs.com/techniques/serialization
- NestJS OpenAPI: https://docs.nestjs.com/openapi/introduction
- NestJS Authentication/Authorization: https://docs.nestjs.com/security/authentication , https://docs.nestjs.com/security/authorization
- NestJS Testing: https://docs.nestjs.com/fundamentals/testing
- typescript-eslint typed linting: https://typescript-eslint.io/getting-started/typed-linting/
- typescript-eslint shared configs: https://typescript-eslint.io/users/configs/
- OWASP API Security Top 10 (2023): https://api-security.owasp.org/editions/2023/en/0x11-t10/
- RFC 9457 — Problem Details for HTTP APIs: https://www.rfc-editor.org/rfc/rfc9457
- RFC 9110 — HTTP Semantics: https://www.rfc-editor.org/rfc/rfc9110
- Node.js releases & LTS policy: https://nodejs.org/en/about/previous-releases
- OpenAPI Specification: https://spec.openapis.org/oas/latest.html
- Conventional Commits: https://www.conventionalcommits.org/en/v1.0.0/

### Ownership / changes to this document

- **Owner:** Backend Tech Lead / người phụ trách repository.
- **Review cadence:** Mỗi quý hoặc khi nâng major NestJS/TypeScript/Node/ORM.
- **Change process:** PR + review; cập nhật tài liệu khi thay đổi API contract, security baseline hoặc CI gates; ADR chỉ khi có quyết định thiết kế lớn.
- **Exception process:** Ghi rõ rule, lý do, scope, owner, risk, ngày xem xét lại và mitigation trong PR/ADR.
