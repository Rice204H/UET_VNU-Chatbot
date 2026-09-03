import { CheckCircle2, Circle, AlertCircle, ArrowRight, CornerDownRight, HelpCircle, Lightbulb } from "lucide-react";

export default function FlowchartVisualizer({ slots, currentFlow, nextSlotToCollect, getSlotLabel }) {
  // Định nghĩa các bước cụ thể của từng luồng
  const flowSteps = {
    THPTQG: [
      { key: "fullname", label: "Họ và tên", desc: "Xác thực danh tính thí sinh" },
      { key: "phone_number", label: "Số điện thoại", desc: "Liên hệ khi cần thiết" },
      { key: "chosen_major", label: "Ngành đăng ký", desc: "Mã ngành tuyển sinh chính thức" },
      { key: "thptqg_block", label: "Khối xét tuyển", desc: "Tổ hợp xét tuyển (A00, A01...)" },
      { key: "thptqg_score", label: "Điểm thi THPTQG", desc: "Điểm số quy đổi từ tổ hợp" },
      { key: "has_ielts", label: "Chứng chỉ IELTS", desc: "Có chứng chỉ IELTS để cộng điểm?" },
      ...(slots.has_ielts === "Có" ? [
        { key: "ielts_score", label: "Điểm số IELTS", desc: "Điểm IELTS để tính điểm cộng" }
      ] : []),
      { key: "evidence_url", label: "Minh chứng điểm", desc: "Link ảnh/file bảng điểm & IELTS" },
      { key: "confirm_registration", label: "Xác nhận hồ sơ", desc: "Duyệt lại toàn bộ thông tin đăng ký" },
    ],
    HSA: [
      { key: "fullname", label: "Họ và tên", desc: "Xác thực danh tính thí sinh" },
      { key: "phone_number", label: "Số điện thoại", desc: "Liên hệ khi cần thiết" },
      { key: "chosen_major", label: "Ngành đăng ký", desc: "Mã ngành tuyển sinh chính thức" },
      { key: "hsa_id", label: "Số báo danh HSA", desc: "Số báo danh ĐGNL VNU" },
      { key: "hsa_score", label: "Điểm thi HSA", desc: "Điểm thi ĐGNL (từ 0 - 150)" },
      { key: "evidence_url", label: "Minh chứng điểm", desc: "Link ảnh giấy chứng nhận HSA" },
      { key: "confirm_registration", label: "Xác nhận hồ sơ", desc: "Duyệt lại toàn bộ thông tin đăng ký" },
    ],
    IELTS: [
      { key: "fullname", label: "Họ và tên", desc: "Xác thực danh tính thí sinh" },
      { key: "phone_number", label: "Số điện thoại", desc: "Liên hệ khi cần thiết" },
      { key: "chosen_major", label: "Ngành đăng ký", desc: "Mã ngành tuyển sinh chính thức" },
      { key: "ielts_score", label: "Điểm số IELTS", desc: "Chứng chỉ IELTS (5.5 - 9.0)" },
      { key: "math_score", label: "Điểm môn Toán", desc: "Điểm thi tốt nghiệp môn Toán" },
      { key: "evidence_url", label: "Minh chứng IELTS", desc: "Link ảnh/file chứng chỉ IELTS" },
      { key: "confirm_registration", label: "Xác nhận hồ sơ", desc: "Duyệt lại toàn bộ thông tin đăng ký" },
    ],
    TUYEN_THANG: [
      { key: "fullname", label: "Họ và tên", desc: "Xác thực danh tính thí sinh" },
      { key: "phone_number", label: "Số điện thoại", desc: "Liên hệ khi cần thiết" },
      { key: "chosen_major", label: "Ngành đăng ký", desc: "Mã ngành tuyển sinh chính thức" },
      { key: "award_name", label: "Tên giải thưởng", desc: "Giải HSG Quốc gia/Quốc tế..." },
      { key: "evidence_url", label: "Minh chứng giải", desc: "Link ảnh bằng khen/giấy chứng nhận" },
      { key: "confirm_registration", label: "Xác nhận hồ sơ", desc: "Duyệt lại toàn bộ thông tin đăng ký" },
    ],
  };

  const activeSteps = currentFlow ? flowSteps[currentFlow] : [];

  return (
    <div className="panel-card flowchart-card">
      <div className="flowchart-header">
        <h2>Sơ Đồ Nghiệp Vụ (Flowchart System)</h2>
        <div className="status-item flex-align">
          <span className="status-label">Trạng thái luồng:</span>
          <span className={`flow-tag ${currentFlow || "none"}`}>
            {currentFlow ? `Đang điền Form ${currentFlow}` : "Hội thoại tự do (Free-talk)"}
          </span>
        </div>
      </div>

      <div className="flowchart-body">
        {!currentFlow ? (
          /* HỘI THOẠI TỰ DO: Sơ đồ rẽ nhánh ban đầu */
          <div className="free-talk-flowchart">
            <div className="flow-node root-node active pulse">
              <div className="node-icon"><HelpCircle size={16} /></div>
              <div className="node-content">
                <strong>Bắt đầu / Hỏi đáp tự do</strong>
                <p>Bot tư vấn ngành học, học phí, điểm chuẩn...</p>
              </div>
            </div>

            <div className="flow-connector-vertical"></div>

            <div className="flow-node decision-node">
              <div className="node-icon"><HelpCircle size={16} /></div>
              <div className="node-content">
                <strong>Người dùng có nhu cầu Đăng ký xét tuyển?</strong>
                <p>Kích hoạt bằng các câu lệnh: "đăng ký học", "nộp hồ sơ"...</p>
              </div>
            </div>

            <div className="flow-branches">
              <div className="branch-line-container">
                <svg className="branch-lines-svg" viewBox="0 0 100 60" preserveAspectRatio="none">
                  <path d="M 50,0 Q 50,20 15,20 T 15,60" fill="none" stroke="var(--stroke)" strokeWidth="2" />
                  <path d="M 50,0 Q 50,20 38,20 T 38,60" fill="none" stroke="var(--stroke)" strokeWidth="2" />
                  <path d="M 50,0 Q 50,20 62,20 T 62,60" fill="none" stroke="var(--stroke)" strokeWidth="2" />
                  <path d="M 50,0 Q 50,20 85,20 T 85,60" fill="none" stroke="var(--stroke)" strokeWidth="2" />
                </svg>
              </div>

              <div className="branches-grid">
                <div className="branch-col">
                  <div className="branch-tag block">THPTQG</div>
                </div>
                <div className="branch-col">
                  <div className="branch-tag block">HSA</div>
                </div>
                <div className="branch-col">
                  <div className="branch-tag block">IELTS</div>
                </div>
                <div className="branch-col">
                  <div className="branch-tag block">Tuyển thẳng</div>
                </div>
              </div>
            </div>
            
            <p className="flowchart-tip flex-align" style={{ gap: '6px' }}>
              <Lightbulb size={15} className="icon-orange" style={{ flexShrink: 0 }} />
              <span>Hãy nhắn <strong>"Đăng ký nguyện vọng"</strong> để kích hoạt một trong các luồng xử lý tự động của hệ thống!</span>
            </p>
          </div>
        ) : (
          /* LUỒNG FORM ACTIVE: Sơ đồ điền hồ sơ tuần tự */
          <div className="active-steps-flowchart">
            <div className="flowchart-steps-list">
              {activeSteps.map((step, idx) => {
                const isFilled = slots[step.key] !== null;
                const isCurrent = nextSlotToCollect === step.key;
                const isUpcoming = !isFilled && !isCurrent;

                let nodeStatus = "upcoming";
                if (isFilled) nodeStatus = "completed";
                if (isCurrent) nodeStatus = "active";

                return (
                  <div key={step.key} className="flowchart-step-wrapper">
                    {/* SVG Connector line to next node */}
                    {idx < activeSteps.length - 1 && (
                      <div className={`step-connector ${isFilled ? "filled" : ""}`}></div>
                    )}

                    <div className={`flow-node step-node ${nodeStatus} ${isCurrent ? "pulse" : ""}`}>
                      <div className="node-icon">
                        {isFilled ? (
                          <CheckCircle2 size={16} className="icon-green" />
                        ) : isCurrent ? (
                          <Circle size={16} className="icon-orange" fill="var(--highlight-light)" />
                        ) : (
                          <Circle size={16} className="icon-muted" />
                        )}
                      </div>
                      
                      <div className="node-content">
                        <div className="node-header">
                          <span className="node-title">{step.label}</span>
                          <span className="node-key">{step.key}</span>
                        </div>
                        <p className="node-desc">{step.desc}</p>
                        
                        {isFilled && (
                          <div className="node-value-badge">
                            {step.key === "evidence_url" && slots[step.key].startsWith("http") ? (
                              <a href={slots[step.key]} target="_blank" rel="noopener noreferrer" className="value-link">
                                Xem minh chứng ↗
                              </a>
                            ) : (
                              slots[step.key]
                            )}
                          </div>
                        )}

                        {isCurrent && (
                          <span className="node-waiting-tag">Đang chờ thí sinh nhập...</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* End State Node */}
              <div className="flowchart-step-wrapper">
                <div className={`flow-node step-node end-node ${nextSlotToCollect === null ? "completed" : "upcoming"}`}>
                  <div className="node-icon">
                    {nextSlotToCollect === null ? (
                      <CheckCircle2 size={16} className="icon-green" />
                    ) : (
                      <Circle size={16} className="icon-muted" />
                    )}
                  </div>
                  <div className="node-content">
                    <strong>Hoàn tất &amp; Lưu Database</strong>
                    <p>Gọi [CALL_ACTION] lưu thông tin vào CSDL tuyển sinh.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
