import * as Lucide from "lucide-react";

const emojiToIconKey = {
  // Học thuật / Ngành học
  "📚": "BookOpen",
  "📝": "FileText",
  "📊": "BarChart3",
  "📋": "ClipboardList",
  "📂": "FolderOpen",

  // Tài chính
  "💰": "Coins",
  "💸": "Coins",

  // Hành động / Điều hướng
  "🔍": "Search",
  "🔄": "RefreshCw",
  "✏️": "Pencil",
  "➡️": "SendHorizontal",
  "🚀": "Rocket",

  // Trạng thái
  "✅": "CheckCircle2",
  "❌": "XCircle",
  "⚠️": "AlertTriangle",
  "✉️": "Mail",

  // Kết nối / Hỗ trợ
  "💬": "MessageSquare",
  "🧑\u200d💼": "UserCheck",   // 🧑‍💼 Tư vấn viên
  "👤": "User",

  // Công nghệ
  "💻": "Laptop",
  "🤖": "Bot",
  "🧠": "Brain",

  // Địa điểm / Tổ chức
  "🏫": "School",
  "🏠": "Home",
  "💼": "Briefcase",
  "🎓": "GraduationCap",
  "🥇": "Trophy",
  "🏆": "Trophy",

  // Quốc tế
  "🇬🇧": "Globe",

  // Tốc độ / Ưu tiên
  "⚡": "Zap",

  // Trạng thái mạng
  "🟢": "Wifi",
  "🔴": "WifiOff",
  "🟡": "Loader2",

  // Khác
  "🎯": "Target",
  "💡": "Lightbulb",
};

/**
 * Parses a string, extracts the FIRST mapped emoji at the start or anywhere,
 * strips it from the string, and returns the cleaned text + Lucide component.
 *
 * @param {string} text
 * @returns {{ cleanedText: string, Icon: React.ComponentType | null }}
 */
export function parseEmojiText(text) {
  if (typeof text !== "string") {
    return { cleanedText: text, Icon: null };
  }

  let cleanedText = text;
  let Icon = null;

  for (const [emoji, iconName] of Object.entries(emojiToIconKey)) {
    if (cleanedText.includes(emoji)) {
      cleanedText = cleanedText.replace(emoji, "").trim();
      Icon = Lucide[iconName] || null;
      break;
    }
  }

  // Clean up any double spaces left after emoji removal
  cleanedText = cleanedText.replace(/\s+/g, " ").trim();

  return { cleanedText, Icon };
}
