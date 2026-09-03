import { useState, useCallback } from "react";
import ReplyButtons from "./ReplyButtons.jsx";
import { Brain, ChevronDown, ChevronRight } from "lucide-react";
import { parseEmojiText } from "../utils/emojiMapper.js";

// ─── Inline Markdown Parser ────────────────────────────────────────────────
// Hỗ trợ: **bold**, _italic_, `code`, đường kẻ ━━━, xuống dòng
function parseInlineMarkdown(text) {
  // Tách theo pattern: **...** | _..._ | `...`
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|_(.+?)_|`(.+?)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Phần text thường trước match
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    if (match[0].startsWith("**")) {
      parts.push({ type: "bold", value: match[2] });
    } else if (match[0].startsWith("_")) {
      parts.push({ type: "italic", value: match[3] });
    } else if (match[0].startsWith("`")) {
      parts.push({ type: "code", value: match[4] });
    }

    lastIndex = regex.lastIndex;
  }

  // Phần còn lại
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts;
}

function InlineText({ text }) {
  const { cleanedText, Icon } = parseEmojiText(text);
  const parts = parseInlineMarkdown(cleanedText);

  // Xác định màu sắc/class của icon dựa trên loại icon để có giao diện đẹp nhất
  let iconClass = "inline-icon";
  if (Icon) {
    const name = Icon.displayName || Icon.name || "";
    if (name.includes("Coins")) iconClass += " icon-green";
    else if (name.includes("BarChart") || name.includes("Alert")) iconClass += " icon-orange";
    else if (name.includes("Book") || name.includes("FileText")) iconClass += " icon-blue";
  }

  return (
    <span className="flex-align" style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap' }}>
      {Icon && <Icon size={15} className={iconClass} style={{ marginRight: '6px', flexShrink: 0 }} />}
      {parts.map((part, i) => {
        if (part.type === "bold")   return <strong key={i}>{part.value}</strong>;
        if (part.type === "italic") return <em key={i}>{part.value}</em>;
        if (part.type === "code")   return <code key={i} className="inline-code">{part.value}</code>;
        return <span key={i}>{part.value}</span>;
      })}
    </span>
  );
}


function renderLines(text) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const isLast = i === lines.length - 1;

    // Đường kẻ ━━━ hoặc ---
    if (/^[━─\-]{3,}$/.test(line.trim())) {
      return <hr key={i} className="msg-divider" />;
    }

    // Dòng trống → khoảng cách
    if (line.trim() === "") {
      return <div key={i} style={{ height: "6px" }} />;
    }

    // Bullet point •
    if (line.trimStart().startsWith("•") || line.trimStart().startsWith("-")) {
      const content = line.replace(/^[\s•\-]+/, "");
      return (
        <div key={i} className="msg-bullet" style={{ marginBottom: isLast ? 0 : "4px" }}>
          <span className="bullet-dot">•</span>
          <span><InlineText text={content} /></span>
        </div>
      );
    }

    return (
      <div key={i} className="msg-line" style={{ marginBottom: isLast ? 0 : "5px" }}>
        <InlineText text={line} />
      </div>
    );
  });
}
// ──────────────────────────────────────────────────────────────────────────

export default function MessageBubble({ message, onReply, buttonsDisabled }) {
  const [showThinking, setShowThinking] = useState(false);
  const isBot = message.from === "bot";
  const bubbleClass = message.from === "user" ? "message user" : "message bot";

  // Parse [CALL_ACTION: ...]
  let displayText = message.text || "";

  if (isBot && message.text && message.text.includes("[CALL_ACTION:")) {
    const parts = message.text.split(/\[CALL_ACTION:\s*(\w+)\]/i);
    if (parts.length >= 3) {
      displayText = parts[0].trim();
    }
  }

  return (
    <div className={`message-wrapper ${message.from}`}>
      {isBot && message.thinking && (
        <div className={`thinking-accordion ${showThinking ? "open" : ""}`}>
          <button
            type="button"
            className="thinking-toggle"
            onClick={() => setShowThinking(!showThinking)}
          >
            <Brain size={13} className="icon-orange" />
            <span>Quá trình tư duy của Agent</span>
            {showThinking ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {showThinking && (
            <div className="thinking-content">
              {message.thinking.split("\n").map((line, i) => (
                <div key={i} className="thinking-line">{line}</div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={bubbleClass}>
        <div className="message-content">
          {isBot ? renderLines(displayText) : <span>{displayText}</span>}
        </div>

        <ReplyButtons
          buttons={message.buttons}
          onReply={onReply}
          disabled={buttonsDisabled}
        />
      </div>
    </div>
  );
}
