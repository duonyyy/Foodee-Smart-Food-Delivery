# Foodee Kubernetes PoC

Thư mục này là nền tảng **thử nghiệm trên máy cá nhân**. Docker Compose vẫn là cách chạy demo hiện tại. Các manifest không được nối vào CI/CD và chưa triển khai lên cluster nào.

## Cấu trúc và thứ tự chạy

| Giai đoạn | Nội dung | Điều kiện trước khi tiếp tục |
| --- | --- | --- |
| `data/` | PostgreSQL, Redis, MinIO và cấu hình không nhạy cảm | Ba StatefulSet sẵn sàng, PVC đã bind |
| `migration/` | Job chạy TypeORM migration một lần | Job hoàn thành thành công |
| `apps/` | API, worker, chatbot, vision, web-client | Kiểm tra Pod và luồng ứng dụng |

Các service dùng tên DNS nội bộ `postgres`, `redis`, `minio`, `api`, `ai-server`, `food-ai`. Trình duyệt dùng các cổng `localhost` qua `kubectl port-forward`, do đó phải build web-client với đúng URL ghi bên dưới. Thay URL chỉ bằng biến môi trường lúc chạy sẽ không đổi giá trị `NEXT_PUBLIC_*` đã đóng gói trong Next.js.

## Điều kiện để thử trên kind

- Docker Engine, `kubectl` và `kind` đã cài; máy cần đủ RAM cho vision model và năm ứng dụng.
- Cluster có StorageClass mặc định để cấp PVC. Kiểm tra bằng `kubectl get storageclass`.
- Có khóa Gemini và Mapbox hợp lệ. Ví dụ bí mật trong repo chỉ là placeholder; Gemini cần cho câu trả lời chatbot, còn backend kiểm tra Mapbox token khi khởi động.
- Các lệnh dưới đây chạy từ **gốc repo** trong PowerShell. Không dùng dữ liệu thật trong PoC.

Tạo cluster và build image tại máy (chỉ khi muốn chạy PoC):

```powershell
kind create cluster --name foodee-poc
docker build -t foodee/backend:poc -f core-api/docker/Dockerfile core-api
docker build -t foodee/minio:poc -f core-api/docker/minio.Dockerfile core-api
docker build -t foodee/ai-server:poc chatbot-service
docker build -t foodee/food-ai:poc vision-service
docker build -t foodee/frontend:poc --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001 --build-arg NEXT_PUBLIC_FOOD_AI_URL=http://localhost:5000 --build-arg NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google web-client
kind load docker-image --name foodee-poc foodee/backend:poc foodee/minio:poc foodee/ai-server:poc foodee/food-ai:poc foodee/frontend:poc
```

Web-client còn cần `NEXT_PUBLIC_CLIENT_ID` và `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` ở bước build nếu muốn dùng Google login và bản đồ. Chúng là giá trị **công khai phía trình duyệt**, không đưa khóa bí mật vào build args. Nếu đăng nhập Google, callback URL cũng cần được đăng ký với nhà cung cấp.

Tạo Secret thủ công trước khi áp dụng manifest. `k8s/secrets.env` được Git bỏ qua; không đưa khóa thật vào file `.yaml` đã track.

```powershell
Copy-Item k8s/secrets.env.example k8s/secrets.env
# Sửa k8s/secrets.env: thay tất cả REPLACE_WITH_... bằng giá trị dùng cho PoC.
kubectl apply -f k8s/namespace.yaml
kubectl -n foodee-poc create secret generic foodee-secrets --from-env-file=k8s/secrets.env
```

Sau đó chạy **lần lượt**:

```powershell
kubectl apply -k k8s/data
kubectl -n foodee-poc rollout status statefulset/postgres --timeout=5m
kubectl -n foodee-poc rollout status statefulset/redis --timeout=5m
kubectl -n foodee-poc rollout status statefulset/minio --timeout=5m
kubectl -n foodee-poc get pvc

kubectl apply -k k8s/migration
kubectl -n foodee-poc wait --for=condition=complete job/foodee-migrate --timeout=5m
kubectl -n foodee-poc logs job/foodee-migrate

kubectl apply -k k8s/apps
kubectl -n foodee-poc rollout status deployment/api --timeout=5m
kubectl -n foodee-poc rollout status deployment/ai-server --timeout=5m
kubectl -n foodee-poc rollout status deployment/food-ai --timeout=10m
kubectl -n foodee-poc rollout status deployment/frontend --timeout=5m
kubectl -n foodee-poc rollout status deployment/worker --timeout=5m
```

Job migration đã tạo là bất biến. Khi cần chạy migration mới, kiểm tra schema và bản sao lưu trước, rồi xóa Job cũ và `kubectl apply -k k8s/migration` lại. Không tự động chạy Job mỗi lần áp dụng `apps/`.

Mở **bốn terminal riêng**, giữ các lệnh sau chạy trong lúc thử trình duyệt:

```powershell
kubectl -n foodee-poc port-forward svc/frontend 3000:3000
kubectl -n foodee-poc port-forward svc/api 3001:3001
kubectl -n foodee-poc port-forward svc/food-ai 5000:5000
kubectl -n foodee-poc port-forward svc/minio 9000:9000
```

Mở `http://localhost:3000`; API `http://localhost:3001/health`; chatbot gọi nội bộ qua API. Nếu Pod lỗi, xem `kubectl -n foodee-poc get pods`, `kubectl -n foodee-poc describe pod <tên>` và `kubectl -n foodee-poc logs <tên>`. Nếu PVC Pending, kiểm tra StorageClass. Nếu dùng image tag mới, phải build/load lại rồi cập nhật manifest; `imagePullPolicy: Never` cố ý không kéo image từ registry.

## Giới hạn hiện tại

- `replicas: 1` cho mọi thành phần; dữ liệu nằm trên một node, chưa có backup/restore, HA, TLS/Ingress, NetworkPolicy, quota, giám sát hay quy trình nâng cấp. Không dùng manifest này cho production.
- API `/health` chưa chứng minh kết nối PostgreSQL, Redis, MinIO và AI; chatbot `/ready` chưa thử gọi Gemini. Worker chưa có readiness endpoint đo khả năng tiêu thụ hàng đợi.
- API và web-client dùng MinIO root credentials vì service hiện tại quản lý bucket/policy bằng tài khoản đó. Cần tách quyền trước khi triển khai thật.
- Vision runtime dùng `emptyDir`; file tạm mất khi Pod bị thay. Cần xác nhận vòng đời kết quả trước khi chọn lưu trữ bền vững.
- `NODE_ENV=development` cho API/worker chỉ để cho phép CORS HTTP localhost theo logic ứng dụng hiện tại. Đừng dùng cấu hình này làm production.
- Cấu hình URL localhost và `port-forward` chỉ dùng được trên chính máy chạy lệnh; thiết bị khác không truy cập trực tiếp được.

Kiểm tra cú pháp manifest mà **không tạo cluster**:

```powershell
kubectl kustomize k8s/data
kubectl kustomize k8s/migration
kubectl kustomize k8s/apps
```
