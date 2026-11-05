# Roadmap

## Bản 2.0 — đã triển khai
- [x] Tách dữ liệu và nguồn khỏi logic giao diện.
- [x] Mở rộng từ 9 lên 21 hồ sơ, bổ sung tinh vân và hố đen.
- [x] Tra cứu NASA, NASA Exoplanet Archive, ESA Gaia DR3 và các bài báo liên quan.
- [x] Bổ sung hình minh họa hố đen, tinh vân và màu riêng cho các hành tinh.
- [x] Chế độ ảnh quan sát cho 4 mục, ghi công và giới hạn ảnh.
- [x] Nguồn cho thông số, nghiên cứu và ngày biên tập.
- [x] Giao diện responsive, tìm không dấu, lọc đã lưu và URL hồ sơ.
- [x] Xử lý ảnh lỗi, bộ nhớ hỏng, reduced motion, focus hộp thoại.
- [x] 10 nhóm kiểm tra hành vi bằng Node không cần dependency.

## Bản 2.1 — đã triển khai
- [x] 108 hồ sơ: 10 Hệ Mặt Trời, 10 sao, 21 ngoại hành tinh, 40 thiên hà, 13 cụm sao, 10 tinh vân, 2 hố đen, Ngân Hà và trường sâu Webb.
- [x] Sơ đồ Hệ Mặt Trời giữ tổng thể khi chọn Trái Đất; ảnh chi tiết chỉ ở hồ sơ bên phải/bên dưới.
- [x] 78 ảnh quan sát lưu cục bộ, bao gồm ảnh hành tinh, Mặt Trời, Proxima, Hubble/Messier, EHT và Webb.
- [x] Minh họa sao phát sáng có quầng và bề mặt hạt; hình dạng khác nhau cho cụm sao, thiên hà, tinh vân và hố đen.
- [x] Snapshot nguồn NASA và truy vấn PS, ghi công và hash ảnh để truy vết.
- [x] Kiểm tra Chrome thực ở 390, 820 và 1440 px; ảnh cục bộ, lỗi ảnh, bàn phím và reduced motion. Xem QA.md.
- [x] Mở trực tiếp bằng file://, không cần máy chủ.

## Kiểm chứng bổ sung
- [ ] Rà soát bằng trình đọc màn hình và Firefox/Safari thực.

## Bản 2.2 — hoàn thành
- [x] Kiểm kê 108 hồ sơ cũ và giữ nguyên ID/hash/yêu thích.
- [x] Thêm đúng 30 hồ sơ: 4 hành tinh lùn, 10 vệ tinh, 6 TRAPPIST-1, 10 ngoại hành tinh.
- [x] Nâng cấp 8 hành tinh; nguồn số liệu JPL với định nghĩa riêng.
- [x] Token giao diện, nội dung tối thiểu 14 px, dừng chuyển động mặc định.
- [x] Sơ đồ / Thư viện phân trang / So sánh 2–4 mục.
- [x] Bộ lọc, sắp xếp theo phạm vi tương thích, đếm và xóa lọc.
- [x] Bốn phần hồ sơ, đọc rộng và mobile, bốn bộ sưu tập có lời dẫn/liên kết.
- [x] 126 hình ảnh cục bộ, đủ 37 hồ sơ ngoại hành tinh; dự phòng có ghi nhãn/tác giả đúng.
- [x] 14 nhóm smoke; kiểm tra dữ liệu/manifest; Chrome thực ba kích thước và file:// offline.

## 2.3 — hướng tiếp theo, chưa triển khai
- Đối chiếu thêm khối lượng và chu kỳ vệ tinh, sai số và các nguồn đo bán kính ngoại hành tinh còn thiếu.
- Rà soát Firefox/Safari và trình đọc màn hình thực.
- Kiểm định biên tập thiên văn độc lập, lịch kiểm tra liên kết/nguồn.

## 3.0 — bản đồ đo đạc
- Tập con Gaia DR3 có source_id, parallax/error và proper motion; tách vị trí đo khỏi hiệu ứng nền.
- Chỉ thêm bản đồ 3D/WebGL sau khi có kiểm chứng phép biến đổi tọa độ và fallback hiệu năng.
- Giai đoạn 3.0 chưa được triển khai.
