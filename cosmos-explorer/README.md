# Cosmos Explorer 2.2

Mở **index.html** bằng trình duyệt, giữ nguyên các tệp và thư mục đi kèm. Nội dung, đồ họa và 126 hình ảnh cục bộ dùng được ngoại tuyến qua file://. Liên kết nguồn khoa học cần Internet; Google Fonts có font hệ thống dự phòng.

## Khám phá
- **Sơ đồ:** góc nhìn tổng thể, nhãn chọn và hồ sơ bên phải/bên dưới. Chọn một hành tinh không phóng thành quả cầu lớn ở trung tâm. Kích thước, quỹ đạo và vị trí đều minh họa; chuyển động dừng mặc định.
- **Thư viện:** tối đa 12 thẻ/trang; ảnh tải lười. Tìm tên tiếng Việt, tiếng Anh, bí danh; lọc phân loại, hệ, đã lưu và có ảnh từ quan sát. Xóa bộ lọc để quay lại đầy đủ.
- Sắp xếp tên A–Z, bán kính trung bình (km), bán kính quá cảnh (R⊕), hoặc khoảng cách từ Mặt Trời (pc). Các lượt sắp xếp số chỉ chứa dữ liệu cùng định nghĩa và đơn vị; phạm vi được giải thích ngay trên kết quả.
- **So sánh:** chọn 2–4 hồ sơ từ thẻ, hồ sơ hoặc bộ chọn. Các đại lượng gồm bán kính, khối lượng và chu kỳ; thiếu dữ liệu hiển thị “Chưa có dữ liệu”, không thay bằng 0. Không gộp các định nghĩa khác nhau. Thanh bán kính theo tỷ lệ tuyến tính, không phải diện tích/thể tích và không dùng thang log.
- **Đọc hồ sơ:** Tổng quan / Đặc điểm / Khám phá / Nguồn. “Đọc rộng” dành nhiều diện tích cho bài đọc; Escape hoặc “Trở lại khám phá” đóng chế độ này. Trên mobile, hồ sơ nằm dưới sơ đồ.
- **Bộ sưu tập khám phá:** Hành tinh đá, Hành tinh khổng lồ, Hệ TRAPPIST-1, Các vệ tinh đáng khám phá. Mở mục Bộ sưu tập để xem lời dẫn, các liên kết đọc và lọc nhóm hồ sơ.
- ☆ lưu trên thiết bị, dùng cùng khóa localStorage của bản cũ. Bộ lọc “Đã lưu” ở thanh bên áp dụng trong nhóm hiện tại; bộ lọc tương ứng của thư viện áp dụng trên kết quả thư viện.
- Giữ các ID/hash cũ, gồm #earth và #trappist. Phím / mở tìm kiếm, Enter chọn kết quả đầu, mũi tên chuyển hồ sơ khi ở sơ đồ; các thanh tab hỗ trợ mũi tên/Home/End. Escape đóng hướng dẫn/tìm kiếm hoặc chế độ đọc rộng.

## Dữ liệu
Tổng 138 hồ sơ, không trùng ID. Bản 2.2 thêm 4 hành tinh lùn, 10 vệ tinh, 6 hành tinh TRAPPIST-1 (giữ e), 10 ngoại hành tinh khác. Không tính sao chủ vào số hành tinh mới. Tám hành tinh được nâng cấp nội dung và thông số có nguồn.

Ngày đối chiếu: 2026-10-21. Nguồn NASA Science, NASA/JPL, ESA, NASA Exoplanet Archive và tham chiếu nghiên cứu trong hồ sơ. Snapshot biên tập ở `data/upgrade22-snapshot.json`; dựng JavaScript bằng `../scripts/build_catalog.py`. Không truy vấn API khi mở ứng dụng.

Bán kính trung bình khác xích đạo và quá cảnh; khối lượng tối thiểu/giới hạn trên/ước tính từ bán kính có nhãn riêng. Nhiệt độ cân bằng là từ mô hình, không phải nhiệt độ bề mặt đo được. Không suy ra nước, khí quyển hoặc sự sống từ kích thước/vị trí quỹ đạo. Giá trị chưa được tích hợp và đối chiếu để null; không có nghĩa khoa học chưa từng nghiên cứu chúng.

Cả 37 hồ sơ ngoại hành tinh có hình cục bộ: 20 minh họa riêng/hệ, 16 minh họa đại diện theo loại do NASA sử dụng và 1 ảnh quan sát hồng ngoại Beta Pictoris b. Kepler-16 b và Kepler-22 b dùng tranh NASA/JPL có ghi công. Ảnh phân biệt quan sát, tổng hợp, tái dựng và minh họa. Ảnh dự phòng ghi rõ minh họa của Cosmos Explorer. Nguồn, tác giả, URL tải và hash ảnh nằm trong `data/image-manifest.json`.

## Kiểm tra từ thư mục dự án cha
```bash
rtk proxy node --check cosmos-explorer/app.js
rtk proxy node --check cosmos-explorer/scene.js
rtk proxy node --check cosmos-explorer/catalog.js
rtk proxy node --check cosmos-explorer/catalog-expanded.js
rtk proxy node --check cosmos-explorer/explorer-model.js
rtk proxy node --check cosmos-explorer/explorer-ui.js
rtk proxy node cosmos-explorer/tests/smoke.cjs
rtk proxy node scripts/validate_catalog.cjs
```

Smoke dùng DOM/Canvas giả; không thay thế trình duyệt. Browser QA tùy chọn `scripts/check_browser.cjs` dùng một bản Playwright cài ngoài repo và Chrome hệ thống, không phải phụ thuộc build/chạy của ứng dụng:
```bash
COSMOS_PLAYWRIGHT_MODULE=/duong/dan/playwright node scripts/check_browser.cjs
```

Đã kiểm tra Chrome thực ở 390, 820, 1440 px; xem kết quả và giới hạn ở `../docs/QA.md`. Chưa kiểm tra Firefox/Safari hoặc trình đọc màn hình thực. Một số đại lượng chưa chuẩn hóa hoặc chưa xác minh phương pháp được giữ ngoài biểu đồ và sắp xếp số.
