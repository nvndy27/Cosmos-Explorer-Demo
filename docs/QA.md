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

## Kiểm chứng vận hành mới — 2026-11-05

- Chạy lại cú pháp sáu JS, 14 nhóm smoke, validator 138 hồ sơ/126 hash ảnh; đạt.
- Thêm 7 unittest: phụ thuộc/tác vụ bị giữ, phạm vi bảo vệ, trùng quyền sửa file, JSON AGY/approval mâu thuẫn, tách cảnh báo stderr, timeout và kiểm thử gói từ phía người tải. Đạt trên bản tích hợp.
- Chrome thật qua `check_browser.cjs`, `check_exoplanet_images.cjs` và `check_http.cjs`: đạt ở 390/820/1440 px; file:// ngoại tuyến, giải mã ảnh/nhãn, ảnh lỗi, bàn phím theo script, giảm chuyển động, storage hỏng và HTTP localhost/hash link context mới. HTTP localhost không chứng minh hosting HTTPS.
- Đã xem ảnh sơ đồ 390, thư viện 820 và so sánh 1440 của lần chạy này. Các ảnh lazy ngoài viewport chưa tải trong full-page screenshot không được coi là ảnh lỗi; kiểm tra giải mã riêng đạt 126 ảnh.
- ZIP dựng hai lần cùng SHA-256, 146 entry checksum khớp, đủ 126 ảnh. Không thay dữ liệu khoa học hoặc giao diện ứng dụng trong đợt này.
- Service systemd thực hoàn tất với Result=success, hai AGY approve cùng commit `85e9e046cfceb986710c226640d2a1bdbcf668c6`, kiểm tra sau review đạt và main fast-forward. Timer đang enabled, lịch 09:00 Asia/Ho_Chi_Minh.

[Báo cáo bền trong repo](qa/automation-2026-11-05.json). Log/prompt/review chi tiết lưu cục bộ trong `.automation/runs/`; chúng không được đưa vào Git/gói phát hành. Script ảnh ngoại hành tinh hiện ghi vào thư mục tạm mới và dùng ngày chạy thật, giữ nguyên bằng chứng lịch sử trong docs/qa.

Chưa chạy lại Firefox/Safari hoặc trình đọc màn hình thực, chưa thử 5 người, HTTPS/hosting thật hay rollback public. Storage bị cấm hoàn toàn vẫn cần QA browser thủ công riêng; không đồng nhất với kiểm tra JSON storage hỏng. Hai AGY không thay kiểm định thiên văn chuyên gia.

## Bổ sung trong lượt làm việc bằng terminal mở sẵn — 2026-11-05

- `check_storage.cjs`: Chrome thật với init script tiêm DOMException SecurityError vào getter localStorage, getItem và setItem. Sáu context riêng (file:// ngoại tuyến và HTTP loopback × ba kiểu lỗi), reduced motion, chọn hồ sơ, tìm kiếm, lưu/bỏ lưu trong phiên, pageerror và tràn ngang 390/820/1440. Có probe xác nhận lỗi đã được tiêm. Đây là fault injection trong browser, không phải kiểm thử mọi cấu hình quyền riêng tư của Chrome.
- `check_http.cjs`: HTTP root, HTTP /cosmos/ và HTTPS /cosmos/ với chứng chỉ self-signed tạm; kiểm tra tải tài nguyên/MIME, hash Earth/Mars ở context mới, thư viện/tìm không dấu và ba viewport. Chỉ context HTTPS test bỏ qua lỗi chứng chỉ; không kết luận TLS trust hay hosting thật đã được kiểm chứng.
- `check_all.py --browser` nay chạy cả hai script; automation dùng một cổng tổng hợp, không chạy lặp HTTP riêng. Không sửa giao diện hay dữ liệu khoa học.
- `quota_guard.py` có kiểm thử ngưỡng 10%, xác định cửa sổ theo 300 phút, hạn mức tuần/backend chặn, dữ liệu lỗi, không tự suy refill theo đồng hồ, giữ khi coordinator bận và chống gửi lặp sau receipt không rõ. Đọc live qua App Server thành công; việc chờ reset thật sẽ do timer theo dõi khi chạm ngưỡng, chưa giả vờ rằng đã trải qua reset tự nhiên trong lượt này.

Bằng chứng chi tiết cục bộ: `.automation/live-20261105-storage-https/`; script browser ghi JSON và ảnh trong thư mục tạm được in trong log. Các giới hạn thử người thật, Firefox/Safari, trình đọc màn hình và hosting công khai ở trên vẫn còn.


## Chia sẻ liên kết hồ sơ — 2026-11-05

Đã tích hợp tại commit `010ec39fe9e00ff6c997d4c50424070370042cc4`. Nút **Sao chép liên kết hồ sơ** bảo toàn đường dẫn/query và ID hiện tại; trang mở không hash giữ URL gốc sạch, ID lạ về `#saturn`. Bản `file://` báo rõ đường dẫn chỉ cục bộ; thông báo chia sẻ không đẩy nội dung trang, tự ẩn sau 4,5 giây và được dọn khi đổi hồ sơ. Nút đạt cỡ chữ 14 px và vùng chạm cao 42 px tại 390/820/1440 px.

`check_share.cjs` đạt: Clipboard API trên localhost, chọn hồ sơ Earth rồi Mars, mở link ở context mới, ID lạ khi tải trang và đổi hash, Tab/Enter, query preservation, fallback `file://` với `execCommand` được intercept, thông báo copy lỗi, trạng thái tự hết hạn và không tràn ngang. Fallback file được kiểm tra bằng cách bắt lệnh copy trong trình duyệt; chưa xác nhận hành vi clipboard hệ điều hành trên Safari hoặc mọi cấu hình trình duyệt.

Toàn bộ `scripts/check_all.py --browser` đạt trên commit này: 18 unittest, 14 smoke, validator 138 hồ sơ/126 ảnh, các kiểm tra Chrome cũ, 6 ca localStorage SecurityError, HTTP root, HTTP/HTTPS loopback tại `/cosmos/`, và kiểm tra chia sẻ. Log chi tiết cục bộ: `.automation/live-20261105-ux-share/final-gates.log`; tóm tắt bền: [ux-share-2026-11-05.json](qa/ux-share-2026-11-05.json). Hai AGY đã approve cùng commit, không có issue.

HTTPS dùng chứng chỉ self-signed trên loopback, không xác minh TLS/hosting công khai. Chưa kiểm tra Firefox, Safari, trình đọc màn hình hoặc thử nghiệm người dùng thật; các cổng này vẫn chờ thực hiện thủ công.
