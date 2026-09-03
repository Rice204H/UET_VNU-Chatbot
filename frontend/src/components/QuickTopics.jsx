import { parseEmojiText } from "../utils/emojiMapper.js";
import { Lightbulb } from "lucide-react";

export default function QuickTopics({ topics, onSelect, apiStatus, isSending, error }) {
  const statusLabel = {
    online: "Máy chủ kết nối tốt 🟢",
    offline: "Mất kết nối máy chủ 🔴",
    unknown: "Đang kiểm tra kết nối 🟡",
  }[apiStatus];

  const parsedStatus = parseEmojiText(statusLabel);

  return (
    <section className="panel">
      <div className="panel-card">
        <h2 className="flex-align">
          <Lightbulb size={20} className="icon-orange" />
          <span>Chủ đề quan tâm</span>
        </h2>
        <p className="muted">
          Chọn nhanh một câu hỏi gợi ý bên dưới để chatbot tư vấn thông tin ngay lập tức.
        </p>
        <div className="chips">
          {topics.map((topic) => {
            const { cleanedText, Icon } = parseEmojiText(topic);
            return (
              <button
                key={topic}
                className="chip flex-align"
                type="button"
                onClick={() => onSelect(topic)}
                disabled={isSending}
              >
                {Icon && <Icon size={15} />}
                <span>{cleanedText}</span>
              </button>
            );
          })}
        </div>

        <div className="status-line">
          <span className={`status-pill ${apiStatus} flex-align`}>
            {parsedStatus.Icon && (
              <parsedStatus.Icon
                size={14}
                className={apiStatus === "unknown" ? "spin" : ""}
              />
            )}
            <span>{parsedStatus.cleanedText}</span>
          </span>
          <span className="status-text">{isSending ? "Đang gửi tin..." : "Hệ thống sẵn sàng"}</span>
        </div>

        {error ? <div className="error-banner">{error}</div> : null}
      </div>
    </section>
  );
}
