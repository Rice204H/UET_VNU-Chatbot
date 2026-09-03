# Đề Xuất Nâng Cấp Luồng Nghiệp Vụ (Flowchart) Của Chatbot

Để nâng cao trải nghiệm hội thoại (UX) và tối ưu độ phức tạp trong báo cáo môn học, dưới đây là các đề xuất nâng cấp **Flowchart / Sơ đồ hội thoại** của chatbot UET.

---

## 1. Rẽ Nhánh Điều Kiện Thông Minh (Conditional Branching)
### Hiện tại:
Luồng thu thập của mỗi phương thức là cố định (tuyến tính) từ đầu đến cuối.

### Đề xuất nâng cấp:
Tự động rẽ nhánh dựa trên giá trị dữ liệu mà người dùng cung cấp.
* **Ví dụ đối với phương thức IELTS:**
  * Nếu thí sinh nhập điểm `ielts_score >= 6.5`, chatbot sẽ hỏi xem thí sinh có muốn chuyển hướng sang diện **Xét tuyển thẳng kết hợp** (không cần thi môn Toán THPT) hay không.
  * Nếu chọn Có: Rẽ nhánh sang luồng Tuyển thẳng và yêu cầu nộp minh chứng ngay.
  * Nếu chọn Không hoặc điểm dưới 6.5: Tiếp tục yêu cầu nhập `math_score` để xét tuyển kết hợp thông thường.
* **Tự động đề xuất tổ hợp môn tối ưu cho phương thức THPTQG:**
  * Khi thí sinh nhập ngành đăng ký là `Khoa học máy tính (CN1)` và nhập khối thi, chatbot sẽ đối chiếu xem khối thi đó có nằm trong tổ hợp xét tuyển của ngành đó không (UET có ngành chỉ tuyển A00, A01 mà không tuyển D01). Nếu không khớp, bot sẽ cảnh báo rẽ nhánh để thí sinh thay đổi khối hoặc đổi ngành ngay lập tức thay vì đợi đến cuối form mới báo lỗi.

---

## 2. Cho Phép Sửa Đổi Thông Tin Linh Hoạt (Correction Step)
### Hiện tại:
Người dùng chỉ được sửa thông tin tại bước xác nhận cuối cùng (bằng cách nói *"Sửa số điện thoại"*). Nếu đang điền dở nửa chừng mà phát hiện sai sót, họ phải chọn *"Hủy bỏ"* và điền lại từ đầu.

### Đề xuất nâng cấp (In-flow Correction):
Cho phép người dùng sửa thông tin bất cứ lúc nào trong luồng điền form mà không làm đứt gãy luồng hiện tại.
* **Kịch bản hội thoại:**
  * **Bot:** "Vui lòng nhập số điện thoại của bạn."
  * **User:** "À, lúc nãy mình gõ sai tên, tên mình là Nguyễn Văn Nam chứ không phải Nguyễn Văn An."
  * **Bot:** "Đã cập nhật lại Họ tên của bạn là **Nguyễn Văn Nam**. Bây giờ, vui lòng cung cấp Số điện thoại của bạn:"
* **Cách triển khai:**
  * Sử dụng Rasa `action_extract_slot` hoặc kiểm tra intent sửa đổi thông tin trong hàm validate của Rasa Form. Nếu phát hiện user cố tình khai báo lại thông tin cũ, hệ thống sẽ gán slot cũ và giữ nguyên yêu cầu điền slot hiện tại.

---

## 3. Quản Lý Số Lần Nhập Sai (Smart Retry Counter)
### Hiện tại:
Nếu người dùng nhập sai định dạng (ví dụ: điểm thi THPTQG vượt quá 30), bot sẽ hỏi lại vô hạn lần.

### Đề xuất nâng cấp:
Thêm biến đếm số lần nhập sai (`retry_count`) cho các trường thông tin quan trọng.
* **Quy tắc:**
  * Nếu thí sinh nhập sai định dạng 1 hoặc 2 lần đầu: Bot nhắc nhở nhẹ nhàng kèm ví dụ (VD: *"Điểm phải là số từ 0 - 30"*).
  * Nếu nhập sai đến lần thứ 3: Bot nhận định thí sinh đang gặp khó khăn và tự động kích hoạt **luồng rẽ nhánh hỗ trợ** (VD: hiển thị nút kết nối trực tiếp với Fanpage Tuyển sinh của trường hoặc chuyển hướng cuộc trò chuyện tới tư vấn viên là người thật).

