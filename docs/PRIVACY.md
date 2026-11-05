# Quyền riêng tư

Ứng dụng không yêu cầu tài khoản, không gửi yêu thích lên máy chủ và không chủ động thu tên, email, định danh, vị trí hoặc dữ liệu sử dụng. Yêu thích lưu trong `localStorage` trên thiết bị/trình duyệt hiện tại; ai có quyền dùng cùng hồ sơ trình duyệt có thể xem dữ liệu đó. Chế độ `file://` phụ thuộc cách trình duyệt quản lý bộ nhớ cho file cục bộ.

Font ngoài Google đã được bỏ để tránh request tới nhà cung cấp font và truyền metadata kết nối khi tải trang. Ứng dụng vẫn chứa liên kết nguồn NASA/ESA/nghiên cứu. Chỉ khi người dùng mở liên kết, trình duyệt mới kết nối tới website đó; chính sách referrer đặt `strict-origin-when-cross-origin`, nên referrer không gửi phần path/query sang origin khác. Chính sách này không kiểm soát các thực hành ghi log của website nguồn.

## Xóa dữ liệu yêu thích

Ứng dụng hiện cho phép bật/tắt từng mục yêu thích bằng nút sao trong hồ sơ; không có nút xóa toàn bộ. Để xóa từng mục, mở hồ sơ đó và nhấn sao để bỏ lưu. Để xóa toàn bộ dữ liệu site, dùng cài đặt trình duyệt xóa dữ liệu trang web/site data cho origin đã dùng. Với `file://`, hành vi và vị trí lưu phụ thuộc trình duyệt; xóa dữ liệu trang/file liên quan trong cài đặt trình duyệt. Không có dữ liệu tài khoản phía máy chủ cần xóa.

Không nhập thông tin bí mật vào ứng dụng hoặc gửi mật khẩu/token khi báo lỗi. Không có analytics hoặc form thu thông tin cá nhân được cài đặt trong bản hiện tại.
