import { useState } from "react";
import { AlertCircle, Key, Sparkles } from "lucide-react";

export default function StudentPortal({
  authError,
  setAuthError,
  loginUser,
  registerUser,
}) {
  const [authTab, setAuthTab] = useState("login"); // 'login' | 'register'
  const [loginEmailInput, setLoginEmailInput] = useState("");
  const [loginPasswordInput, setLoginPasswordInput] = useState("");
  const [regEmailInput, setRegEmailInput] = useState("");
  const [regFullnameInput, setRegFullnameInput] = useState("");
  const [regPasswordInput, setRegPasswordInput] = useState("");

  const handleTabChange = (tab) => {
    setAuthTab(tab);
    if (setAuthError) setAuthError("");
  };

  return (
    <div className="panel-card auth-card">
      <h2>Cổng Đăng Ký &amp; Đăng Nhập (Student Portal)</h2>
      <p className="panel-desc">
        Đăng nhập tài khoản học sinh để theo dõi trạng thái, xem danh sách nguyện vọng xét tuyển và xác minh minh chứng.
      </p>

      <div className="auth-container">
        <div className="auth-tabs flex-align">
          <button
            className={`auth-tab-btn ${authTab === "login" ? "active" : ""}`}
            onClick={() => handleTabChange("login")}
          >
            Đăng nhập
          </button>
          <button
            className={`auth-tab-btn ${authTab === "register" ? "active" : ""}`}
            onClick={() => handleTabChange("register")}
          >
            Đăng ký mới
          </button>
        </div>

        {authError && (
          <div className="auth-error-banner flex-align">
            <AlertCircle size={14} />
            <span>{authError}</span>
          </div>
        )}

        {authTab === "login" ? (
          <div className="auth-form">
            <div className="input-group">
              <label>Email học sinh</label>
              <input
                type="email"
                placeholder="example@student.com"
                value={loginEmailInput}
                onChange={(e) => setLoginEmailInput(e.target.value)}
                className="auth-input"
              />
            </div>
            <div className="input-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPasswordInput}
                onChange={(e) => setLoginPasswordInput(e.target.value)}
                className="auth-input"
              />
            </div>
            <button
              onClick={() => {
                if (loginEmailInput.trim() && loginPasswordInput.trim()) {
                  loginUser(loginEmailInput.trim(), loginPasswordInput.trim());
                }
              }}
              className="auth-submit-btn flex-align justify-center"
            >
              <Key size={14} />
              <span>Đăng nhập hệ thống</span>
            </button>
          </div>
        ) : (
          <div className="auth-form">
            <div className="input-group">
              <label>Họ và tên thí sinh</label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={regFullnameInput}
                onChange={(e) => setRegFullnameInput(e.target.value)}
                className="auth-input"
              />
            </div>
            <div className="input-group">
              <label>Email học sinh</label>
              <input
                type="email"
                placeholder="example@student.com"
                value={regEmailInput}
                onChange={(e) => setRegEmailInput(e.target.value)}
                className="auth-input"
              />
            </div>
            <div className="input-group">
              <label>Mật khẩu đăng nhập</label>
              <input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={regPasswordInput}
                onChange={(e) => setRegPasswordInput(e.target.value)}
                className="auth-input"
              />
            </div>
            <button
              onClick={() => {
                if (regEmailInput.trim() && regFullnameInput.trim() && regPasswordInput.trim()) {
                  registerUser(regEmailInput.trim(), regFullnameInput.trim(), regPasswordInput.trim());
                }
              }}
              className="auth-submit-btn flex-align justify-center"
            >
              <Sparkles size={14} />
              <span>Đăng ký tài khoản</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
