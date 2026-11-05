# Kiểm chứng Cosmos Explorer 2.2

Ngày chạy: 2026-10-21. Không triển khai công khai.

## Đã đạt

- Cú pháp `app.js`, `scene.js`, `catalog.js`, `catalog-expanded.js`, `explorer-model.js`, `explorer-ui.js`.
- **14 nhóm smoke**: khởi động/count, nguồn, 138 hồ sơ và cảnh, tìm không dấu, lưu/lọc, định nghĩa so sánh/giá trị thiếu/giới hạn, bộ lọc và sắp xếp thư viện, giới hạn 4 mục, hồi quy Trái Đất nhỏ/ảnh bên phải, ID/ảnh cục bộ, tạm dừng, bộ nhớ hỏng/reduced motion, tab hồ sơ. Smoke dùng DOM/Canvas giả; phần lọc/đối chiếu có hàm thuần.
- `scripts/validate_catalog.cjs`: 138 ID duy nhất, đủ 30 hồ sơ mới (4 lùn/10 vệ tinh/16 ngoại hành tinh), không tính sao chủ; 126 hình ảnh có nguồn/tác giả/file/hash đúng; nguồn của từng đại lượng là URL hợp lệ. Kiểm tra này không tự chứng minh nội dung thiên văn chính xác.
- **Chrome headless thực**, Playwright cài bên ngoài repo: mở trực tiếp file://, không có lỗi JavaScript chưa xử lý trong các luồng kiểm tra.
- Thư viện 12 thẻ/trang, native image lazy; tìm “55 Cancri e”, “sao thuy”; loại/hệ/đã lưu/có ảnh; trạng thái rỗng và xóa lọc; bộ sưu tập TRAPPIST-1 đủ 7 hồ sơ; phân trang; sắp xếp số đúng phạm vi.
- So sánh từ 2 đến 4; mục thứ 5 bị chặn, bỏ chọn/thêm lại. Kiểm tra trực tiếp tỷ lệ width thanh = bán kính/max. Khác định nghĩa/đơn vị không có biểu đồ; khối lượng thiếu không thành 0.
- Bốn tab hồ sơ, nguồn, đọc rộng, Escape/focus. Kiểm tra bổ sung mobile đọc rộng, liên kết hồ sơ từ bộ sưu tập và focus thẻ sau khi lưu/chọn so sánh.
- Focus tab chế độ bằng mũi tên; focus hộp hướng dẫn và trả focus; skip link không đổi hash hồ sơ.
- Tất cả 126 hình ảnh giải mã được; toàn bộ 138 hồ sơ mở và hiển thị nội dung. Ảnh lỗi kiểm tra bằng đường dẫn file không tồn tại thật, cả hồ sơ lẫn thẻ: nhãn và tác giả dự phòng chính xác.
- Mục yêu thích cũ `earth`, `trappist`, `exo-hd-189733-b` vẫn nhận sau tải lại. localStorage hỏng không làm hỏng ứng dụng.
- Reduced motion và chuyển động dừng mặc định. Khung cảnh tĩnh không bị vẽ lại liên tục khi trạng thái không đổi; sơ đồ không vẽ khi đang ở thư viện/so sánh.
- Ba chế độ ở **390, 820, 1440 px**: chụp và xem hình kết quả, không tràn ngang trang; so sánh cuộn trong vùng riêng.
- Kiểm tra bổ sung chữ nhìn thấy trên mobile không nhỏ hơn 14 px.
- Điều hướng khi offline; **context mới hoàn toàn offline** vẫn mở file://, tải ảnh Titan và dùng thư viện. Không phụ thuộc cache mạng của lần mở trước.

## Bằng chứng

- [Báo cáo browser](qa/2.2/browser-report.json)
- [Sơ đồ 390](qa/2.2/diagram-390.png), [820](qa/2.2/diagram-820.png), [1440](qa/2.2/diagram-1440.png)
- [Thư viện 390](qa/2.2/library-390.png), [820](qa/2.2/library-820.png), [1440](qa/2.2/library-1440.png)
- [So sánh 390](qa/2.2/compare-390.png), [820](qa/2.2/compare-820.png), [1440](qa/2.2/compare-1440.png)
- [Đọc rộng mobile](qa/2.2/reading-mobile.png)

Ảnh full-page của thư viện có thể có thẻ ảnh chưa tải ở ngoài viewport vì native lazy loading; khi cuộn vào vùng nhìn ảnh được tải. Bộ kiểm tra riêng đã giải mã đủ 126 file.

## Chạy lại

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

Browser QA tùy chọn: dùng Chrome hệ thống và Playwright đã cài bên ngoài repo. Không thêm package.json hay phụ thuộc build/chạy ứng dụng. Chạy ở thư mục dự án gốc:

```bash
COSMOS_PLAYWRIGHT_MODULE=/duong/dan/playwright node scripts/check_browser.cjs
```

Có thể đặt `COSMOS_CHROME` cho đường dẫn Chrome. Script ghi bằng chứng kiểm tra vào /tmp.

## Chưa xác nhận / giới hạn

Chưa chạy Firefox/Safari hay trình đọc màn hình thực; chưa có pipeline browser CI và kiểm toán tiếp cận đầy đủ. Chưa có kiểm định biên tập thiên văn độc lập. Không tuyên bố tất cả số liệu cũ đã được chuẩn hóa để so sánh; các giá trị chưa đối chiếu được loại khỏi phép gộp và nêu phạm vi trên UI. Link nguồn ngoài có thể thay đổi.

## Kiểm tra bổ sung hình ngoại hành tinh

37/37 hồ sơ có hình cục bộ, 36 minh họa và 1 ảnh quan sát; 16 minh họa đại diện chung có nhãn riêng. Smoke bổ sung kiểm tra nhãn và bộ lọc ảnh quan sát (ngoại hành tinh chỉ Beta Pictoris b). Validator kiểm tra loại ảnh, ghi công khớp manifest và đủ 37 mục snapshot.

`check_exoplanet_images.cjs` chạy Chrome ở context mới offline/file://: giải mã và kiểm tra nhãn đủ 37 hình trong hồ sơ, Kepler trong thư viện ở 390/820/1440 px, không tràn trang, bộ lọc không nhầm minh họa thành quan sát, và ảnh minh họa lỗi chuyển về đồ họa dự phòng. [Báo cáo](qa/exoplanet-images/report.json), [Kepler desktop](qa/exoplanet-images/library-kepler-1440.png), [Kepler mobile](qa/exoplanet-images/kepler-390.png). Chạy lại bằng Playwright bên ngoài repo như browser QA, thay tên script bằng `scripts/check_exoplanet_images.cjs`.

Khôi phục thử file Kepler-22 b bị thiếu bằng `cache_images.py` từ manifest: tải lại/đổi định dạng và SHA-256 trùng hoàn toàn.
