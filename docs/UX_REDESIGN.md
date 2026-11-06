# UX-002 — giao diện khám phá Cosmos Explorer

Cập nhật: 2026-11-06. Issue #16. Giao diện đã được triển khai vào ứng dụng thật, cùng kiểm tra cục bộ. Hai review tác nhân cùng SHA và GitHub `product` là cổng bắt buộc trước merge.

[Canvas tham chiếu](https://superdesign.dev/teams/501cb23c-539b-4164-ac0e-abb52ef106be/projects/3da4eb2b-2ac6-43f4-bfd9-cd9eaf6dc337) · [Bản mẫu thị giác, version 3](https://p.superdesign.dev/draft/e3eb1328-4970-4b50-ac61-2a777ea4eab3). Bản mẫu chỉ để xem thiết kế; chức năng thật chạy từ `cosmos-explorer/index.html`.

## Thay đổi trải nghiệm

- Trang **Khám phá** mặc định khi mở URL không có hash: tìm kiếm, vào thư viện, xem nhóm, mục đã lưu, sơ đồ và so sánh. Mọi hành động dùng catalog thật gồm 164 hồ sơ.
- Ba hồ sơ nổi bật lấy nội dung/ảnh/credit từ catalog: Trái Đất, Orion và M45. Nút đọc mở hồ sơ rộng; lưu dùng khóa hiện có và thông báo nếu chỉ lưu được trong phiên; so sánh phản ánh đúng trạng thái chọn/bỏ chọn.
- **Thư viện** và **So sánh** dùng toàn chiều rộng. Bộ lọc, phân trang tối đa 12 thẻ, đơn vị/định nghĩa và giá trị null giữ nghĩa cũ; so sánh có vùng cuộn riêng ở màn hẹp.
- Logo và nút Khám phá về URL trang đầu không hash. Từ hồ sơ mở qua trang đầu, nút trở lại hoặc Escape đưa về đúng ngữ cảnh và focus. Tìm nhanh trên đầu trang vẫn mở hồ sơ thật.
- Sơ đồ vẫn là chế độ riêng, giữ tổng thể Hệ Mặt Trời khi chọn Trái Đất; không đổi thành bản đồ tọa độ hoặc mô phỏng vật lý. Deep link cũ tiếp tục hoạt động.

## Bảng màu và độ bền

Theo phản hồi về các mảng trắng, mặc định hiện dùng nền tối đồng nhất: #07111f, card navy #14263b, chữ sáng #edf4fa, chữ phụ #b5c5d5 và điểm nhấn xanh #b5ddf2. Nút/ô nhập có nền và màu chữ rõ; vùng chạm điều khiển tối thiểu 44px. Font hệ thống hoạt động ngoại tuyến, không thêm runtime CDN hay bước build.

Ảnh khoa học giữ toàn khung bằng contain, nhãn loại tư liệu và credit. Ảnh hero/featured lỗi có thông báo dễ đọc và đường mở hồ sơ, không giả thành ảnh quan sát khác. Giữ 164 hồ sơ/152 ảnh, ID/hash, yêu thích cũ, nguồn, null, CSP, localStorage lỗi và file:// offline. Không thêm tài khoản hoặc dữ liệu thiên văn thời gian thực.

## Kiểm chứng và giới hạn

`check_all.py --browser` đạt 28 unit tests, 14 nhóm smoke và 12 nhóm kiểm tra museum. Chrome ở 390/820/1440px đã kiểm tìm kiếm, lọc, lưu/bỏ lưu, so sánh, đọc, quay lại, bàn phím, màu nền, vùng chạm và ảnh lỗi; ảnh thực của trang đầu/thư viện/hồ sơ đã được chụp và xem. Các bộ kiểm tra cũ về dữ liệu, chia sẻ, storage, HTTPS loopback, CSP và quyền riêng tư đều đạt. [Bằng chứng](qa/museum-ui-2026-11-06.json).

Đây là kiểm tra tự động và tác nhân, không phải thử với người thật hay chứng nhận WCAG. SCI-001/USER-001/PUB-001 tiếp tục manual; chưa deploy công khai. Theo yêu cầu cập nhật ngày 06/11/2026, dừng khi còn 10% quota 5 giờ; tự tiếp tục sau khi backend xác nhận hạn mức hồi trên ngưỡng.
