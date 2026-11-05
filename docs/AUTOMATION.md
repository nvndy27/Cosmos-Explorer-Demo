# Vận hành 3 Codex + 2 AGY

Cập nhật: 2026-11-05. Bộ điều phối: scripts/automation.py, Python chuẩn; lịch: systemd user trên máy này. Các CLI dùng đăng nhập hiện có, model theo cấu hình người dùng, không tự đổi model. Không cần giữ chat mở. Máy cần thức, phiên user cần hoạt động và tài khoản còn quota.

## Cách chạy và quan sát
```bash
rtk proxy python3 scripts/check_all.py --browser
rtk proxy python3 scripts/automation.py run
rtk proxy python3 scripts/automation.py status
rtk proxy systemctl --user status cosmos-explorer.timer
rtk proxy systemctl --user list-timers cosmos-explorer.timer
rtk proxy journalctl --user -u cosmos-explorer.service -n 60 --no-pager
```

Lịch 09:00 giờ máy (Asia/Ho_Chi_Minh); Persistent=true chạy bù lần bị bỏ lỡ khi phiên hoạt động lại. Không bật linger hay đổi cấu hình toàn máy. Một đợt tối đa 3 Codex song song, mỗi worker 900 giây, rồi 2 AGY song song tối đa 600 giây mỗi reviewer. Có baseline/browser và kiểm tra trước/sau review. Timeout cả service 45 phút, KillMode=control-group. Đây là giới hạn thời gian/lượt gọi, không phải trần token hay tiền; quota tuỳ tài khoản. Hết việc ready thì chỉ kiểm tra, không gọi AI.

## Dữ liệu vận hành
- automation/config.json: 2 AGY theo lựa chọn chủ dự án; có thể đổi agy_reviewers thành 1. Cổng browser bật mặc định.
- automation/backlog.json: chỉ việc ready, đủ phụ thuộc, không bị giữ; tối đa một việc mỗi lane codex-1/2/3. allowed_paths là danh sách file chính xác.
- .automation/latest.json: kết quả gần nhất. .automation/state.json: các tác vụ bị giữ.
- .automation/runs/<mốc>/report.json: base, commit, task, review, lỗi; cùng thư mục có log, prompt, báo cáo và worktree để điều tra. Không chứa trong gói sản phẩm.
- auto/<mốc>/codex-*: nhánh tác vụ; auto/<mốc>/candidate: nhánh tích hợp. main chỉ fast-forward sau hai review approve và toàn bộ gates đạt.

## Quy trình mỗi đợt
Khoá chống chồng → từ chối main bẩn/nhánh khác → baseline → chọn backlog → 3 CLI trong worktree riêng → kiểm phạm vi/không sửa Git history → commit cục bộ → cherry-pick ứng viên → đánh dấu task done trên ứng viên → gates → 2 AGY review cùng commit trong hai worktree chỉ đọc theo quy ước → gates lại → xác nhận main không đổi → fast-forward. Một tác vụ lỗi dừng cả đợt; các việc không bị tích hợp một phần. Review chỉ được chấp nhận nếu JSON hợp lệ, verdict=approve và issues rỗng.

