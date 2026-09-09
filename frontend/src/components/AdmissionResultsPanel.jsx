import { CheckCircle2, Clock, PartyPopper } from "lucide-react";

export default function AdmissionResultsPanel({ candidateAspirations }) {
  const verified = candidateAspirations.filter((item) => item.is_verified);
  const pending = candidateAspirations.filter((item) => !item.is_verified);

  return (
    <div className="panel-card results-card">
      <div className="panel-header-action">
        <h2>Kết quả xét tuyển</h2>
      </div>
      <p className="panel-desc">
        Theo dõi trạng thái xét duyệt minh chứng và kết quả ghi nhận hồ sơ của tài khoản hiện tại.
      </p>

      <div className="results-summary">
        <div>
          <CheckCircle2 size={18} />
          <span>Đã xác minh</span>
          <strong>{verified.length}</strong>
        </div>
        <div>
          <Clock size={18} />
          <span>Chờ xét duyệt</span>
          <strong>{pending.length}</strong>
        </div>
      </div>

      <div className="results-list">
        {candidateAspirations.length === 0 ? (
          <div className="results-empty">
            <PartyPopper size={28} />
            <p>Chưa có hồ sơ để hiển thị kết quả.</p>
          </div>
        ) : (
          candidateAspirations.map((item) => (
            <div className="result-item" key={item.id}>
              <div>
                <span>UET-{item.id}</span>
                <strong>{item.chosen_major}</strong>
                <p>{item.admission_method}</p>
              </div>
              <span className={`status-badge flex-align ${item.is_verified ? "verified" : "unverified"}`}>
                {item.is_verified ? "Đủ điều kiện xử lý" : "Đang chờ xác minh"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
