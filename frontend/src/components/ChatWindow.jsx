import Composer from "./Composer.jsx";
import MessageList from "./MessageList.jsx";
import { MessageSquare, RefreshCw, History, Loader2 } from "lucide-react";

export default function ChatWindow({
  messages,
  onSend,
  onSendPayload,
  onLoadHistory,
  onNewChat,
  onStart,
  canLoadHistory,
  isHistoryLoading,
  isSending,
  error,
}) {
  const isEmpty = messages.length === 0;

  return (
    <section className="chat-card">
      <div className="chat-header">
        <div>
          <h3 className="flex-align">
            <MessageSquare size={18} className="icon-blue" />
            <span>Khung tư vấn trực tuyến</span>
          </h3>
          <p className="muted">Hệ thống hỗ trợ tự động 24/7 của Trường Đại học Công nghệ.</p>
        </div>
        <div className="header-actions">
          <button
            className="ghost-button flex-align"
            type="button"
            onClick={onNewChat}
            disabled={isSending}
          >
            <RefreshCw size={12} />
            <span>Lượt chat mới</span>
          </button>
          <button
            className="ghost-button flex-align"
            type="button"
            onClick={onLoadHistory}
            disabled={!canLoadHistory || isHistoryLoading || isSending}
          >
            {isHistoryLoading ? (
              <>
                <Loader2 size={12} className="spin" />
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                {/* <History size={12} />
                <span>Xem lịch sử</span> */}
              </>
            )}
          </button>
          <span className="badge flex-align">
            {isSending ? (
              <>
                <Loader2 size={12} className="spin" />
                <span>Đang gửi</span>
              </>
            ) : (
              <>
                <span className="dot-online" />
                <span>Trực tuyến</span>
              </>
            )}
          </span>
        </div>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <MessageList messages={messages} onReply={onSendPayload} isSending={isSending} />
      <Composer
        onSend={onSend}
        onStart={onStart}
        isSending={isSending}
        isEmpty={isEmpty}
      />
    </section>
  );
}
