import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { checkHealth, sendWebhookMessage } from "../api/chatApi.js";
import { initialMessages } from "../data/initialMessages.js";
import { createMessage } from "../utils/messages.js";
import { getOrCreateSenderId } from "../utils/storage.js";

const STATUS = {
  online: "online",
  offline: "offline",
  unknown: "unknown",
};

export function useChat() {
  const senderId = useMemo(() => getOrCreateSenderId(), []);
  const [messages, setMessages] = useState(() => initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState(STATUS.unknown);
  const hasBootedRef = useRef(false);

  const appendMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  useEffect(() => {
    let isActive = true;

    checkHealth()
      .then(() => {
        if (isActive) {
          setApiStatus(STATUS.online);
        }
      })
      .catch(() => {
        if (isActive) {
          setApiStatus(STATUS.offline);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function startConversation() {
      if (hasBootedRef.current) {
        return;
      }

      hasBootedRef.current = true;

      try {
        const data = await sendWebhookMessage({
          senderId,
          messageText: "",
          payloadValue: "/greet",
        });

        if (!isActive) {
          return;
        }

        const botText = data?.bot_says || "Xin chao!";
        appendMessage(
          createMessage({
            from: "bot",
            text: botText,
            buttons: data?.buttons,
          })
        );
      } catch (err) {
        if (isActive) {
          setError("Unable to reach the server. Please try again.");
          setApiStatus(STATUS.offline);
        }
      }
    }

    startConversation();

    return () => {
      isActive = false;
    };
  }, [appendMessage, senderId]);

  const sendMessage = useCallback(
    async ({ text, payloadValue }) => {
      const trimmed = (text || "").trim();

      if (!trimmed || isSending) {
        return;
      }

      setIsSending(true);
      setError("");
      appendMessage(createMessage({ from: "user", text: trimmed }));

      try {
        const data = await sendWebhookMessage({
          senderId,
          messageText: trimmed,
          payloadValue,
        });

        const botText = data?.bot_says || "Thanks. How else can I help?";
        appendMessage(
          createMessage({
            from: "bot",
            text: botText,
            buttons: data?.buttons,
          })
        );
      } catch (err) {
        setError("Unable to reach the server. Please try again.");
        appendMessage(
          createMessage({
            from: "bot",
            text: "Sorry, I could not reach the server. Please try again.",
          })
        );
        setApiStatus(STATUS.offline);
      } finally {
        setIsSending(false);
      }
    },
    [appendMessage, isSending, senderId]
  );

  const sendText = useCallback((text) => sendMessage({ text, payloadValue: null }), [
    sendMessage,
  ]);

  const sendPayload = useCallback(
    (button) => {
      if (!button) {
        return;
      }

      sendMessage({
        text: button.title || "Select",
        payloadValue: button.payload || null,
      });
    },
    [sendMessage]
  );

  return {
    messages,
    isSending,
    apiStatus,
    error,
    sendText,
    sendPayload,
  };
}
