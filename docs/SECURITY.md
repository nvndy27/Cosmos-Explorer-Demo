# Bảo mật và vận hành an toàn

Cosmos Explorer là ứng dụng tĩnh không đăng nhập, không API key và không backend lưu dữ liệu người dùng. Threat model thực tế tập trung vào script injection từ query/hash URL, yêu cầu tới bên thứ ba ngoài ý muốn, nhúng trang vào frame/object và rò rỉ referrer. Nội dung catalog/ghi công là dữ liệu nội bộ được biên tập đáng tin cậy; một số luồng dùng `innerHTML`, không phải sanitizer HTML. Không nối dữ liệu API hoặc đầu vào người dùng vào các template đó.

`index.html` áp dụng CSP bằng meta để cùng bảo vệ `file://` và hosting static: tài nguyên cùng nguồn, không inline script, không `object`, không `base`, hạn chế kết nối, cho phép ảnh cục bộ/data. `style-src 'unsafe-inline'` được giữ do ứng dụng hiện đặt style inline động cho dữ liệu nội bộ và bố cục. Font Google đã bỏ; font fallback hệ thống giảm một bên thứ ba và request chứa thông tin truy cập. Nguồn khoa học HTTPS vẫn là liên kết điều hướng do người dùng chủ động mở.

## Giới hạn theo môi trường

- CSP meta có hiệu lực trong tài liệu static nhưng `frame-ancestors` bị trình duyệt bỏ qua trong meta. Cần gửi CSP HTTP header ở hosting để chặn framing.
- `file://` không nhận HTTP security headers; meta policy/referrer chỉ cung cấp phần trình duyệt hỗ trợ. HSTS chỉ có ý nghĩa trên HTTPS và cần thiết lập ở server/hosting.
- Ví dụ header trong `deployment/security-headers.conf` là cấu hình tham khảo; phải điều chỉnh đường dẫn/site và kiểm thử trên hosting đã chọn. Không có bằng chứng triển khai hoặc cấu hình TLS public.
- CSP không biến `innerHTML` hiện tại thành an toàn với dữ liệu không tin cậy; cần giữ catalog nội bộ được review.

Tham khảo: [W3C CSP Level 3](https://www.w3.org/TR/CSP3/) (đặc biệt giới hạn `frame-ancestors` trong meta), [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP), [GitHub private vulnerability reporting](https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/report-privately). Chỉ dùng kênh GitHub riêng tư nếu repository thực sự bật tính năng đó; trạng thái chưa được xác minh. Nếu không có, hỏi chủ repo qua kênh riêng đã biết, không công khai chi tiết khai thác.
