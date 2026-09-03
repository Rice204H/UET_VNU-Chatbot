import { API_BASE_URL } from "../config.js";

const WEBHOOK_PATH = "/webhooks/rest/webhook";
const HEALTH_PATH = "/";
const TRACKER_PATH = "/conversations";

function toWebhookResponse(rasaMessages) {
  const messages = Array.isArray(rasaMessages) ? rasaMessages : [];
  const textParts = messages.map((message) => message?.text).filter(Boolean);
  const buttonsMessage = messages.find(
    (message) => Array.isArray(message?.buttons) && message.buttons.length > 0
  );

  return {
    bot_says: textParts.join("\n") || "",
    buttons: buttonsMessage?.buttons || [],
  };
}

async function restartConversation(senderId) {
  await fetch(`${API_BASE_URL}${TRACKER_PATH}/${senderId}/tracker/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event: "restart",
    }),
  });
}

export async function sendWebhookMessage({
  senderId,
  messageText,
  payloadValue,
  newSession = false,
}) {
  if (!senderId) {
    throw new Error("sender is required");
  }

  if (newSession) {
    await restartConversation(senderId);
  }

  const outgoingMessage = payloadValue || messageText || "";
  const response = await fetch(`${API_BASE_URL}${WEBHOOK_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: senderId,
      message: outgoingMessage,
    }),
  });

  const data = await response.json().catch(() => ([]));

  if (!response.ok) {
    const message = data?.message || "Request failed";
    throw new Error(message);
  }

  return toWebhookResponse(data);
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}${HEALTH_PATH}`);

  if (!response.ok) {
    throw new Error("Health check failed");
  }

  return response.json().catch(() => ({}));
}

export async function fetchChatHistory({ senderId }) {
  if (!senderId) {
    throw new Error("sender is required");
  }

  const response = await fetch(
    `${API_BASE_URL}${TRACKER_PATH}/${senderId}/tracker`
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || "Request failed";
    throw new Error(message);
  }

  const events = Array.isArray(data?.events) ? data.events : [];
  const historyEntries = events
    .filter((event) => event?.event === "user" || event?.event === "bot")
    .map((event) => {
      if (event.event === "user") {
        return {
          sender: "USER",
          message_text: event.text || "",
          intent: event.parse_data?.intent?.name || null,
          timestamp: event.timestamp || null,
        };
      }

      return {
        sender: "BOT",
        message_text: event.text || "",
        buttons: event.data?.buttons || [],
        timestamp: event.timestamp || null,
      };
    });

  return { sender_id: senderId, history: historyEntries };
}