--- 

## 4. Cơ Chế Lưu Nháp Và Khôi Phục Phiên Hội Thoại (Session Save & Resume)
### Hiện tại:
Nếu người dùng tắt trình duyệt hoặc chọn hủy, toàn bộ thông tin nháp sẽ biến mất hoàn toàn.

### Đề xuất nâng cấp:
* Khi người dùng vô tình thoát ra khi đang điền form (hệ thống lưu slot tạm thời vào Redis/MongoDB).
* Ở lần hội thoại tiếp theo, ngay khi người dùng chào bot, chatbot sẽ kiểm tra trạng thái và đề xuất:
  > *"Chào Nam, hệ thống nhận thấy bạn đang điền dở hồ sơ xét tuyển HSA ngày hôm qua. Bạn có muốn tiếp tục điền nốt từ bước nhập Số báo danh không?"*
* Hiển thị nút *"Tiếp tục điền"* hoặc *"Bắt đầu lại từ đầu"*.

---

## 5. Đánh Giá Khả Năng Trúng Tuyển Tức Thì (Real-time Admission Predictor)
### Hiện tại:
Hồ sơ sau khi nộp chỉ lưu trữ điểm số thô vào cơ sở dữ liệu mà không có phản hồi định lượng về cơ hội đỗ của học sinh.

### Đề xuất nâng cấp:
Tích hợp một bước tính toán logic động ngay trong bước xác nhận của flowchart:
* **Logic xử lý:**
  * Lấy điểm chuẩn năm 2025 (`benchmark_2025`) của ngành tương ứng từ bảng `majors`.
  * So sánh với điểm thí sinh vừa nhập (`thptqg_score` hoặc `hsa_score`).
  * Tính toán mức chênh lệch và hiển thị thông báo phân loại:
    * **An toàn:** Điểm lớn hơn điểm chuẩn từ 1.0 trở lên.
    * **Cân bằng:** Điểm dao động xung quanh điểm chuẩn (+- 0.5).
    * **Rủi ro:** Điểm thấp hơn điểm chuẩn từ 1.0 trở lên.
* **Gợi ý nguyện vọng dự phòng:** Nếu kết quả thuộc nhóm "Rủi ro", chatbot sẽ đề xuất thêm 2-3 ngành khác có điểm chuẩn thấp hơn thuộc cùng nhóm ngành kỹ thuật tại UET để thí sinh cân nhắc bổ sung hồ sơ nguyện vọng 2.

---

## 6. Xử Lý Câu Hỏi Phức Tạp Bằng Đa Ý Định (Multi-intent Detection)
### Hiện tại:
Flowchart xử lý các ý định đơn lẻ. Nếu người dùng hỏi gộp: *"Cho mình biết học phí và điểm chuẩn của ngành Khoa học máy tính luôn nhé"*, chatbot có thể bị bối rối hoặc chỉ trả lời được một trong hai ý.

### Đề xuất nâng cấp:
Cấu hình Rasa hỗ trợ phân tách đa ý định (Multi-intent) dạng `hoi_hoc_phi+hoi_diem_chuan`.
* **Kịch bản hội thoại:**
  * **User:** "Học phí và điểm chuẩn ngành CN8 thế nào?"
  * **Bot:**
    * [Ý định 1 - Học phí]: "Học phí dự kiến ngành CN8 là 44 triệu VNĐ/năm."
    * [Ý định 2 - Điểm chuẩn]: "Điểm chuẩn năm 2025 của ngành này là 27.86 điểm."
* **Cách triển khai:**
  * Thêm cấu hình phân tách ý định trong `config.yml` bằng cách khai báo dấu cộng `+` làm bộ phân tách trong `Tokenizer`.
  * Viết một custom action chung xử lý đa ý định để phân phối phản hồi tuần tự.