AGY dùng --sandbox --mode plan, review trực tiếp diff/mã/log đính kèm và không gọi tool để tránh permission prompt trong headless; Codex dùng exec --sandbox workspace-write, không dùng cờ bypass. Worktree và kiểm phạm vi là biện pháp phối hợp/nghiệm thu, không phải cô lập bảo mật tuyệt đối khỏi tài khoản OS. Không giao nội dung không tin cậy hay tác vụ quyền rộng vào backlog. Theo [OpenAI Docs về non-interactive](https://learn.chatgpt.com/docs/non-interactive-mode), exec phù hợp script và cần đặt sandbox rõ. AGY adapter được đối chiếu với agy --help cục bộ.

## Sự cố, dừng và tiếp tục
```bash
rtk proxy systemctl --user disable --now cosmos-explorer.timer
rtk proxy systemctl --user stop cosmos-explorer.service
```
Dừng service sẽ chấm dứt nhóm tiến trình. Worktree/log được giữ. Kiểm tra không còn process trước khi chạy tay lại. Nếu mất điện trước report cuối, latest có status=running: đó là trạng thái chưa xác minh, không tự tuyên bố thất bại hay thành công; đọc log và kiểm process/nhánh.

Sau khi sửa nguyên nhân auth/quota/test/review, đọc báo cáo cũ rồi mở giữ từng việc:
```bash
rtk proxy python3 scripts/automation.py retry OPS-001
rtk proxy systemctl --user start cosmos-explorer.service
```
Không xoá trạng thái để retry hàng loạt khi chưa hiểu lỗi. Không tự nới sandbox/gate, sửa test cho qua hoặc tự deploy. Khi main có sửa tay hãy commit hợp lệ trước khi chạy. Mọi worker bị lỗi giữ file/nhánh; chỉ người vận hành dọn worktree sau khi xác nhận không còn tiến trình và không cần diff. Không tự xoá bằng force.

## Thêm việc và nâng cấp
Chủ dự án duyệt task với title, acceptance, lane, allowed_paths, depends_on, status. Không đưa hai task cùng file vào một đợt. Dữ liệu khoa học, AGENTS, automation và các gate được bảo vệ, cần thực hiện thủ công có review riêng. Những việc thử người thật/hosting/nguồn chưa đủ đầu vào để manual. Backlog không tự sinh vô hạn. Đọc báo cáo mỗi tuần và bổ sung việc từ nhu cầu/lỗi có thật.

Playwright cài ngoài repo, biến COSMOS_PLAYWRIGHT_MODULE trỏ tới module; COSMOS_CHROME trỏ Chrome. Cấu hình máy ở .automation/runtime.env (không chứa token). Đổi vị trí repo phải sửa WorkingDirectory/ExecStart trong unit và systemctl --user daemon-reload. Máy khác cần cài Python, Node, Git, RTK, Chrome, hai CLI và đăng nhập trước.

## Cài lại timer trên máy này
```bash
rtk proxy python3 scripts/install_automation.py --playwright-module /home/nguyenduy/.cache/cosmos-qa/node_modules/playwright --chrome /usr/bin/google-chrome --enable
```
Script tạo unit user và runtime.env, không cài phụ thuộc/đăng nhập hay bật quyền root. Không dùng --enable nếu chỉ muốn tạo unit để xem lại.

## Ngưỡng 10% cửa sổ 5 giờ và tự tiếp tục

Theo yêu cầu chủ dự án ngày 2026-11-05, `minimum_remaining_5h_percent=10`. Trước mỗi wave Codex, điều phối đọc trực tiếp `account/rateLimits/read` qua `codex app-server` stdio; nhận diện cửa sổ bằng `windowDurationMins=300`, không giả định primary luôn là 5 giờ. Nguồn giao thức: [OpenAI Docs — App Server](https://learn.chatgpt.com/docs/app-server). Không đọc/copy token đăng nhập, không gọi model để hỏi quota, không dùng reset credit hoặc mua thêm/đổi tài khoản.

Còn <=10%, tuần hết hạn mức, backend chặn hoặc không đọc được quota: không mở worker mới; trạng thái `waiting_quota` và các tác vụ ready được giữ, không đánh blocked vì quota. Các lượt đang chạy kết thúc ở checkpoint an toàn. Ngưỡng là cổng nhận việc; kiểm tra định kỳ, độ trễ máy chủ và nhiều CLI dùng chung tài khoản có thể khiến phần trăm thực tế thấp hơn 10%. Đây là phần trăm hạn mức tài khoản, không phải bộ đếm token chính xác của dự án.

`cosmos-quota.timer` gọi `quota_guard.py tick` mỗi 2 phút. Khi dữ liệu mới xác nhận còn >10%, watcher đối chiếu đúng handle, incarnation và thư mục của phiên Codex điều phối đã gắn trong `.automation/coordinator.json`; đợi phiên rảnh rồi gửi một prompt tiếp tục. Nếu phiên đang bận/không có hoặc pipeline đang giữ khóa .automation/lock, giữ yêu cầu và kiểm tra lại. Bộ gửi tiếp giữ cùng khóa trong lúc xác nhận và gửi để tránh đụng lượt chạy hằng ngày. Không đoán một terminal khác. Máy cần thức, phiên user và Orca/terminal điều phối cần còn hoạt động. Lịch 09:00 vẫn dùng worker exec riêng; watcher reset gửi vào phiên điều phối mở sẵn.

```bash
rtk proxy python3 scripts/quota_guard.py check
rtk proxy systemctl --user status cosmos-quota.timer
rtk proxy journalctl --user -u cosmos-quota.service -n 30 --no-pager
```

`check` trả 0 khi nhận thêm việc được; 75 khi cần chờ và lưu yêu cầu tiếp tục. `.automation/quota-state.json` chỉ lưu quota đã lọc, không có account ID/token/reset-credit ID. `retry_at` lấy từ mốc reset máy chủ cộng 30 giây; watcher vẫn đọc lại quota, không suy rằng đồng hồ qua mốc reset nghĩa là quota đã đầy.

Gửi prompt có trạng thái `resume_submitting` trước khi gửi, lưu receipt sau khi được nhận. Nếu mất kết nối/crash giữa lúc gửi và lưu receipt thì đánh `resume_needs_inspection`, không gửi trùng. Người điều phối đọc terminal để xác nhận kết quả trước khi xoá các cờ resume_needs_inspection/resume_submitting và khôi phục resume_pending nếu thực sự cần gửi lại. Đây là trường hợp chưa xác minh, không tự coi là prompt thất bại.

Tạm dừng việc tự gửi tiếp sau reset:
```bash
rtk proxy systemctl --user disable --now cosmos-quota.timer
rtk proxy systemctl --user stop cosmos-quota.service
```

Installer với --enable cài cả timer hằng ngày và timer quota. Khi khởi động lại Orca hoặc phiên điều phối, phải nhận diện lại terminal và cập nhật binding cục bộ theo inventory mới. Không tái sử dụng handle cũ sau restart.

## GitHub QA độc lập máy cá nhân
Workflow `.github/workflows/quality.yml` chạy khi PR, push main, thủ công và lịch 02:00 UTC (09:00 Việt Nam). Job có quyền contents:read, checkout không giữ credentials, timeout 20 phút, actions pin SHA và Playwright pin phiên bản ngoài repo. Job chạy check_all.py --browser: unittest gồm DB/API, smoke/catalog và browser security/privacy/personas. Không gọi model, không đăng nhập tài khoản cá nhân, không tự sửa dữ liệu hay deploy. Main remote được bảo vệ bằng PR + check product. Lịch GitHub có thể trễ theo tải hệ thống, không phải lịch thời gian thực bảo đảm.
