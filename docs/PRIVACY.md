# Quyền riêng tư

Ứng dụng không yêu cầu tài khoản, không gửi yêu thích lên máy chủ và không chủ động thu tên, email, định danh, vị trí hoặc dữ liệu sử dụng. Yêu thích lưu trong `localStorage` trên thiết bị/trình duyệt hiện tại; ai có quyền dùng cùng hồ sơ trình duyệt có thể xem dữ liệu đó. Chế độ `file://` phụ thuộc cách trình duyệt quản lý bộ nhớ cho file cục bộ.

Font ngoài Google đã được bỏ để tránh request tới nhà cung cấp font và truyền metadata kết nối khi tải trang. Ứng dụng vẫn chứa liên kết nguồn NASA/ESA/nghiên cứu. Chỉ khi người dùng mở liên kết, trình duyệt mới kết nối tới website đó; chính sách referrer đặt `strict-origin-when-cross-origin`, nên referrer không gửi phần path/query sang origin khác. Chính sách này không kiểm soát các thực hành ghi log của website nguồn.

## Xóa dữ liệu yêu thích

Để xóa một mục, mở hồ sơ và nhấn sao để bỏ lưu. Để xóa toàn bộ, mở **Hướng dẫn (?) → Xóa mục đã lưu trên thiết bị**, đọc xác nhận và chọn đồng ý. Thao tác chỉ xóa khóa yêu thích `cosmos_favorites` của Cosmos Explorer, giữ dữ liệu khác và lựa chọn so sánh. Hủy xác nhận sẽ giữ nguyên danh sách.

Nếu trình duyệt cấm thao tác bộ nhớ, ứng dụng xóa yêu thích trong phiên và báo không thể bảo đảm xóa dữ liệu lưu lâu dài. Khi đó dùng cài đặt trình duyệt để xóa dữ liệu site; với `file://`, cách quản lý bộ nhớ phụ thuộc trình duyệt. Không có dữ liệu tài khoản phía máy chủ cần xóa.

Không nhập thông tin bí mật vào ứng dụng hoặc gửi mật khẩu/token khi báo lỗi. Không có analytics hoặc form thu thông tin cá nhân được cài đặt trong bản hiện tại.

Đường dẫn `file://` được sao chép có thể chứa tên thư mục hoặc tên tài khoản hệ điều hành. Không gửi nguyên đường dẫn cá nhân như một URL website; chia sẻ gói ZIP và ID hồ sơ khi học ngoại tuyến.
