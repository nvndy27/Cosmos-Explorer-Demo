# Hướng dẫn học sinh và giáo viên

Cosmos Explorer là thư viện thiên văn tiếng Việt với dữ liệu biên tập sẵn. Không cần tài khoản. Nội dung và ảnh cục bộ có thể dùng khi ngoại tuyến; các liên kết nguồn bên ngoài cần Internet. Ứng dụng chưa có URL công khai được xác nhận.

## Hành trình 1: Tìm và đọc một hồ sơ

1. Mở `cosmos-explorer/index.html` trong trình duyệt. Nếu nhận ZIP, trước hết giải nén toàn bộ gói rồi mở `index.html` bên trong thư mục `cosmos-explorer`; giữ nguyên các tệp và thư mục cạnh nó.
2. Tìm kiếm bằng hộp trên cùng, ví dụ `trai dat`, `sao thuy` hoặc `55 cancri`. Tìm kiếm bỏ dấu và nhận tên/bí danh tiếng Việt, tiếng Anh. Nhấn `/` để chuyển nhanh đến ô tìm kiếm, nhấn Enter để mở kết quả đầu tiên, hoặc dùng Tab tới nút kết quả rồi Enter để chọn.
3. Hoặc chọn **Thư viện**, nhập tên/bí danh và lọc theo phân loại, hệ, mục đã lưu hoặc **Có ảnh từ quan sát**. Mỗi trang hiển thị tối đa 12 thẻ. **Xóa bộ lọc** đưa các bộ lọc về mặc định.
4. Chọn thiên thể để đọc hồ sơ. Các tab **Tổng quan**, **Đặc điểm**, **Khám phá** và **Nguồn** lần lượt cho nội dung giới thiệu, đại lượng, giới hạn quan sát/nghiên cứu và liên kết tham khảo. Mở **Nguồn** hoặc chọn **Xem dữ liệu gốc** để xem trang nguồn; những liên kết này cần Internet.
5. Ảnh chi tiết nằm trong hồ sơ bên phải trên màn hình rộng, bên dưới sơ đồ trên điện thoại. Đọc chú thích và nhãn: ảnh quan sát đã xử lý, ảnh tái dựng và minh họa nghệ thuật là các loại tư liệu khác nhau. Ảnh minh họa không phải ảnh chụp bề mặt. Nếu ảnh không tải được, giao diện có hình dự phòng ghi là minh họa của Cosmos Explorer.

### Đọc sơ đồ đúng cách

Chọn **Sơ đồ** để xem khung minh họa và hồ sơ của đối tượng. Có thể chọn đối tượng ở danh sách bên trái hoặc trên sơ đồ nếu có điểm chọn. Kéo để dịch góc nhìn, cuộn hoặc dùng các nút `+`/`−` để thu phóng, nút đặt lại để trở về góc nhìn ban đầu. Nút **Khám phá tiếp** chuyển sang đối tượng khác. Chuyển động có thể tạm dừng bằng nút phát/tạm dừng.

Sơ đồ, vị trí, kích thước và chuyển động là minh họa; chúng không phải bản đồ 3D theo tỷ lệ hay vị trí thiên thể theo thời gian thực. Chọn Trái Đất không phóng nó thành quả cầu lớn ở giữa. Ảnh tư liệu chi tiết xem trong hồ sơ.

## Hành trình 2: So sánh 2–4 hồ sơ

1. Từ hồ sơ bấm **Thêm vào so sánh**; trong Thư viện, dùng nút so sánh trên thẻ; hoặc mở chế độ **So sánh**, chọn thiên thể và bấm **Thêm vào so sánh**.
2. Chọn ít nhất hai và tối đa bốn hồ sơ. Bấm vào tên đã chọn để bỏ một hồ sơ; **Xóa lựa chọn** xóa toàn bộ. Hồ sơ thứ năm không được thêm.
3. Đối chiếu bán kính, khối lượng và chu kỳ quỹ đạo. Bán kính chỉ có thanh tỷ lệ khi các giá trị có cùng định nghĩa và đơn vị; thanh là tỷ lệ tuyến tính, không biểu thị diện tích hay thể tích. Khối lượng và chu kỳ cũng chỉ được ghép khi tương thích.
4. Nếu thiếu dữ liệu, khác định nghĩa/đơn vị, là giới hạn hoặc là giá trị suy không phù hợp để gộp, giao diện nêu lý do và không vẽ biểu đồ chung. “Chưa có dữ liệu” nghĩa là chưa được tích hợp, đối chiếu trong bản này; không có nghĩa là giá trị bằng 0 hay chưa từng được nghiên cứu. Có thể mở nguồn từng đại lượng trong hồ sơ để kiểm tra.

## Hành trình 3: Lưu và chia sẻ với lớp

### Lưu trên thiết bị

Bấm biểu tượng ngôi sao `☆` trong hồ sơ để lưu; ngôi sao `★` cho biết mục đã lưu. Danh sách lưu chỉ nằm trong `localStorage` của trình duyệt trên thiết bị hiện tại, không đồng bộ lên máy chủ và không tự đi theo ZIP hay liên kết chia sẻ. Có thể lọc **Đã lưu** ở thanh bên hoặc trong Thư viện. Nếu trình duyệt chặn/xóa dữ liệu trang, danh sách đã lưu có thể không giữ được.

