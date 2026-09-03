import { useEffect, useRef, useMemo } from "react";
import MessageBubble from "./MessageBubble.jsx";

export default function MessageList({ messages, onReply, isSending }) {
  const containerRef = useRef(null);       // ref vào div.chat-body (scroll container)
  const prevLengthRef = useRef(messages.length);
  const isFirstRender = useRef(true);

  const latestMessage = messages[messages.length - 1];
  const activeButtonsId = latestMessage?.buttons?.length ? latestMessage.id : null;
  const disableAllButtons = Boolean(isSending);

  const buttonsDisabledMap = useMemo(() => {
    if (!activeButtonsId) return null;
    return new Set([activeButtonsId]);
  }, [activeButtonsId]);

  useEffect(() => {
    // Lần đầu render (vào trang): KHÔNG scroll
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevLengthRef.current = messages.length;
      return;
    }

    // Chỉ scroll khi có tin nhắn MỚI — scroll trong container, không cuộn trang
    if (messages.length > prevLengthRef.current && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }

    prevLengthRef.current = messages.length;
  }, [messages]);

  return (
    <div className="chat-body" ref={containerRef}>
      {messages.map((message) => {
        const isActive = buttonsDisabledMap
          ? buttonsDisabledMap.has(message.id)
          : false;
        const buttonsDisabled = disableAllButtons || !isActive;

        return (
          <MessageBubble
            key={message.id}
            message={message}
            onReply={onReply}
            buttonsDisabled={buttonsDisabled}
          />
        );
      })}
    </div>
  );
}
