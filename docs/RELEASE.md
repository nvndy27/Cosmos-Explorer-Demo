# Hướng dẫn đóng gói, phát hành và quay lui

Cập nhật: 2026-11-05. Ứng dụng hiện là website tĩnh ở `cosmos-explorer/`; chưa có bằng chứng phát hành công khai. Tài liệu này mô tả quy trình và lệnh kiểm tra, không xác nhận hosting hay URL thật đã được thử. Chỉ chủ dự án quyết định hosting, thời điểm phát hành và yêu cầu triển khai công khai riêng. Không tự động deploy.

## 1. Chuẩn bị ứng viên

1. Bắt đầu từ nhánh/commit được chủ dự án chọn. Kiểm tra `git status` và giữ thay đổi không liên quan ngoài gói.
2. Đọc hướng dẫn sản phẩm, dữ liệu và QA. Với thay đổi nội dung/ảnh, cập nhật snapshot có nguồn, ghi công và manifest; không sửa `catalog-expanded.js` trực tiếp.
3. Chạy các cổng bắt buộc từ gốc repository:

   ```sh
   rtk proxy python3 scripts/check_all.py
   rtk proxy python3 scripts/check_all.py --browser
   ```

   Lệnh đầu chạy kiểm tra cú pháp sáu tệp JS, smoke và `scripts/validate_catalog.cjs`. Lệnh `--browser` chạy thêm QA Chrome và kiểm tra ảnh ngoại hành tinh; cần Playwright/Chrome đã cấu hình như `docs/QA.md`. Nếu một lệnh lỗi hoặc không chạy được, ghi đúng lỗi và dừng cổng tương ứng. Smoke không thay QA trình duyệt. Trước bản public cần lưu bằng chứng browser tại 390, 820, 1440 px và kiểm tra tay bàn phím, reduced motion, ảnh lỗi, localStorage lỗi/cấm.

4. Đóng gói phần chạy được, không đưa `.git`, `.automation`, log, token hoặc cấu hình máy vào ZIP. Ví dụ tạo gói tại thư mục tạm ngoài repo (đặt phiên bản/ngày phù hợp):

   ```sh
   mkdir -p /tmp/cosmos-release
   rtk proxy zip -r /tmp/cosmos-release/cosmos-explorer-2.2-candidate.zip cosmos-explorer
   rtk proxy sha256sum /tmp/cosmos-release/cosmos-explorer-2.2-candidate.zip > /tmp/cosmos-release/cosmos-explorer-2.2-candidate.zip.sha256
   rtk proxy unzip -l /tmp/cosmos-release/cosmos-explorer-2.2-candidate.zip
   rtk proxy sha256sum -c /tmp/cosmos-release/cosmos-explorer-2.2-candidate.zip.sha256
   ```

   Lệnh gói cần chạy ở repository root. ZIP chứa thư mục `cosmos-explorer/` và toàn bộ ứng dụng, gồm `index.html`, JS/CSS, dữ liệu và ảnh cục bộ. Khi giải nén để host tại gốc site, tải nội dung bên trong `cosmos-explorer/` vào document root; để host dưới thư mục con, tải nội dung đó vào thư mục con đã chọn. Giữ ZIP và checksum bất biến, ghi commit nguồn, ngày, kết quả lệnh kiểm tra và người duyệt trong nhật ký phát hành của dự án. Không ghi đè gói cũ.

## 2. Kiểm tra gói trước khi đưa lên hosting

- Giải nén ZIP vào một thư mục kiểm tra sạch và xác nhận `index.html`, các tệp JS/CSS, `data/` và ảnh cục bộ có mặt. So checksum bằng file `.sha256` đã tạo; checksum chỉ xác nhận tính toàn vẹn so với file checksum tin cậy, không tự chứng minh nguồn gói.
- Mở `index.html` bằng `file://` để kiểm tra chế độ file/ngoại tuyến. Đây là context `file:` với quy tắc origin, quyền lưu trữ và tải tài nguyên riêng của trình duyệt; nó không mô phỏng máy chủ HTTP hoặc HTTPS.
- HTTPS là context web có origin và chính sách bảo mật riêng. Tài nguyên, điều hướng trực tiếp, storage và tải tệp có thể khác `file://`; phải kiểm tra bản được phục vụ qua HTTPS riêng. Không coi mở file thành công là bằng chứng HTTPS.
- Kiểm tra file ảnh theo `cosmos-explorer/data/image-manifest.json` và validator đã chạy. Không đổi ảnh, ghi công, nhãn quan sát/minh họa hay nguồn khi chỉ đóng gói.

## 3. Cấu hình hosting tĩnh

Hosting phải trả `index.html` khi truy cập thư mục gốc đã chọn, phục vụ JS/CSS/JSON/ảnh như tệp tĩnh và giữ nguyên cấu trúc tương đối của nội dung `cosmos-explorer/`. Không cần backend hay API key. Chọn thư mục gốc phù hợp với nền tảng; ví dụ nếu URL là `https://example.org/cosmos/`, `index.html` phải nằm ở thư mục `cosmos/` trên hosting. Không đặt tệp con vào một thư mục lồng thêm vô tình như `/cosmos/cosmos-explorer/`.

