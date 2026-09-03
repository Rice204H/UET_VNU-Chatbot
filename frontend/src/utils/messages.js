function createId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeButtons(buttons) {
  if (!Array.isArray(buttons)) {
    return [];
  }

  return buttons
    .filter((button) => button && (button.title || button.payload || button.url))
    .map((button) => ({
      title: String(button.title || "Select"),
      payload: button.payload || null,
      url: button.url || null,
    }));
}

export function createMessage({ from, text, buttons, timestamp, id }) {
  return {
    id: id || createId(),
    from,
    text,
    buttons: normalizeButtons(buttons),
    timestamp: timestamp || new Date().toISOString(),
  };
}
