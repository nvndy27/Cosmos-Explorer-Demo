# UX-002 — phương án thiết kế lại Cosmos Explorer

Ngày: 2026-11-05. Issue #16. **Trạng thái: bản mẫu thị giác, chờ chủ dự án chọn trước khi triển khai ứng dụng.**

[Bản xem trước](https://p.superdesign.dev/draft/e3eb1328-4970-4b50-ac61-2a777ea4eab3) · [Canvas](https://superdesign.dev/teams/501cb23c-539b-4164-ac0e-abb52ef106be/projects/3da4eb2b-2ac6-43f4-bfd9-cd9eaf6dc337).

## Vấn đề và hướng mới

Bố cục ba cột hiện tại khiến danh mục, sơ đồ và hồ sơ cạnh tranh diện tích. Trên điện thoại, người muốn đọc phải đi qua nhiều vùng giao diện. Hướng mới là bảo tàng thiên văn: một nội dung chính cho mỗi bước, dùng ảnh có nguồn làm điểm nhấn và dành đủ không gian cho việc đọc.

- Trang khám phá: tìm kiếm nhìn thấy ngay, ảnh Orion đầy đủ khung và chú thích/credit sát ảnh, đường vào thư viện rõ.
- Thư viện: toàn chiều rộng, khu đọc nền sáng, nhóm thiên thể dễ chọn, bộ lọc nâng cao gọn trên mobile. Giữ tối đa 12 thẻ mỗi trang, đặt lại bộ lọc và trạng thái rỗng có hướng xử lý.
- Hồ sơ: không gian đọc riêng, nút quay lại giữ ngữ cảnh thư viện; ảnh, loại tư liệu, ghi công và nguồn có vị trí rõ. Giữ bốn nhóm nội dung và liên kết chia sẻ trực tiếp.
- Sơ đồ: một chế độ tùy chọn; chọn Trái Đất vẫn giữ tổng thể Hệ Mặt Trời. Tiếp tục ghi rõ đồ họa minh họa, không phải bản đồ tọa độ hoặc mô phỏng vật lý.
- So sánh: luồng riêng cho 2–4 hồ sơ, dễ đọc trên điện thoại. Không biến giá trị thiếu thành 0 hoặc gộp khác định nghĩa/đơn vị.

## Thiết kế và hợp đồng giữ lại

Nền đêm #07111f, navy #13263b, khu đọc sáng #f2f5fa, chữ phụ #b7c6d8, xanh nhạt #b5ddf2 và đồng nhạt #d5ad78. System sans hoạt động ngoại tuyến; chữ thân 16px, nhãn tối thiểu 14px, điều khiển tối thiểu 44px. Không tải font ngoài; không dùng chuyển động tự chạy làm điểm nhấn.

Giữ 164 hồ sơ/152 ảnh, ID/hash/yêu thích cũ, khóa lưu riêng, nguồn/credit, phân biệt quan sát/tái dựng/minh họa và null. Ảnh khoa học dùng contain để giữ cả khung và chú giải. Không thêm tài khoản, dữ liệu thời gian thực hoặc khẳng định khoa học mới. Giữ CSP, xử lý localStorage/ảnh lỗi, reduced motion và file:// offline.

## Phạm vi bằng chứng hiện tại

Bản mẫu là một trang khám phá để duyệt hướng thị giác, chưa nối bộ lọc/lưu/hồ sơ/so sánh với catalog ứng dụng. Chrome đã mở bản mẫu ở 390/820/1440px, giải mã 5 vị trí ảnh và không tràn ngang; ảnh đã được xem. URL xem trước trả HTTP200. Các kết quả này không phải kiểm thử ứng dụng mới hoặc thử với người thật. Bản mẫu canvas có CDN phục vụ trình bày; mã sản phẩm sau triển khai vẫn phải chạy bằng tài nguyên cục bộ.

Ứng dụng hiện hành chưa thay đổi. Hai worker đã lập audit UX và ràng buộc kỹ thuật; tài liệu cục bộ tại .automation/ui-redesign/. Sau khi hướng thiết kế được chấp thuận, chia phần HTML/CSS, view controller và kiểm tra trình duyệt trên worktree riêng; chạy full gates, hai AGY cùng SHA và GitHub product CI trước merge. SCI-001/USER-001/PUB-001 tiếp tục manual. Không deploy web công khai. Giữ ngưỡng dừng khi đã dùng 50% quota 5 giờ.
