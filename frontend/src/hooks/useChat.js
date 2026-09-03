import { useCallback, useEffect, useRef, useState } from "react";
import { createMessage, normalizeButtons } from "../utils/messages.js";
import { parseEmojiText } from "../utils/emojiMapper.js";

// Rasa-only chat hook — LLM và local simulator đã được loại bỏ

const INITIAL_SLOTS = {
  fullname: null,
  phone_number: null,
  chosen_major: null,
  thptqg_block: null,
  thptqg_score: null,
  evidence_url: null,
  hsa_id: null,
  hsa_score: null,
  ielts_score: null,
  ielts_evidence_url: null,
  math_score: null,
  award_name: null,
  has_ielts: null,
  confirm_registration: null,
};

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [rasaStatus, setRasaStatus] = useState("unknown");
  const [senderId, setSenderId] = useState(() => `user-${Math.floor(Math.random() * 1000000)}`);

  // Authentication states
  const [loggedInCandidate, setLoggedInCandidate] = useState(() => {
    const saved = localStorage.getItem("uet_candidate_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [candidateAspirations, setCandidateAspirations] = useState([]);
  const [authError, setAuthError] = useState("");

  // Conversation slot visualizer state
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [currentFlow, setCurrentFlow] = useState(null);
  const [nextSlotToCollect, setNextSlotToCollect] = useState(null);

  // ─── Rasa health monitor ──────────────────────────────────────────────────
  useEffect(() => {
    fetch("http://localhost:5005/")
      .then(() => setRasaStatus("online"))
      .catch(() => setRasaStatus("offline"));
  }, []);

  // ─── Load lịch sử hội thoại từ Rasa tracker (Redis) ─────────────────
  const loadConversationFromTracker = useCallback(async (currentSenderId) => {
    try {
      const resp = await fetch(`http://localhost:5005/conversations/${currentSenderId}/tracker`);
      if (!resp.ok) {
        newChat();
        return;
      }
      const tracker = await resp.json();
      const events = tracker?.events || [];

      // Parse events thành messages
      const reconstructed = [];
      for (const ev of events) {
        if (ev.event === "user" && ev.text && !ev.text.startsWith("/")) {
          reconstructed.push(createMessage({ from: "user", text: ev.text, timestamp: ev.timestamp ? new Date(ev.timestamp * 1000).toISOString() : undefined }));
        } else if (ev.event === "bot" && (ev.text || ev.data?.buttons?.length > 0)) {
          const buttons = normalizeButtons(ev.data?.buttons || []);
          reconstructed.push(createMessage({ from: "bot", text: ev.text || "", buttons, timestamp: ev.timestamp ? new Date(ev.timestamp * 1000).toISOString() : undefined }));
        }
      }

      if (reconstructed.length === 0) {
        newChat();
        return;
      }

      // Khôi phục slots và flow từ tracker
      const trackerSlots = tracker?.slots || {};
      const activeLoopName = tracker?.active_loop?.name;
      const updatedSlots = { ...INITIAL_SLOTS };
      Object.keys(INITIAL_SLOTS).forEach((key) => {
        if (trackerSlots[key] !== undefined && trackerSlots[key] !== null) {
          updatedSlots[key] = trackerSlots[key];
        }
      });
      setSlots(updatedSlots);

      let flow = null;
      if (activeLoopName === "thptqg_form") flow = "THPTQG";
      else if (activeLoopName === "hsa_form") flow = "HSA";
      else if (activeLoopName === "ielts_form") flow = "IELTS";
      else if (activeLoopName === "direct_form") flow = "TUYEN_THANG";
      setCurrentFlow(flow);
      setNextSlotToCollect(trackerSlots["requested_slot"] || null);

      setMessages(reconstructed);
    } catch (e) {
      console.warn("Failed to load tracker from Redis:", e);
      newChat();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Xóa chat khi user thay đổi (login / logout / switch account) ───────
  const prevUserEmailRef = useRef(loggedInCandidate?.email ?? null);
  useEffect(() => {
    const currEmail = loggedInCandidate?.email ?? null;
    if (prevUserEmailRef.current === currEmail) return;
    prevUserEmailRef.current = currEmail;
    if (currEmail) {
      // Đăng nhập: load lịch sử từ Rasa tracker Redis
      loadConversationFromTracker(currEmail);
    } else {
      // Đăng xuất: bắt đầu phiên mới
      newChat();
    }
  }, [loggedInCandidate?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Helper: get sender id ────────────────────────────────────────────────
  const getSenderId = useCallback(() => {
    if (loggedInCandidate && loggedInCandidate.email) {
      return loggedInCandidate.email;
    }
    return senderId;
  }, [senderId, loggedInCandidate]);

  // ─── Aspirations ─────────────────────────────────────────────────────────
  const fetchAspirations = useCallback(async (email) => {
    try {
      const resp = await fetch(`http://localhost:5006/api/aspirations?email=${encodeURIComponent(email)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.status === "success") {
          setCandidateAspirations(data.aspirations || []);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch aspirations:", e);
    }
  }, []);

  useEffect(() => {
    if (loggedInCandidate && loggedInCandidate.email) {
      fetchAspirations(loggedInCandidate.email);
    } else {
      setCandidateAspirations([]);
    }
  }, [loggedInCandidate, fetchAspirations]);

  // ─── Authentication ───────────────────────────────────────────────────────
  const loginUser = useCallback(async (email, password) => {
    setAuthError("");
    try {
      const resp = await fetch("http://localhost:5006/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await resp.json();
      if (resp.ok && data.status === "success") {
        const userObj = { ...data.user };
        setLoggedInCandidate(userObj);
        localStorage.setItem("uet_candidate_user", JSON.stringify(userObj));
        setCandidateAspirations(data.aspirations || []);
      } else {
        setAuthError(data.message || "Đăng nhập thất bại");
      }
    } catch (e) {
      setAuthError("Không thể kết nối đến máy chủ xác thực.");
    }
  }, []);

  const registerUser = useCallback(async (email, fullname, password) => {
    setAuthError("");
    try {
      const resp = await fetch("http://localhost:5006/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullname, password }),
      });
      const data = await resp.json();
      if (resp.ok && data.status === "success") {
        const userObj = { ...data.user };
        setLoggedInCandidate(userObj);
        localStorage.setItem("uet_candidate_user", JSON.stringify(userObj));
        setCandidateAspirations([]);
      } else {
        setAuthError(data.message || "Đăng ký thất bại");
      }
    } catch (e) {
      setAuthError("Không thể kết nối đến máy chủ xác thực.");
    }
  }, []);

  const logoutCandidate = useCallback(() => {
    setLoggedInCandidate(null);
    setCandidateAspirations([]);
    setAuthError("");
    localStorage.removeItem("uet_candidate_user");
  }, []);

  // ─── Aspiration actions ───────────────────────────────────────────────────
  const verifyAspiration = useCallback(async (candidateId) => {
    try {
      const resp = await fetch("http://localhost:5006/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: candidateId }),
      });
      if (resp.ok) {
        setCandidateAspirations((prev) =>
          prev.map((asp) => (asp.id === candidateId ? { ...asp, is_verified: true } : asp))
        );
      }
    } catch (e) {
      console.warn("Failed to verify aspiration:", e);
    }
  }, []);

  const cancelAspiration = useCallback(async (candidateId) => {
    try {
      const resp = await fetch("http://localhost:5006/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: candidateId }),
      });
      if (resp.ok) {
        setCandidateAspirations((prev) =>
          prev.filter((asp) => asp.id !== candidateId)
        );
      }
    } catch (e) {
      console.warn("Failed to cancel aspiration:", e);
    }
  }, []);

  // ─── Slot label helpers ───────────────────────────────────────────────────
  const getSlotLabel = (name) => {
    const labels = {
      fullname: "Họ và tên",
      phone_number: "Số điện thoại",
      chosen_major: "Ngành đăng ký",
      thptqg_block: "Khối thi / Tổ hợp môn",
      thptqg_score: "Tổng điểm thi THPTQG",
      evidence_url: "Đường dẫn minh chứng học bạ/điểm thi",
      hsa_id: "Số báo danh HSA",
      hsa_score: "Điểm thi HSA",
      ielts_score: "Điểm chứng chỉ IELTS",
      ielts_evidence_url: "Minh chứng IELTS",
      math_score: "Điểm môn Toán kết hợp",
      award_name: "Tên giải thưởng đạt được",
      has_ielts: "Có chứng chỉ IELTS",
      confirm_registration: "Xác nhận hồ sơ",
    };
    return labels[name] || name;
  };

  // ─── New chat / reset ─────────────────────────────────────────────────────
  const newChat = useCallback(() => {
    const currentActiveId = getSenderId();

    setMessages([]);
    setSlots(INITIAL_SLOTS);
    setCurrentFlow(null);
    setNextSlotToCollect(null);
    setError("");

    // Gửi /restart để xóa tracker Rasa phía server
    fetch(`http://localhost:5005/conversations/${currentActiveId}/tracker/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "restart" }),
    }).catch((err) => console.warn("Failed to restart Rasa tracker:", err));

    // Tin nhắn chào mừng
    const botMsg = createMessage({
      from: "bot",
      text: "Xin chào! Mình là Trợ lý ảo Tuyển sinh và Nhập học chính thức của Trường Đại học Công nghệ - ĐHQGHN (UET-VNU). Mình có thể tư vấn thông tin các ngành học hoặc hướng dẫn bạn đăng ký nguyện vọng trực tuyến. Bạn cần mình hỗ trợ gì hôm nay?",
      buttons: [
        { title: "Tư vấn ngành học 📚", payload: "/hoi_thong_tin_nganh" },
        { title: "Đăng ký nguyện vọng 📝", payload: "/dang_ky_nguyen_vong" },
      ],
    });
    setMessages([botMsg]);
  }, [getSenderId]);

  const startChat = useCallback(() => {
    newChat();
  }, [newChat]);

  // Boot on mount: load từ Rasa tracker Redis theo sender_id
  useEffect(() => {
    const currentSenderId = getSenderId();
    loadConversationFromTracker(currentSenderId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Rasa API call ────────────────────────────────────────────────────────
  const runRasaAPI = async (userText, payloadValue) => {
    const currentSenderId = getSenderId();
    const outgoingMessage = payloadValue || userText || "";

    const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: currentSenderId,
        message: outgoingMessage,
      }),
    });

    if (!response.ok) {
      throw new Error("Không thể kết nối đến Rasa NLU Server. Vui lòng kiểm tra lại tiến trình Rasa.");
    }

    const rasaMessages = await response.json();
    const textParts = rasaMessages.map((m) => m?.text).filter(Boolean);
    const cleanText = textParts.join("\n") || "";
    const rawButtons = rasaMessages.find((m) => Array.isArray(m?.buttons) && m.buttons.length > 0)?.buttons || [];
    const buttons = normalizeButtons(rawButtons);

    // Đồng bộ slots từ Rasa tracker
    try {
      const trackerResp = await fetch(`http://localhost:5005/conversations/${currentSenderId}/tracker`);
      if (trackerResp.ok) {
        const tracker = await trackerResp.json();
        const trackerSlots = tracker?.slots || {};
        const activeLoopName = tracker?.active_loop?.name;

        const updatedSlots = { ...INITIAL_SLOTS };
        Object.keys(INITIAL_SLOTS).forEach((key) => {
          if (trackerSlots[key] !== undefined && trackerSlots[key] !== null) {
            updatedSlots[key] = trackerSlots[key];
          }
        });
        setSlots(updatedSlots);

        let flow = null;
        if (activeLoopName === "thptqg_form") flow = "THPTQG";
        else if (activeLoopName === "hsa_form") flow = "HSA";
        else if (activeLoopName === "ielts_form") flow = "IELTS";
        else if (activeLoopName === "direct_form") flow = "TUYEN_THANG";
        setCurrentFlow(flow);

        setNextSlotToCollect(trackerSlots["requested_slot"] || null);
      }
    } catch (trackerErr) {
      console.warn("Failed to sync slots with Rasa tracker:", trackerErr);
    }

    return {
      text: cleanText,
      buttons,
      thinking: "Gửi thông tin đến Rasa NLU Server. Nhận diện phản hồi từ Custom Action Server.",
    };
  };

  // ─── Send message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async ({ text, payloadValue }) => {
      const trimmed = (text || "").trim();
      if (!trimmed || isSending) return;

      setIsSending(true);
      setError("");

      const userMsg = createMessage({ from: "user", text: trimmed });
      setMessages((prev) => [...prev, userMsg]);

      await new Promise((resolve) => setTimeout(resolve, 600));

      try {
        const botResponse = await runRasaAPI(trimmed, payloadValue);

        const botMsg = createMessage({
          from: "bot",
          text: botResponse.text,
          buttons: botResponse.buttons,
          thinking: botResponse.thinking,
        });

        setMessages((prev) => [...prev, botMsg]);

        // Sau khi nhận phản hồi, cập nhật nguyện vọng nếu cần
        if (loggedInCandidate && loggedInCandidate.email) {
          setTimeout(() => {
            fetchAspirations(loggedInCandidate.email);
          }, 1500);
        }
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi kết nối Rasa.");
        setMessages((prev) => [
          ...prev,
          createMessage({
            from: "bot",
            text: `⚠️ Lỗi: ${err.message || "Không thể kết nối. Vui lòng kiểm tra tiến trình Rasa tại cổng 5005."}`,
            thinking: "Gặp sự cố khi kết nối Rasa NLU Server.",
          }),
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [isSending, loggedInCandidate, fetchAspirations, getSenderId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const sendText = useCallback(
    (text) => sendMessage({ text, payloadValue: null }),
    [sendMessage]
  );

  const sendPayload = useCallback(
    (button) => {
      if (!button) return;
      // Strip emoji khỏi title trước khi hiển thị trong chat bubble phía user
      const { cleanedText } = parseEmojiText(button.title || "");
      sendMessage({
        text: cleanedText || button.title || "Select",
        payloadValue: button.payload || null,
      });
    },
    [sendMessage]
  );

  // ─── Return ───────────────────────────────────────────────────────────────
  return {
    messages,
    isSending,
    apiStatus: rasaStatus,
    error,
    newChat,
    startChat,
    sendText,
    sendPayload,

    // Slot visualizer
    slots,
    currentFlow,
    nextSlotToCollect,
    getSlotLabel,

    // Authentication
    loggedInCandidate,
    logoutCandidate,
    candidateAspirations,
    authError,
    setAuthError,
    loginUser,
    registerUser,
    verifyAspiration,
    cancelAspiration,
  };
}
