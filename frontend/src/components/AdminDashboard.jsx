import {
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";

const ROLE_LABELS = {
  admin: "Quản trị",
  staff: "Cán bộ",
  student: "Thí sinh",
};

export default function AdminDashboard({
  adminUsers,
  adminAspirations,
  adminError,
  onRefresh,
  onVerifyAspiration,
  onCancelAspiration,
  onUpdateUserRole,
}) {
  const verifiedCount = adminAspirations.filter((item) => item.is_verified).length;
  const pendingCount = adminAspirations.length - verifiedCount;

  return (
    <main className="admin-dashboard">
      <section className="admin-summary-grid">
        <div className="admin-summary-card">
          <ClipboardList size={20} />
          <div>
            <span>Tổng hồ sơ</span>
            <strong>{adminAspirations.length}</strong>
          </div>
        </div>
        <div className="admin-summary-card">
          <ShieldCheck size={20} />
          <div>
            <span>Chờ xác minh</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>
        <div className="admin-summary-card">
          <Users size={20} />
          <div>
            <span>Người dùng</span>
            <strong>{adminUsers.length}</strong>
          </div>
        </div>
        <button className="admin-refresh-btn" type="button" onClick={onRefresh}>
          <RefreshCw size={16} />
          <span>Làm mới dữ liệu</span>
        </button>
      </section>

      {adminError && <div className="auth-error-banner">{adminError}</div>}

      <section className="panel-card admin-panel">
        <div className="panel-header-action">
          <h2>Quản lý hồ sơ xét tuyển</h2>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã hồ sơ</th>
                <th>Thí sinh</th>
                <th>Tài khoản</th>
                <th>Ngành</th>
                <th>Phương thức</th>
                <th>Minh chứng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {adminAspirations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="admin-empty-cell">
                    Chưa có hồ sơ xét tuyển nào.
                  </td>
                </tr>
              ) : (
                adminAspirations.map((aspiration) => (
                  <tr key={aspiration.id}>
                    <td>UET-{aspiration.id}</td>
                    <td>
                      <strong>{aspiration.fullname}</strong>
                      <span>{aspiration.phone_number}</span>
                    </td>
                    <td>{aspiration.user_email || "Chưa liên kết"}</td>
                    <td>{aspiration.chosen_major}</td>
                    <td>{aspiration.admission_method}</td>
                    <td>
                      {aspiration.details?.evidence_url ? (
                        <a
                          className="admin-evidence-link"
                          href={aspiration.details.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Xem minh chứng
                        </a>
                      ) : (
                        <span>Chưa có</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${aspiration.is_verified ? "verified" : "unverified"}`}>
                        {aspiration.is_verified ? "Đã xác minh" : "Chờ xác minh"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        {!aspiration.is_verified && (
                          <button type="button" onClick={() => onVerifyAspiration(aspiration.id)}>
                            <CheckCircle2 size={14} />
                            <span>Duyệt</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="danger"
                          onClick={() => {
                            if (window.confirm(`Hủy hồ sơ UET-${aspiration.id}?`)) {
                              onCancelAspiration(aspiration.id);
                            }
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Hủy</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel-card admin-panel">
        <div className="panel-header-action">
          <h2>Phân quyền người dùng</h2>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Họ tên</th>
                <th>Vai trò</th>
                <th>Số hồ sơ</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.fullname || "-"}</td>
                  <td>
                    <select
                      className="admin-role-select"
                      value={user.role}
                      onChange={(event) => onUpdateUserRole(user.id, event.target.value)}
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{user.aspiration_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
