import { parseEmojiText } from "../utils/emojiMapper.js";

export default function ReplyButtons({ buttons, onReply, disabled }) {
  if (!buttons || buttons.length === 0) {
    return null;
  }

  return (
    <div className="reply-buttons">
      {buttons.map((button, index) => {
        const { cleanedText, Icon } = parseEmojiText(button.title);
        return (
          <button
            key={`${button.title}-${index}`}
            className="reply-button flex-align"
            type="button"
            onClick={() => {
              if (button.url) {
                window.open(button.url, "_blank");
              } else {
                onReply?.(button);
              }
            }}
            disabled={disabled}
          >
            {Icon && <Icon size={14} />}
            <span>{cleanedText}</span>
          </button>
        );
      })}
    </div>
  );
}

