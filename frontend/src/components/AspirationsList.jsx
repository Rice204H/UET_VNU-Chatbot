import { CheckCircle2, ClipboardList, Clock } from "lucide-react";

export default function AspirationsList({ candidateAspirations, verifyAspiration, cancelAspiration }) {
  return (
    <div className="panel-card aspirations-card">
      <div className="panel-header-action">
        <h2>Nguyện vọng đã đặt ({candidateAspirations.length})</h2>
      </div>
      <p className="panel-desc">
        Danh sách nguyện vọng bạn đã đăng ký thông qua trợ lý ảo tuyển sinh:
      </p>

      <div className="candidate-aspirations-list">
        {candidateAspirations.length === 0 ? (
          <div className="empty-aspirations-state">
            <ClipboardList size={32} className="icon-muted" />
            <p>Bạn chưa đăng ký nguyện vọng nào. Hãy trò chuyện với chatbot để bắt đầu đăng ký!</p>
          </div>
        ) : (
          candidateAspirations.map((asp) => (
            <div key={asp.id} className="aspiration-item-card">
              <div className="asp-card-header">
                <span className="asp-id">
                  {asp.id.toString().startsWith("UET-") ? asp.id : `UET-${asp.id}`}
                </span>
                <span className={`status-badge flex-align ${asp.is_verified ? "verified" : "unverified"}`}>
                  {asp.is_verified
                    ? <><CheckCircle2 size={12} /><span>Đã xác minh</span></>
                    : <><Clock size={12} /><span>Chờ xác minh</span></>}
                </span>
              </div>
              <div className="asp-card-body">
                <div className="asp-row">
                  <span>Ngành học:</span> <strong>{asp.chosen_major}</strong>
                </div>
                <div className="asp-row">
                  <span>Phương thức:</span> <strong>{asp.admission_method}</strong>
                </div>
                {asp.phone_number && (
                  <div className="asp-row">
                    <span>Số điện thoại:</span> <strong>{asp.phone_number}</strong>
                  </div>
                )}
                {asp.details?.evidence_url && (
                  <div className="asp-row">
                    <span>Minh chứng:</span>
                    <a href={asp.details.evidence_url} target="_blank" rel="noopener noreferrer" className="link-text">
                      Xem minh chứng ↗
                    </a>
                  </div>
                )}
              </div>
              
              <div className="asp-actions-row" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                {!asp.is_verified && (
                  <button
                    onClick={() => verifyAspiration(asp.id)}
                    className="verify-inline-btn"
                    style={{ flex: 1, margin: 0 }}
                  >
                    <CheckCircle2 size={12} />
                    <span>Xác minh</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm(`Bạn có chắc chắn muốn hủy nguyện vọng ${asp.chosen_major}?`)) {
                      cancelAspiration(asp.id);
                    }
                  }}
                  className="cancel-inline-btn"
                  style={{ flex: 1 }}
                >
                  <span>Hủy nguyện vọng</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
