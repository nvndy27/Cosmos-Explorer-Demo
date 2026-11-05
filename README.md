# Cosmos Explorer 2.2

Mở [cosmos-explorer/index.html](cosmos-explorer/index.html) trực tiếp bằng trình duyệt. Không cần máy chủ, framework, tài khoản hoặc API key.

138 hồ sơ (thêm 30), 126 hình ảnh cục bộ. Ba chế độ **Sơ đồ / Thư viện / So sánh**, hồ sơ đọc rộng và bốn bộ sưu tập. Chọn hành tinh luôn giữ tổng thể Hệ Mặt Trời; ảnh chi tiết nằm ở hồ sơ bên phải hoặc bên dưới trên mobile.

[Hướng dẫn](cosmos-explorer/README.md) · [Requirements](docs/REQUIREMENTS.md) · [Roadmap](docs/ROADMAP.md) · [Dữ liệu và nguồn](docs/DATA_POLICY.md) · [Kiểm tra](docs/QA.md) · [Kiểm kê ID và hồ sơ mới](docs/inventory-2.2.json)

## Phát triển thành sản phẩm

[Định nghĩa sản phẩm](docs/PRODUCT.md) · [Roadmap mới](docs/ROADMAP.md) · [Quy tắc làm việc](docs/WORK_RULES.md) · [Vận hành 3 Codex + 2 AGY](docs/AUTOMATION.md) · [Backlog](automation/backlog.json)

Kiểm tra tổng hợp: `rtk proxy python3 scripts/check_all.py`. Automation: `rtk proxy python3 scripts/automation.py status`. Chưa triển khai công khai.

[Hướng dẫn học sinh/giáo viên](docs/USER_GUIDE.md) · [Kiểm kê nội dung](docs/CONTENT_AUDIT.md) · [Phát hành và quay lui](docs/RELEASE.md) · [Báo cáo automation 05/11/2026](docs/qa/automation-2026-11-05.json)

Automation đã kiểm chứng qua systemd user: 3 Codex + 2 AGY, 09:00 giờ Việt Nam mỗi ngày. Khi hết backlog ready chỉ chạy kiểm tra sức khỏe. Trạng thái và cách tạm dừng ở docs/AUTOMATION.md. Bản public vẫn chờ các cổng nghiệm thu trong roadmap.

Theo dõi quota đã bật: giữ ít nhất 10% cửa sổ Codex 5 giờ, kiểm tra mỗi 2 phút và gửi tiếp vào đúng phiên điều phối đang mở sau khi backend xác nhận hạn mức hồi lại. [Báo cáo storage/HTTPS/quota](docs/qa/live-storage-quota-2026-11-05.json) · [Chính sách và cách dừng](docs/AUTOMATION.md).
