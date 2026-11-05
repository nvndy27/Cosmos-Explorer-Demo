# Cosmos Explorer — hợp đồng sản phẩm

Cập nhật: 2026-11-05. Chủ sản phẩm: chủ dự án; tác nhân đề xuất và triển khai, không thay người dùng xác nhận nhu cầu. Tên phiên bản hiện có: 2.2. Chưa phát hành công khai.

## Sản phẩm và người sử dụng
Web học thiên văn bằng tiếng Việt, giúp học sinh từ THCS, giáo viên và người yêu thiên văn tìm hiểu các thiên thể qua hồ sơ có nguồn, hình có ghi công và so sánh đúng nghĩa. Miễn phí, không cần tài khoản. Một website tĩnh có thể phục vụ nhiều người độc lập qua hosting/CDN; không cần backend chỉ để nhiều người truy cập. Mỗi người lưu yêu thích trên thiết bị riêng; chưa có đồng bộ hay cộng tác thời gian thực.

Ba hành trình chính:
1. Người mới mở trang trên điện thoại, tìm một thiên thể và đọc được nguồn trong 3 phút.
2. Học sinh chọn 2–4 đối tượng, hiểu vì sao một đại lượng được hoặc không được so sánh.
3. Giáo viên gửi liên kết hồ sơ/bộ sưu tập cho lớp; học sinh vẫn có bản tải về dùng ngoại tuyến.

## Lời hứa
- Nội dung tiếng Việt dễ hiểu, có giới hạn quan sát và ngày đối chiếu.
- 138 ID hiện tại cùng yêu thích/liên kết cũ được bảo toàn.
- Không buộc đăng nhập, không API key trên trình duyệt; không thu dữ liệu người dùng theo mặc định.
- Bản file:// tiếp tục hoạt động với nội dung/ảnh dự phòng; bản HTTPS phải được kiểm tra riêng.
- Sơ đồ là minh họa có nhãn. Dữ liệu đo, tái dựng và minh họa được phân biệt.

## Bản public đầu tiên phải có gì
| Năng lực | Tiêu chí nghiệm thu |
|---|---|
| Khám phá | Tìm không dấu, lọc, trạng thái rỗng và điều hướng dùng được bằng bàn phím |
| Học | Hồ sơ/nguồn/ảnh có ghi công; so sánh cùng định nghĩa và đơn vị |
| Chia sẻ | Mở link trực tiếp đến hồ sơ qua HTTPS và file://; ID lạ có dự phòng |
| Tin cậy | Smoke + validator + browser ở 390/820/1440; không lỗi JS trong luồng chính |
| Phân phối | Gói ZIP có manifest/hash, hướng dẫn hosting, quy trình quay lại bản trước |
| Tiếp cận | Kiểm tra thủ công bàn phím, trình đọc màn hình; ghi browser chưa hỗ trợ |
| Vận hành | Nhật ký phát hành, backlog, báo cáo automation, cách báo lỗi và quy tắc xử lý |

Các tiêu chí trên là đích đến, không phải tuyên bố đã đạt. Bằng chứng mới nhất ở docs/QA.md và .automation/runs/ trên máy.

## Thành công và kiểm chứng
Trước public: mời 5 người dùng thử (ít nhất 1 giáo viên, 2 người dùng điện thoại), mục tiêu ít nhất 4/5 hoàn thành tìm hồ sơ, mở nguồn và so sánh mà không cần trợ giúp; ghi thời gian, lỗi và sự đồng ý, không thu danh tính không cần thiết. Đây là mục tiêu, chưa có người thử. Chủ dự án quyết định tuyển người; automation không tự liên hệ.

Sau public: ưu tiên phản hồi tự nguyện và số lỗi; chỉ thêm analytics sau quyết định rõ của chủ dự án về quyền riêng tư. Mục tiêu hiệu năng đề xuất: LCP ≤2,5 giây và CLS ≤0,1 ở môi trường kiểm thử được ghi lại; không báo đạt từ cảm nhận. Mục tiêu tải đồng thời phải thử trên hosting thật trước khi hứa số người dùng.

## Ngoài phạm vi đợt này
Tài khoản, thanh toán, chat/cộng đồng, dữ liệu cá nhân trên server, API thiên văn thời gian thực, tự sửa số liệu theo API, Gaia 3D. Các mục này chỉ vào roadmap khi có nhu cầu và tiêu chí kiểm chứng riêng.
