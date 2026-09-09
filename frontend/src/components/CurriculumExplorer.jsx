import { useMemo, useState } from "react";
import { BookOpenCheck, ExternalLink, Search } from "lucide-react";
import { CURRICULUM_PROGRAMS } from "../data/curriculums.js";

export default function CurriculumExplorer() {
  const [selectedCode, setSelectedCode] = useState("CN1");
  const [query, setQuery] = useState("");

  const filteredPrograms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return CURRICULUM_PROGRAMS;
    return CURRICULUM_PROGRAMS.filter((program) => {
      return (
        program.code.toLowerCase().includes(normalizedQuery) ||
        program.name.toLowerCase().includes(normalizedQuery) ||
        program.faculty.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query]);

  const selectedProgram = useMemo(() => {
    return CURRICULUM_PROGRAMS.find((program) => program.code === selectedCode) || CURRICULUM_PROGRAMS[0];
  }, [selectedCode]);

  return (
    <div className="panel-card curriculum-card">
      <div className="panel-header-action">
        <h2>Khung chương trình đào tạo</h2>
      </div>
      <p className="panel-desc">
        Tra cứu nhanh cấu trúc chương trình theo từng mã ngành và mở nguồn chi tiết từ trang UET.
      </p>

      <div className="curriculum-search">
        <Search size={14} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm mã ngành, tên ngành hoặc khoa..."
        />
      </div>

      <div className="curriculum-layout">
        <div className="curriculum-major-list">
          {filteredPrograms.map((program) => (
            <button
              key={program.code}
              className={`curriculum-major-btn ${selectedProgram.code === program.code ? "active" : ""}`}
              type="button"
              onClick={() => setSelectedCode(program.code)}
            >
              <span>{program.code}</span>
              <strong>{program.name}</strong>
            </button>
          ))}
        </div>

        <div className="curriculum-detail">
          <div className="curriculum-title-row">
            <div className="curriculum-title-icon">
              <BookOpenCheck size={18} />
            </div>
            <div>
              <span>{selectedProgram.code}</span>
              <h3>{selectedProgram.name}</h3>
            </div>
          </div>

          <div className="curriculum-meta-grid">
            <div>
              <span>Văn bằng</span>
              <strong>{selectedProgram.degree}</strong>
            </div>
            <div>
              <span>Thời gian</span>
              <strong>{selectedProgram.duration}</strong>
            </div>
            <div>
              <span>Tín chỉ</span>
              <strong>{selectedProgram.totalCredits}</strong>
            </div>
          </div>

          <div className="curriculum-section">
            <span className="curriculum-label">Đơn vị chuyên môn</span>
            <p>{selectedProgram.faculty}</p>
          </div>

          <div className="curriculum-section">
            <span className="curriculum-label">Trọng tâm đào tạo</span>
            <p>{selectedProgram.focus}</p>
          </div>

          <div className="curriculum-section">
            <span className="curriculum-label">Các khối kiến thức chính</span>
            <div className="curriculum-block-list">
              {selectedProgram.blocks.map((block) => (
                <span key={block}>{block}</span>
              ))}
            </div>
          </div>

          <a
            className="curriculum-source-btn"
            href={selectedProgram.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={14} />
            <span>Mở khung chương trình chi tiết trên UET</span>
          </a>
        </div>
      </div>
    </div>
  );
}