### Chia sẻ liên kết hồ sơ

Khi trang đã được đưa lên hosting HTTPS do trường/lớp chọn, mở hồ sơ rồi sao chép URL trên thanh địa chỉ. URL có dạng `https://<địa-chỉ-do-nơi-hosting-cấp>/<đường-dẫn>/#earth`; thay `earth` bằng ID hồ sơ muốn chia sẻ. Phần sau dấu `#` là mã hồ sơ, trang dùng mã đó để mở đúng mục khi tải hoặc tải lại. Đây là dạng minh họa, không phải địa chỉ công khai đang hoạt động. Người nhận cần truy cập được website qua HTTPS và có mạng để tải trang.

Khi mở từ máy cá nhân bằng `file://`, URL sẽ chứa đường dẫn cục bộ, ví dụ `file:///.../cosmos-explorer/index.html#earth`. Nó chỉ trỏ đến tệp trên máy của người gửi và thường không mở được trên máy người nhận. Không gửi đường dẫn cá nhân đó như thể là liên kết website. Để chia sẻ bản dùng ngoại tuyến, gửi ZIP ứng dụng riêng theo các bước dưới đây.

### Chuẩn bị ZIP để dùng ngoại tuyến

Người phụ trách gói bản phát hành có thể tạo ZIP theo `docs/RELEASE.md`; gói có thư mục `cosmos-explorer/`, cùng checksum để kiểm tra tính toàn vẹn. Khi nhận gói:

1. Giải nén ZIP vào một thư mục trên máy; không chỉ mở `index.html` bên trong trình xem ZIP.
2. Giữ nguyên toàn bộ thư mục và tệp, gồm CSS, JavaScript, dữ liệu và `assets/` ảnh.
3. Mở `cosmos-explorer/index.html` bằng trình duyệt. Nội dung và ảnh cục bộ vẫn dùng được ngoại tuyến. Liên kết nguồn khoa học và font tải từ Internet có thể không truy cập được; giao diện có font dự phòng.
4. Nếu có file checksum đi kèm, người phụ trách có thể xác minh ZIP theo hướng dẫn phát hành trước khi phân phối. Kiểm tra checksum xác nhận tệp khớp với checksum nhận được, không tự xác nhận nguồn gốc gói.

Mở bằng `file://` là cách dùng ngoại tuyến, nhưng không thay cho kiểm tra website HTTPS. Cấu hình và quyền lưu trữ trình duyệt có thể khác nhau; nội dung chính vẫn có thể đọc nếu yêu thích không lưu được.

## Kịch bản giáo viên 15 phút

**0–2 phút — Mở câu hỏi.** Mở hồ sơ Trái Đất bằng tìm kiếm không dấu `trai dat`. Hỏi lớp: đâu là dữ liệu hồ sơ, đâu là hình minh họa?

**2–6 phút — Đọc nguồn.** Cùng xem chú thích ảnh, tab **Đặc điểm** và **Nguồn**. Chọn một thông số, nêu đơn vị và mở trang tham khảo nếu có Internet. Nhắc học sinh phân biệt quan sát đã xử lý, tái dựng và minh họa.

**6–11 phút — Điều tra nhóm.** Mỗi nhóm tìm hai thiên thể khác nhau trong Thư viện, ví dụ một hành tinh và một ngoại hành tinh. Đọc hồ sơ, ghi lại đại lượng có nguồn và xem ứng dụng có cho phép so sánh hay giải thích vì sao chưa thể ghép biểu đồ.

**11–14 phút — Chia sẻ phát hiện.** Một nhóm thêm hai hồ sơ vào **So sánh** và trình bày điều gì có thể đối chiếu, điều gì còn thiếu hoặc khác định nghĩa. Cả lớp không diễn giải “chưa có dữ liệu” thành số 0 hay kết luận về sự sống.

**14–15 phút — Giao việc tiếp.** Gửi hash link HTTPS nếu lớp đã có website được host; nếu chưa, phân phối ZIP ngoại tuyến và hướng dẫn mỗi học sinh giải nén rồi mở `index.html`. Không gửi đường dẫn `file://` từ máy giáo viên.

## Báo lỗi hoặc góp ý

Hiện tài liệu dự án chưa xác nhận một kênh liên hệ công khai. Nếu đang dùng bản trong lớp, hãy báo cho giáo viên hoặc người phụ trách đã cung cấp bản đó, kèm tên nút/bước thao tác, thiết bị/trình duyệt và cách tái hiện lỗi. Có thể gửi ảnh chụp màn hình sau khi xem lại và che mọi thông tin cá nhân trước khi chia sẻ.

Không cần gửi tên thật, email, tài khoản, lịch sử duyệt web, danh sách yêu thích, đường dẫn `file://` đầy đủ, hay nội dung cá nhân khác. Đừng đính kèm dữ liệu cá nhân; chỉ mô tả điều đã xảy ra và kết quả mong đợi. Nếu không có người phụ trách để nhận báo lỗi, hiện chưa có địa chỉ hay biểu mẫu báo lỗi chính thức được xác nhận trong ứng dụng.
