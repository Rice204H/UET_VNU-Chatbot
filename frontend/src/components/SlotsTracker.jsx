import { CheckCircle2 } from "lucide-react";

export default function SlotsTracker({ slots, currentFlow, nextSlotToCollect, getSlotLabel }) {
  return (
    <div className="panel-card slots-card">
      <h2>Bộ Nhớ Agent (Slots Tracker)</h2>
      <p className="panel-desc">
        Trạng thái điền các thông tin trong hồ sơ của thí sinh ở phiên hội thoại hiện tại:
      </p>

      <div className="slots-status-bar">
        <div className="status-item">
          <span className="status-label">Luồng nghiệp vụ:</span>
          <span className={`flow-tag ${currentFlow || "none"}`}>
            {currentFlow ? currentFlow : "Không (Hội thoại tự do)"}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Đang yêu cầu:</span>
          <span className="expected-slot-tag">
            {nextSlotToCollect ? getSlotLabel(nextSlotToCollect) : "Không"}
          </span>
        </div>
      </div>

      <div className="slots-list">
        {Object.keys(slots).map((key) => {
          const isRelevant =
            !currentFlow ||
            (currentFlow === "THPTQG" &&
              ["fullname", "email", "phone_number", "chosen_major", "thptqg_block", "thptqg_score", "evidence_url"].includes(key)) ||
            (currentFlow === "HSA" &&
              ["fullname", "email", "phone_number", "chosen_major", "hsa_id", "hsa_score", "evidence_url"].includes(key)) ||
            (currentFlow === "IELTS" &&
              ["fullname", "email", "phone_number", "chosen_major", "ielts_score", "math_score", "evidence_url"].includes(key)) ||
            (currentFlow === "TUYEN_THANG" &&
              ["fullname", "email", "phone_number", "chosen_major", "award_name", "evidence_url"].includes(key));

          if (!isRelevant) return null;

          const isFilled = slots[key] !== null;
          const isExpected = nextSlotToCollect === key;

          return (
            <div
              key={key}
              className={`slot-row ${isFilled ? "filled" : ""} ${isExpected ? "expected" : ""}`}
            >
              <div className="slot-indicator">
                {isFilled ? (
                  <CheckCircle2 size={16} className="text-green" />
                ) : isExpected ? (
                  <span className="pulse-expected" />
                ) : (
                  <span className="dot-empty" />
                )}
              </div>
              <div className="slot-meta">
                <div className="slot-name">{getSlotLabel(key)}</div>
                <div className="slot-key">{key}</div>
              </div>
              <div className="slot-value">
                {isFilled ? (
                  key === "evidence_url" && slots[key].startsWith("http") ? (
                    <a href={slots[key]} target="_blank" rel="noopener noreferrer" className="link-text">
                      Xem URL ↗
                    </a>
                  ) : (
                    slots[key]
                  )
                ) : isExpected ? (
                  <span className="text-waiting">Đang chờ nhập...</span>
                ) : (
                  <span className="text-empty">-</span>
                )}
              </div>
            </div>
          );
        })}
        {currentFlow === null && (
          <div className="no-active-flow-msg">
            Bắt đầu quy trình Đăng ký nguyện vọng để theo dõi bộ nhớ điền hồ sơ (Slot Filling).
          </div>
        )}
      </div>
    </div>
  );
}
