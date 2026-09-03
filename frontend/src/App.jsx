import { useState, useEffect, useRef } from "react";
import "./styles.css";
import ChatWindow from "./components/ChatWindow.jsx";
import FlowchartVisualizer from "./components/FlowchartVisualizer.jsx";
import StudentPortal from "./components/StudentPortal.jsx";
import AspirationsList from "./components/AspirationsList.jsx";
import { useChat } from "./hooks/useChat.js";
import {
  Brain,
  Sparkles,
  CheckCircle2,
  BookOpen,
  User,
} from "lucide-react";

export default function App() {
  const {
    messages,
    isSending,
    apiStatus,
    error,
    newChat,
    startChat,
    sendText,
    sendPayload,
    slots,
    currentFlow,
    nextSlotToCollect,
    getSlotLabel,
    loggedInCandidate,
    logoutCandidate,
    candidateAspirations,
    authError,
    setAuthError,
    loginUser,
    registerUser,
    verifyAspiration,
    cancelAspiration,
  } = useChat();

  const [rightColTab, setRightColTab] = useState("flowchart"); // 'flowchart' | 'aspirations'
  const [prevAspirationsCount, setPrevAspirationsCount] = useState(0);
  const [showSubmissionCelebration, setShowSubmissionCelebration] = useState(false);
  const isInitialLoad = useRef(true); // bỏ qua lần fetch đầu tiên khi refresh

  // Tự động chuyển tab khi có nguyện vọng mới
  useEffect(() => {
    if (isInitialLoad.current) {
      // Lần đầu mount: cập nhật count nhưng không hiện toast
      isInitialLoad.current = false;
      setPrevAspirationsCount(candidateAspirations.length);
      return;
    }
    if (candidateAspirations.length > prevAspirationsCount && prevAspirationsCount >= 0) {
      if (candidateAspirations.length > 0) {
        setShowSubmissionCelebration(true);
        setTimeout(() => setShowSubmissionCelebration(false), 4000);
        setRightColTab("aspirations");
      }
    }
    setPrevAspirationsCount(candidateAspirations.length);
  }, [candidateAspirations.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Màn hình đăng nhập ────────────────────────────────────────────────────
  if (!loggedInCandidate) {
    return (
      <div className="guest-mode">
        <header className="hero flex-column align-center text-center" style={{ width: '100%', maxWidth: '480px', margin: '0 auto 24px', padding: '24px' }}>
          <div className="logo-icon-wrapper" style={{ margin: '0 auto 12px', background: 'var(--accent-light)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain className="logo-icon" size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <h1>UET Admissions</h1>
          <p className="subtitle" style={{ fontSize: '13px', marginTop: '4px' }}>
            Hệ thống tiếp nhận hồ sơ xét tuyển &amp; tư vấn tự động qua Rasa NLU
          </p>
        </header>

        <div className="guest-login-wrapper">
          <StudentPortal
            authError={authError}
            setAuthError={setAuthError}
            loginUser={loginUser}
            registerUser={registerUser}
          />
        </div>
      </div>
    );
  }

  // ── Màn hình chính ────────────────────────────────────────────────────────
  return (
    <div className="app">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow flex-align">
            <Sparkles size={14} className="icon-blue" />
            <span>Cổng Thông Tin Tuyển Sinh UET</span>
          </p>
          <h1>Cổng Tư Vấn &amp; Đăng Ký Tuyển Sinh UET</h1>
          <p className="subtitle">
            Hệ thống hỗ trợ tư vấn tuyển sinh và tiếp nhận hồ sơ nguyện vọng trực tuyến tự động qua Rasa NLU.
          </p>
        </div>
        <div className="header-actions flex-align" style={{ gap: '16px' }}>
          {loggedInCandidate && (
            <div className="system-status-card candidate-profile-header-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 'auto' }}>
              <div className="logo-icon-wrapper" style={{ background: 'var(--accent-light)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--ink)' }}>
                  {loggedInCandidate.fullname}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  {loggedInCandidate.email}
                </div>
              </div>
              <button
                onClick={logoutCandidate}
                className="logout-btn"
                style={{ marginLeft: '10px', padding: '6px 12px', fontSize: '11px' }}
              >
                Đăng xuất
              </button>
            </div>
          )}

          <div className="system-status-card">
            <div className="status-label">Trạng thái kết nối</div>
            <div className="status-value flex-align">
              <span className={`dot-online ${apiStatus === "offline" ? "offline" : ""}`} />
              <span>
                {`Rasa NLU Engine (${apiStatus === "online" ? "Trực tuyến" : "Ngoại tuyến/Lỗi"})`}
              </span>
            </div>
          </div>
        </div>
      </header>

      {showSubmissionCelebration && (
        <div className="celebration-toast flex-align">
          <CheckCircle2 size={18} className="text-green" />
          <div>
            <strong>Ghi nhận hồ sơ thành công!</strong>
            <p>Nguyện vọng đã được lưu vào cơ sở dữ liệu.</p>
          </div>
        </div>
      )}

      <main className="playground-grid">
        {/* MIDDLE COLUMN: Chat */}
        <section className="column middle-column">
          <ChatWindow
            messages={messages}
            onSend={sendText}
            onSendPayload={sendPayload}
            onLoadHistory={null}
            onNewChat={newChat}
            onStart={startChat}
            canLoadHistory={false}
            isHistoryLoading={false}
            isSending={isSending}
            error={error}
          />
        </section>

        {/* RIGHT COLUMN: Flowchart & Aspirations */}
        <section className="column right-column">
          <div className="right-column-tabs-header flex-align">
            <button
              className={`right-tab-btn ${rightColTab === "flowchart" ? "active" : ""}`}
              onClick={() => setRightColTab("flowchart")}
              type="button"
            >
              <Brain size={14} />
              <span>Tiến trình tuyển sinh</span>
            </button>
            <button
              className={`right-tab-btn ${rightColTab === "aspirations" ? "active" : ""}`}
              onClick={() => setRightColTab("aspirations")}
              type="button"
            >
              <BookOpen size={14} />
              <span>Nguyện vọng đã đặt</span>
              {candidateAspirations.length > 0 && (
                <span className="tab-badge">{candidateAspirations.length}</span>
              )}
            </button>
          </div>

          <div className="right-column-tab-content">
            {rightColTab === "flowchart" ? (
              <FlowchartVisualizer
                slots={slots}
                currentFlow={currentFlow}
                nextSlotToCollect={nextSlotToCollect}
                getSlotLabel={getSlotLabel}
              />
            ) : (
              <AspirationsList
                candidateAspirations={candidateAspirations}
                verifyAspiration={verifyAspiration}
                cancelAspiration={cancelAspiration}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
