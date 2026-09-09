import { Calculator, Info } from "lucide-react";
import { useMemo, useState } from "react";

function getIeltsBonus(score) {
  if (!score || Number.isNaN(score)) return 0;
  if (score >= 7.5) return 2.5;
  if (score >= 7.0) return 2.0;
  if (score >= 6.5) return 1.5;
  if (score >= 6.0) return 1.0;
  if (score >= 5.5) return 0.5;
  return 0;
}

export default function ScoreConversionPanel() {
  const [thptScore, setThptScore] = useState("");
  const [ieltsScore, setIeltsScore] = useState("");

  const result = useMemo(() => {
    const base = Number.parseFloat(thptScore);
    const ielts = Number.parseFloat(ieltsScore);
    const normalizedBase = Number.isNaN(base) ? 0 : Math.min(Math.max(base, 0), 30);
    const bonus = getIeltsBonus(ielts);
    return {
      base: normalizedBase,
      bonus,
      total: Math.min(normalizedBase + bonus, 30),
    };
  }, [thptScore, ieltsScore]);

  return (
    <div className="panel-card conversion-card">
      <div className="panel-header-action">
        <h2>Quy đổi điểm</h2>
      </div>
      <p className="panel-desc">
        Tính nhanh điểm cộng IELTS và tổng điểm xét tuyển tham khảo cho phương thức THPTQG.
      </p>

      <div className="conversion-form">
        <label>
          <span>Điểm THPTQG</span>
          <input
            type="number"
            min="0"
            max="30"
            step="0.01"
            value={thptScore}
            onChange={(event) => setThptScore(event.target.value)}
            placeholder="Ví dụ: 26.75"
          />
        </label>
        <label>
          <span>Điểm IELTS</span>
          <input
            type="number"
            min="0"
            max="9"
            step="0.5"
            value={ieltsScore}
            onChange={(event) => setIeltsScore(event.target.value)}
            placeholder="Ví dụ: 6.5"
          />
        </label>
      </div>

      <div className="conversion-result">
        <div className="conversion-result-icon">
          <Calculator size={20} />
        </div>
        <div>
          <span>Tổng điểm sau quy đổi</span>
          <strong>{result.total.toFixed(2)}</strong>
          <p>Điểm gốc {result.base.toFixed(2)} + điểm cộng IELTS {result.bonus.toFixed(1)}</p>
        </div>
      </div>

      <div className="conversion-note">
        <Info size={14} />
        <span>Bảng quy đổi này dùng theo logic demo hiện có trong chatbot, cần đối chiếu thông báo tuyển sinh chính thức khi nộp hồ sơ.</span>
      </div>
    </div>
  );
}