Các tham chiếu ứng dụng hiện là tương đối (ví dụ `styles.css`, `app.js`), vì vậy giữ chúng cạnh `index.html` và giữ cây thư mục con nguyên dạng. Không đổi asset path thành đường tuyệt đối `/...`: đường dẫn bắt đầu bằng `/` trỏ về gốc domain và thường hỏng khi deploy dưới `/cosmos/`. Không cấu hình rewrite mọi đường dẫn về ứng dụng nếu điều đó làm phản hồi sai cho tệp JS/CSS/ảnh. URL hồ sơ dùng fragment hash như `https://example.org/cosmos/#earth`; phần sau `#` không gửi lên máy chủ, nên hosting chỉ cần trả `index.html` cho đường dẫn `/cosmos/`. Thử mở trực tiếp một URL hash trong cửa sổ mới và tải lại trang.

Thiết lập HTTPS/TLS tại hosting trước khi công bố URL. Không nhúng bí mật vào mã phía trình duyệt. Nếu nền tảng có CDN/cache, chỉ purge cache theo hướng dẫn nhà cung cấp sau khi đã sẵn sàng và bảo đảm có thể phục hồi bản ổn định.

## 4. Kiểm tra HTTP/HTTPS trên URL thật

Sau khi chủ dự án đã yêu cầu phát hành và ứng viên đã được đưa lên hosting do họ chọn, kiểm tra từ client có mạng. Các ví dụ dưới đây là mẫu; thay `BASE` bằng URL thực, gồm đường dẫn con, và không xem chúng là kiểm tra đã chạy:

```sh
BASE='https://example.org/cosmos/'
rtk proxy curl -fsSIL "$BASE"
rtk proxy curl -fsS "$BASE" -o /dev/null
rtk proxy curl -fsSIL "${BASE}app.js"
rtk proxy curl -fsSIL "${BASE}styles.css"
```

Xác nhận trạng thái thành công, TLS hợp lệ, content type phù hợp và các tệp trả từ đúng URL con. Sau đó mở trình duyệt bằng HTTPS: tải trang, kiểm tra Console/Network không có lỗi tài nguyên hoặc JavaScript, chọn hồ sơ, tải lại URL `#<id>`, mở liên kết đó trong tab mới, kiểm tra ảnh/nguồn, localStorage và các kích thước 390/820/1440 px. HTTP (không mã hóa) chỉ dùng nếu cần chẩn đoán endpoint chuyển hướng; bản phát hành phải dùng HTTPS. Ghi URL, ngày/giờ, trình duyệt/thiết bị, commit/gói, kết quả và lỗi. QA URL thật và xác nhận chủ dự án là cổng trước public; không suy ra kết quả từ ví dụ lệnh.

## 5. Quay lui

Trước mỗi lần thay bản đang phục vụ, giữ gói ZIP + SHA-256 của bản ổn định trước đó, commit nguồn, nhật ký kiểm tra và thông tin phiên bản. Nếu hosting hỗ trợ versioned releases/deployments, giữ mỗi bản trong thư mục/phiên bản riêng và chuyển alias/document root về bản ổn định. Nếu chỉ có một thư mục tĩnh, tải lưu bản trước vào nơi an toàn, rồi khi cần thay thế toàn bộ cây ứng dụng bằng nội dung gói ổn định đã xác minh; tránh trộn tệp giữa hai phiên bản. Với CDN, purge/invalidate cache theo hướng dẫn hosting sau khi khôi phục để người dùng không tiếp tục nhận tệp mới lẫn cũ.

Chủ dự án quyết định và yêu cầu rollback public. Sau rollback, kiểm tra URL gốc và một hash link trên HTTPS, tài nguyên chính, Console/Network, rồi ghi thời điểm, nguyên nhân, gói được khôi phục, checksum và kết quả. Thực hành rollback trên hosting staging/test trước public là yêu cầu cần hoàn thành; tài liệu này không khẳng định việc đó đã diễn ra. Không xóa gói lỗi hoặc log điều tra cho đến khi sự cố được ghi nhận và xử lý.

## 6. Checklist chủ dự án trước khi công bố

- [ ] Chọn hosting, domain, đường dẫn triển khai và người phụ trách; yêu cầu riêng việc đưa lên public.
- [ ] Chốt commit/gói ứng viên; hai review và các cổng kiểm tra của quy trình tích hợp đã đạt trên cùng nội dung.
- [ ] Lưu ZIP bất biến, SHA-256, commit nguồn, log kiểm tra và nhật ký phát hành; xác minh gói giải nén được.
- [ ] Hoàn tất QA browser ở 390/820/1440 px, thao tác bàn phím/trình đọc màn hình trong phạm vi đã chọn, ảnh lỗi, reduced motion và localStorage bị lỗi/cấm.
- [ ] Kiểm tra bản HTTPS trên hosting thật: URL gốc, đường dẫn con, tài nguyên, hash link trực tiếp/tab mới/tải lại, ảnh, nguồn, Console/Network và cache.
- [ ] Thử quy trình rollback trên hosting đã chọn, xác minh trở lại URL cũ và ghi log. Giữ gói trước đó sẵn để phục hồi.
- [ ] Xác nhận chính sách HTTPS, ghi công/điều kiện sử dụng ảnh và trang thông tin/kênh báo lỗi cần thiết.
- [ ] Chủ dự án duyệt thời điểm công bố và tự xác nhận hoàn tất; không đánh dấu public-ready chỉ dựa trên tài liệu hoặc kiểm tra cục bộ.

Phạm vi còn cần con người/hosting thật: chọn nền tảng và cấu hình cụ thể, duyệt nội dung phát hành, thử HTTPS và đường dẫn con trên URL được chọn, diễn tập rollback, kiểm tra tiếp cận thủ công và quyết định public. Không có kết quả hosting thật nào được ghi nhận ở đây.
