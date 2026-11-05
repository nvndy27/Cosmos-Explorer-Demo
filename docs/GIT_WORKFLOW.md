# Quy trình Git và GitHub

Áp dụng từ 2026-11-05. Repo: https://github.com/nvndy27/Cosmos-Explorer-Demo (private). Đọc cùng WORK_RULES.md; quy tắc này bổ sung quy trình remote, không thay cổng QA/khoa học.

## Issue là đầu vào công việc
Mỗi việc có issue với vấn đề, phạm vi file, người/lane phụ trách, phụ thuộc và tiêu chí nghiệm thu. Dùng ID backlog trong tiêu đề, ví dụ `[UX-002] ...`. Trạng thái: cần đầu vào → sẵn sàng → đang làm → chờ review → hoàn thành. GitHub issue mở chưa đồng nghĩa task được automation chạy: chỉ task `ready` trong automation/backlog.json mới được nhận. Trường `github_issue` liên kết hai nguồn. Issue manual cần người chịu trách nhiệm và đầu vào thật trước khi đổi trạng thái.

## Branch
- `main`: bản đã nghiệm thu. Sau lần push khởi tạo, mọi cập nhật remote main đi qua PR.
- Branch tác vụ: `<type>/<issue-number>-<slug>`; type gồm `feat`, `fix`, `docs`, `test`, `chore`, `data`.
- Ví dụ `feat/12-share-collection`, `fix/15-mobile-focus`, `chore/1-git-workflow`.
- Một branch cho một issue hoặc nhóm issue có cùng phạm vi; không dùng branch của người khác. Bắt đầu từ main mới nhất khi cây sạch. Mỗi worker dùng worktree riêng, không đổi branch trong checkout của worker khác.
- Coordinator tạo branch/tích hợp. Worker chỉ sửa phạm vi được giao và gửi báo cáo; không tự commit, merge hoặc push.

## Commit
Coordinator commit sau khi kiểm diff/phạm vi. Mỗi commit giải quyết một ý rõ; không gom đổi dữ liệu khoa học cùng sửa UI không liên quan.

Định dạng: `<type>(<scope>): <hành động cụ thể> (#<issue>)`. Scope có thể bỏ khi không cần. Ví dụ `fix(share): giữ query khi đổi hồ sơ (#15)`. Type: feat/fix/docs/test/chore/data. Body ghi lý do, kiểm tra thực chạy và giới hạn khi cần. Dùng `Refs #15` trong body để liên kết; dùng `Closes #15` trong PR chỉ khi mọi tiêu chí được nghiệm thu. Không sửa lại lịch sử đã push, không force push và không đưa token, auth, .env, log riêng hoặc runtime .automation vào Git. Chỉ stage file đã đọc diff; tránh git add . khi có nhiều worker.

## Pull request và merge
1. Push branch được giao; tạo PR có issue, kết quả, phạm vi và bằng chứng. PR Draft khi còn thiếu kiểm tra/review.
2. Chạy checks theo thay đổi. Sửa hành vi/UI/dữ liệu phải đạt scripts/check_all.py --browser ở môi trường Chrome đã ghi; docs/template chỉ kiểm diff, link và nội dung, không tuyên bố chạy lại app suite. Không hạ cổng để merge.
3. Hai AGY độc lập duyệt cùng SHA cuối; lưu JSON review và log cục bộ, đưa tóm tắt đã bỏ dữ liệu nhạy cảm vào PR. Đây là review tác nhân, không giả thành hai GitHub reviewer là người thật.
4. Có request_changes hoặc SHA đổi thì sửa và review lại. Coordinator xác nhận HEAD, trạng thái cây và phạm vi trước khi merge. Dùng merge commit để giữ commit đã duyệt; không rewrite SHA sau review.
5. Chỉ đóng issue khi acceptance đạt, review/gates có bằng chứng và PR đã merge. Issue manual giữ mở khi chưa có đầu vào. Đồng bộ backlog done sau merge; không đóng issue chỉ vì đã có kế hoạch.

Automation hiện fast-forward main cục bộ theo thiết kế cũ; không có bước tự push remote. Khi có lệnh push/phát hành riêng, coordinator đưa candidate lên branch và PR theo quy trình trên. Không cho timer tự push main. GitHub chưa bật branch protection/check bắt buộc trên server; các quy tắc hiện được áp dụng qua quy trình, không báo là đã cưỡng chế bằng GitHub.

## Phân công và phát hành
Codex điều phối quản lý Git/tích hợp; hai Codex worker nhận file riêng. AGY 1 rà logic/hồi quy; AGY 2 rà UX/tiếp cận/độ khớp bằng chứng. Bản cập nhật khoa học cần nguồn và người rà có chuyên môn theo DATA_POLICY.md. Merge Git không đồng nghĩa deploy web; public theo issue PUB-001 và RELEASE.md.
