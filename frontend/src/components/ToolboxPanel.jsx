import {
  Calculator,
  FileSearch,
  GraduationCap,
  LayoutGrid,
  PlusCircle,
  PartyPopper,
  School,
} from "lucide-react";

const TOOL_ITEMS = [
  {
    id: "admissions",
    label: "Thông tin tuyển sinh",
    icon: School,
    tone: "blue",
  },
  {
    id: "curriculum",
    label: "Chương trình đào tạo",
    icon: GraduationCap,
    tone: "indigo",
  },
  {
    id: "conversion",
    label: "Quy đổi điểm",
    icon: Calculator,
    tone: "violet",
  },
  {
    id: "lookup",
    label: "Tra cứu hồ sơ",
    icon: FileSearch,
    tone: "amber",
  },
  {
    id: "results",
    label: "Kết quả xét tuyển",
    icon: PartyPopper,
    tone: "orange",
  },
];

export default function ToolboxPanel({ activeTool, onSelectTool, onNewChat, aspirationCount }) {
  return (
    <aside className="toolbox-panel">
      <button
        className={`toolbox-new-chat-btn ${activeTool === "chat" ? "active" : ""}`}
        type="button"
        onClick={onNewChat}
      >
        <PlusCircle size={18} />
        <span>Trò chuyện mới</span>
      </button>

      <div className="toolbox-heading">
        <LayoutGrid size={16} />
        <span>Công cụ</span>
      </div>

      <div className="toolbox-list">
        {TOOL_ITEMS.map((item) => {
          const Icon = item.icon;
          const isLookup = item.id === "lookup";

          return (
            <button
              key={item.id}
              className={`toolbox-item ${activeTool === item.id ? "active" : ""}`}
              type="button"
              onClick={() => onSelectTool(item.id)}
            >
              <span className={`toolbox-icon tone-${item.tone}`}>
                <Icon size={18} />
              </span>
              <span className="toolbox-label">{item.label}</span>
              {isLookup && aspirationCount > 0 && (
                <span className="toolbox-badge">{aspirationCount}</span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
