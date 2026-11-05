# Roadmap sản phẩm và vận hành

Cập nhật: 2026-11-05. Mốc là thứ tự ưu tiên theo cổng nghiệm thu, không phải lời hứa thời gian. Lịch sử 2.0–2.2 nằm ở ROADMAP_HISTORY.md. Trạng thái hiện tại: bản 2.2 chạy tĩnh, chưa public; kiểm thử cũ ngày 2026-10-21 không thay cho nghiệm thu bản mới.

| Giai đoạn | Kết quả | Chủ trì | Cổng hoàn thành | Trạng thái |
|---|---|---|---|---|
| P0 — nền vận hành | Product, rule, backlog, Git, 3 Codex + 2 AGY, lịch chạy và báo cáo | Điều phối | Một đợt CLI thật có báo cáo; timer hoạt động; thất bại giữ thay đổi riêng | Đã đạt — service chạy thành công 2026-11-05 |
| P1 — sẵn sàng beta | QA HTTPS/file, đóng gói, hướng dẫn phát hành/quay lui, sửa lỗi chặn | Codex nền tảng + QA | Tests tự động đạt; QA browser 3 kích thước và kiểm tra tay được ghi | Đã có QA local/CI, SQLite/API local, CSP/quyền riêng tư, gói và hướng dẫn; còn QA thủ công/hosting HTTPS thật |
| P2 — trải nghiệm học | Liên kết chia sẻ, hướng dẫn người mới, luồng giáo viên và bộ sưu tập có mục tiêu học | Codex sản phẩm | 4/5 người thử hoàn thành 3 hành trình trong PRODUCT.md | Liên kết/hướng dẫn đã có; còn thử người dùng và đánh giá tiếp cận thủ công |
| P3 — public 1 | Hosting HTTPS, metadata, trang thông tin/ghi công, kênh báo lỗi | Chủ dự án + vận hành | Chủ dự án chọn hosting và yêu cầu deploy; kiểm tra URL thật, rollback đã thử | Chưa bắt đầu |
| P4 — duy trì | Triaging lỗi, rà nguồn, hiệu năng, tiếp cận, phát hành định kỳ | Cả đội | Báo cáo hàng tuần, không lỗi nghiêm trọng mở, bản phát hành có bằng chứng | Liên tục sau beta |
| P5 — mở rộng có căn cứ | Chuẩn hóa đại lượng còn thiếu, lộ trình học bổ sung | Biên tập + QA | Đọc nguồn gốc, review người có chuyên môn, kiểm tra provenance | Chưa bắt đầu |

## Ưu tiên và nhịp
P0: mất dữ liệu, XSS, sai khẳng định khoa học nghiêm trọng, trang không mở → chặn phát hành. P1: hỏng hành trình chính → sửa trước tính năng. P2: tiếp cận, tốc độ, nội dung thiếu. P3: mở rộng đẹp hơn. Chỉ kéo tối đa 3 tác vụ độc lập trong một đợt, một tác vụ mỗi Codex, hai AGY review sau tích hợp.

Mỗi ngày 09:00 giờ máy: baseline → lấy backlog đã duyệt → 3 worktree độc lập → kiểm quyền sửa → tích hợp trên nhánh ứng viên → kiểm tra → 2 AGY độc lập → kiểm tra lại → fast-forward cục bộ nếu sạch và được duyệt. Không tự deploy. Một tác vụ lỗi dừng cả đợt, giữ nhánh/log; không tự chạy lại vô hạn. Khi hết backlog chỉ kiểm tra sức khỏe, không tự bịa việc mới.

Mỗi tuần chủ dự án đọc báo cáo, thêm tác vụ đã duyệt, giải quyết tác vụ bị chặn và quyết định phát hành. Mỗi tháng rà nguồn/ảnh/quyền sử dụng; chỉ lập đề xuất nếu nguồn thay đổi, không tự thay số liệu. Sau mỗi đợt lỗi cần phân loại nguyên nhân trước khi đưa tác vụ về ready.

## Backlog thực thi
Nguồn máy đọc: automation/backlog.json. Mỗi việc có ID, tiêu chí quan sát được, đường dẫn được sửa, phụ thuộc và trạng thái. Trạng thái: ready → done chỉ sau tích hợp thành công; thất bại ghi ở .automation/state.json và bị giữ để tránh lặp tốn quota. Bỏ giữ sau khi sửa bằng lệnh retry trong AUTOMATION.md. Việc cần kiểm chứng con người để manual, không đưa ready trước khi đủ đầu vào.

## Để sau
Gaia 3D chỉ triển khai khi có phép biến đổi tọa độ được kiểm chứng, dữ liệu/sai số rõ và phương án hiệu năng. Tài khoản/đồng bộ chỉ triển khai nếu thử nghiệm cho thấy cần thiết; kiến trúc hiện tại đã phù hợp nhiều lượt truy cập độc lập.

## Bằng chứng thiết lập 2026-11-05

Đã hoàn thành OPS-001, QA-001, OPS-002, DOC-001, AUDIT-001, QA-002. Đợt service `20261105-120318-636625` chạy trọn 3 Codex → gates → 2 AGY approve → gates → fast-forward; systemd Result=success. Xem [báo cáo](qa/automation-2026-11-05.json). Backlog hiện hết việc ready; timer tiếp tục kiểm tra sức khỏe, chưa tự chạy các mục manual. UX-001/QA-005 (chia sẻ liên kết hồ sơ) đã đạt commit `010ec39fe9e00ff6c997d4c50424070370042cc4`, được hai AGY duyệt cùng commit và chạy toàn bộ cổng Chrome; xem [bằng chứng QA](QA.md). P2 vẫn chờ thử người thật và đánh giá tiếp cận thủ công. Chủ dự án bố trí các cổng thủ công và chọn hosting trước khi public.
