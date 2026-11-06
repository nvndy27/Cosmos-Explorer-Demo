# Trạng thái sản phẩm — 2026-11-06

## Đợt hoàn thiện cảnh hành tinh — issue #18

Ngày 06/11/2026: đã triển khai renderer Canvas có cache, ánh sáng/bề mặt và vành đai trước/sau; thêm lựa chọn minh họa trong hồ sơ tám hành tinh, giữ ảnh tư liệu mặc định và ghi công gốc. Giao diện sơ đồ có bề mặt tối và vùng chạm rõ hơn. Đây là minh họa nghệ thuật, không phải mô phỏng vật lý hoặc vị trí thời gian thực. Catalog 164 hồ sơ/152 ảnh không thay đổi.

Đợt tương tác có ba Codex (gồm điều phối), Claude CLI rà hành trình và hai AGY review trước tích hợp. Bằng chứng kiểm tra và giới hạn được ghi trong QA.md. Trạng thái sản phẩm vẫn là beta local: SCI-001/USER-001/PUB-001 cần người thật; chưa triển khai công khai.

## Giao diện khám phá museum

Đã nối trang đầu vào toàn bộ catalog thật, đồng nhất nền tối, mở rộng thư viện/so sánh và sửa các nút tìm kiếm/lưu/đọc/chuyển chế độ. Bộ kiểm tra cục bộ trên code `3306a4f0e70a3985d3d9b3d8c0ee314efe447fcd` đạt 28 unit tests, 14 smoke, 12 nhóm museum và các bộ Chrome cũ. Dữ liệu/catalog/ảnh giữ nguyên. [Bằng chứng UI](qa/museum-ui-2026-11-06.json); hai AGY cùng SHA và GitHub CI là cổng trước merge. Chưa deploy công khai.

## Mở rộng Messier

Đã nhập 26 hồ sơ NASA, dựng catalog 164 hồ sơ/152 ảnh và SQLite schema 2. Toàn bộ cổng tự động đạt: 28 unit tests, 14 nhóm smoke, validator nguồn/ảnh/hash và Chrome 390/820/1440. Nội dung 138 hồ sơ cũ giữ nguyên; CSDL integrity/FK đạt. Hai review cùng SHA và GitHub CI là cổng trước tích hợp; xem [bằng chứng](qa/messier-expansion-2026-11-05.json). Không triển khai web công khai.

Cosmos Explorer 2.2 đang ở giai đoạn chuẩn bị beta: nền vận hành P0 đã đạt; phần kỹ thuật tự động của P1 và tính năng chia sẻ/hướng dẫn trong P2 đã có bằng chứng. Chưa đạt toàn bộ P1/P2 vì QA thủ công và thử người dùng còn thiếu. P3 phát hành public chưa bắt đầu.

## Đã có bằng chứng
- 164 hồ sơ, 152 ảnh có manifest/hash, web tĩnh và file:// ngoại tuyến.
- Tìm không dấu, thư viện, so sánh 2–4 hồ sơ, lưu cục bộ, copy link và cảnh báo đường dẫn file cục bộ.
- Commit ứng dụng `010ec39fe9e00ff6c997d4c50424070370042cc4`: 18 unit tests, 14 smoke, catalog validator, Chrome 390/820/1440, HTTP/HTTPS loopback, storage fault injection và share QA đạt; hai AGY duyệt cùng SHA. [Bằng chứng](qa/ux-share-2026-11-05.json).
- Automation định kỳ 09:00 dừng khi quota cửa sổ 5 giờ còn ≤10%; timer trên máy theo dõi điều kiện tiếp tục sau reset. Máy/phiên cần hoạt động để timer chạy.
- Mã nguồn đã lên GitHub public; chưa có URL website công khai.

## Cổng còn mở
| Issue | Việc cần làm | Điều kiện hoàn thành |
|---|---|---|
| [SCI-001 / #2](https://github.com/nvndy27/Cosmos-Explorer-Demo/issues/2) | Người có chuyên môn rà nguồn và quyền ảnh | Ghi người rà, phạm vi, sai khác và kết luận |
| [USER-001 / #3](https://github.com/nvndy27/Cosmos-Explorer-Demo/issues/3) | 5 người dùng thật, screen reader, Firefox/Safari | Ít nhất 4/5 hoàn thành 3 hành trình; QA thủ công có bằng chứng |
| [PUB-001 / #4](https://github.com/nvndy27/Cosmos-Explorer-Demo/issues/4) | Hosting/domain, deploy và rollback | Hai cổng trên đạt, chủ dự án yêu cầu deploy, URL HTTPS thật và rollback được kiểm |

HTTPS self-signed trên loopback không xác minh hosting/TLS công khai. Kiểm tra tự động không thay người thử hoặc chuyên gia khoa học. Website tĩnh có thể phục vụ nhiều người độc lập khi được host; chưa có thử tải trên hosting thật để hứa số người đồng thời.

## Khả năng tiếp cận thư viện — issue #20

Candidate đạt cổng tổng hợp: 28 unit, 14 smoke, 12 museum, 9 scene và 15 kiểm tra thư viện tại 390/820/1440. Hai AGY cùng SHA và GitHub `product` vẫn là điều kiện trước merge; coordinator quản lý trạng thái backlog và phát hành. Chưa áp dụng lên `main`; chi tiết và giới hạn ở [QA](QA.md#khả-năng-tiếp-cận-thư-viện--issue-20-2026-11-06).

## Người dùng giả lập bổ sung
Ngày 2026-11-05: ba browser context độc lập ở 390/820/1440 px, offline và reduced motion, đều PASS tìm không dấu, đọc hồ sơ/link nguồn, lưu và so sánh Earth/Mars; không pageerror/overflow trong luồng đã chạy. Đây là 0 người dùng thật, không thay cổng USER-001. [Báo cáo](qa/personas-2026-11-05.json).

## Nền dữ liệu và bảo mật — mốc trước Messier, 2026-11-05
SQLite schema 2 đã dựng thực: 138 hồ sơ, 158 bí danh, 334 nguồn, 535 liên kết nguồn, 712 đại lượng, 126 ảnh. API JSON local chỉ đọc có kiểm tra injection/traversal/giới hạn; frontend vẫn dùng catalog tĩnh. CSP, bỏ font ngoài, referrer policy và thao tác xóa yêu thích trên thiết bị đã có QA. README tập trung sản phẩm và ảnh thật. [Bằng chứng mới](qa/product-foundation-2026-11-05.json).

Đợt nền sản phẩm này đạt 27 unit tests, 14 smoke và các bộ Chrome. GitHub QA chạy theo PR/main/lịch; main yêu cầu PR và check product, cấm force push/xóa; private vulnerability reporting đã bật. Đây là nền kỹ thuật chuẩn bị beta, chưa hoàn thành các cổng người thật/khoa học/hosting ở bảng trên.
