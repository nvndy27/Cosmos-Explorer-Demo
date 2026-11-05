# Requirements — Cosmos Explorer 2.2

## Mục tiêu
Ứng dụng thiên văn tiếng Việt cho người phổ thông, mở trực tiếp bằng file://, không thêm framework, tài khoản, API key hay phụ thuộc build. Nội dung và hình cục bộ hoạt động ngoại tuyến.

| Mã | Yêu cầu | Tiêu chí bàn giao |
|---|---|---|
| F01 | Dữ liệu | 138 hồ sơ, 30 mục mới, không trùng ID; giữ 108 ID cũ và khóa yêu thích |
| F02 | Phân loại | Tách hành tinh, hành tinh lùn, vệ tinh; 11 nhóm sơ đồ |
| F03 | Sơ đồ | Chọn hành tinh giữ tổng thể Hệ Mặt Trời; ảnh chi tiết chỉ trong hồ sơ |
| F04 | Thư viện | Tìm tên/bí danh không dấu; lọc loại, hệ, đã lưu, có ảnh; đếm, xóa lọc và trạng thái rỗng |
| F05 | Hiệu năng | Tối đa 12 thẻ/trang, ảnh lazy; ngừng vẽ lại cảnh tĩnh khi không đổi và không vẽ khi ở chế độ khác |
| F06 | Sắp xếp | Tên; bán kính/khoảng cách chỉ cùng định nghĩa, đơn vị, mốc quy chiếu; nêu phạm vi tập kết quả |
| F07 | So sánh | Chọn 2–4 mục, chặn mục thứ 5; bán kính/khối lượng/chu kỳ có đơn vị, định nghĩa, nguồn; không biến null thành 0 |
| F08 | Biểu đồ | Bán kính tuyến tính đúng tỷ lệ; không gộp định nghĩa/đơn vị/giới hạn hoặc phép suy chưa phù hợp; không dùng log |
| F09 | Hồ sơ | 4 tab Tổng quan/Đặc điểm/Khám phá/Nguồn; đọc rộng, focus và Escape; mobile ở dưới sơ đồ |
| F10 | Bộ sưu tập | Hành tinh đá, Hành tinh khổng lồ, TRAPPIST-1, Vệ tinh; lời dẫn và liên kết hồ sơ |
| F11 | Nội dung mới | 4 hành tinh lùn, 10 vệ tinh, 6 TRAPPIST-1, 10 ngoại hành tinh khác; có host/system, nguồn, ngày và giới hạn |
| F12 | Tám hành tinh | Nội dung biên tập, lịch sử/thám hiểm, bán kính trung bình và xích đạo, khối lượng, chu kỳ có nguồn JPL |
| N01 | Giao diện | Token tại DESIGN22.md; xanh đêm/băng/vàng nhạt, font cũ + fallback, nội dung tối thiểu 14 px |
| N02 | Tiếp cận | Focus rõ, tab bàn phím, đọc rộng, reduced motion, dừng chuyển động mặc định |
| N03 | Độ bền | localStorage lỗi/cấm, ảnh lỗi, offline và file:// không làm mất nội dung |
| N04 | Khoa học | null cho thiếu; phân biệt định nghĩa; không suy sự sống/nước/khí quyển từ kích thước hay quỹ đạo |
| N05 | Truy vết | Snapshot, nguồn từng đại lượng, 126 hình ảnh có manifest/ghi công/hash; sửa snapshot rồi build |
| N06 | Kiểm tra | Cú pháp, smoke, nguồn/ID/manifest, Chrome 390/820/1440; ghi trung thực giới hạn còn lại |

## Ngoài phạm vi
Không triển khai công khai; không đồng bộ API khi mở; không phải bản đồ tọa độ Gaia, mô phỏng vật lý hay công cụ dẫn đường thiên văn. Không tự điền số để đủ 30 hồ sơ.

## Hợp đồng cho giai đoạn sản phẩm sau 2.2

Các yêu cầu F01–N06 ở trên mô tả bản 2.2, không phải bằng chứng public-ready. Định hướng mới: PRODUCT.md; quy tắc: WORK_RULES.md.

| Mã | Yêu cầu mới | Cổng nghiệm thu |
|---|---|---|
| P01 | Web nhiều người truy cập độc lập | Bản static HTTPS, direct link, tài nguyên đường dẫn tương đối; kiểm tra trên hosting đã chọn |
| P02 | Bản ngoại tuyến tiếp tục hoạt động | file:// trên context mới offline, ảnh lỗi và localStorage bị cấm có dự phòng |
| P03 | Phát hành tái tạo và quay lui | ZIP + checksum + hướng dẫn, giữ gói trước; thử rollback trên hosting trước công bố |
| P04 | Automation hữu hạn, truy vết được | 3 Codex / 2 AGY, worktree riêng, timeout, lock, log, review cùng commit và tests; không auto deploy |
| P05 | Người dùng thật hoàn thành việc học | Ít nhất 4/5 người thử hoàn thành ba hành trình ở PRODUCT.md; chủ dự án thu phản hồi |
| P06 | Khoa học và tiếp cận được rà | Review nguồn/ghi công và QA thủ công trình đọc màn hình; ghi rõ phạm vi/chưa kiểm |
