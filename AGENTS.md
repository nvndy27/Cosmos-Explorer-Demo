# Cosmos Explorer — hướng dẫn cho tác nhân

@/home/nguyenduy/.codex/RTK.md

## Phạm vi
Ứng dụng học thiên văn bằng tiếng Việt, chạy tĩnh từ `cosmos-explorer/index.html`. Đọc `docs/REQUIREMENTS.md`, `docs/ROADMAP.md`, `docs/DATA_POLICY.md` trước khi sửa.

## Nguyên tắc khoa học
- Chỉ thêm đối tượng đã được xác nhận. Không bịa thông số, tọa độ, ảnh hoặc trích dẫn.
- Ưu tiên NASA Science, ESA/Gaia, NASA Exoplanet Archive, bài báo gốc và ESO/EHT. Tìm và đọc nguồn trước khi biên tập.
- Mỗi thông số phải có đơn vị, nguồn; ghi rõ xấp xỉ. Dữ liệu có thể thay đổi cần ngày đối chiếu. Không đồng nhất bán kính trung bình và xích đạo.
- Phân biệt ảnh quan sát đã xử lý, tái dựng từ dữ liệu, mô hình khoa học và minh họa nghệ thuật. Luôn giữ nguồn ảnh và tác giả.
- Không gọi điểm sao ngẫu nhiên là dữ liệu Gaia, không gọi Canvas là mô phỏng vật lý hay bản đồ 3D thật.
- Khả năng có nước lỏng không chứng minh nước, khí quyển hoặc sự sống. Giữ rõ giới hạn đo đạc.

## Kiến trúc
- `catalog.js`: dữ liệu biên tập, nguồn và ghi công ảnh. Chỉ chứa nội dung tin cậy; mã hiển thị dùng innerHTML cho dữ liệu nội bộ. Không đưa nội dung API thô vào innerHTML.
- `data/exoplanet-image-snapshot.json`: hình ngoại hành tinh; giữ nhãn minh họa riêng/hệ/đại diện, không gán minh họa thành quan sát.
- `catalog-expanded.js`: sinh từ snapshot bằng `scripts/build_catalog.py`; sửa snapshot có nguồn trước, rồi dựng lại.
- `app.js`: điều hướng, tìm kiếm, lưu cục bộ và hồ sơ.
- `scene.js`: sơ đồ tổng quan và minh họa theo loại; ảnh chi tiết chỉ ở hồ sơ bên phải. Chọn Trái Đất không được phóng thành quả cầu lớn ở giữa.
- `explorer-model.js`: bộ lọc, định dạng và kiểm tra tính tương thích của đại lượng; không gộp khác định nghĩa/đơn vị, giá trị thiếu không là 0.
- `explorer-ui.js`: thư viện, bộ sưu tập, đọc rộng và so sánh 2–4 hồ sơ.
- `styles.css`, `enhancements.css`, `explorer22.css`: nền giao diện, token và cải tiến responsive. Không thêm phụ thuộc build khi chưa cần.
- Giữ khả năng mở bằng file, hoạt động không có mạng với nội dung/đồ họa dự phòng.

## Kiểm tra
Chạy `rtk proxy node --check cosmos-explorer/app.js`, `rtk proxy node --check cosmos-explorer/catalog.js` và `rtk proxy node cosmos-explorer/tests/smoke.cjs`.
Kiểm tra trình duyệt ở 390, 820 và 1440 px; bàn phím, giảm chuyển động, ảnh lỗi, localStorage lỗi. Chạy thêm `rtk proxy node --check cosmos-explorer/scene.js` và `rtk proxy node --check cosmos-explorer/catalog-expanded.js`. Chạy thêm kiểm tra cú pháp `explorer-model.js`, `explorer-ui.js` và `rtk proxy node scripts/validate_catalog.cjs`. Kiểm tra các ảnh cục bộ và manifest khi cập nhật dữ liệu. Browser QA tùy chọn: `scripts/check_browser.cjs` với Playwright bên ngoài repo (xem docs/QA.md). Smoke dùng DOM giả và không thay thế kiểm tra bố cục thực. Không tuyên bố đã kiểm tra ảnh/hiển thị nếu công cụ không chạy được.
Không triển khai công khai hoặc gửi tin nhắn cho bên thứ ba nếu chưa được yêu cầu.

## Vận hành nhiều CLI
Đọc `docs/PRODUCT.md`, `docs/WORK_RULES.md`, `docs/AUTOMATION.md` trước khi nhận tác vụ. Backlog duyệt tại `automation/backlog.json`; chỉ sửa `allowed_paths` của tác vụ, không sửa luật/bộ điều phối để vượt nghiệm thu. Không tạo tác nhân con trong một worker CLI. Không commit, merge, deploy hay sửa trạng thái backlog trong worker; bộ điều phối quản lý Git. Báo cáo trung thực bằng tiếng Việt.
