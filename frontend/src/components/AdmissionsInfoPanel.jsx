import { ClipboardList, FileText, Landmark, Route } from "lucide-react";

const METHOD_ITEMS = [
  "THPTQG: xét điểm thi tốt nghiệp THPT theo tổ hợp.",
  "HSA: xét kết quả thi Đánh giá năng lực của ĐHQGHN.",
  "IELTS: xét tuyển kết hợp chứng chỉ tiếng Anh và điểm Toán.",
  "Tuyển thẳng: xét theo giải thưởng và minh chứng hợp lệ.",
];

export default function AdmissionsInfoPanel({
  onStartRegistration,
}) {
  return (
    <div className="panel-card admissions-info-card">
      <div className="panel-header-action">
        <h2>Thông tin tuyển sinh</h2>
      </div>
      <p className="panel-desc">
        Tổng quan các phương thức xét tuyển đang được chatbot hỗ trợ trong hệ thống.
      </p>

      <div className="admissions-info-grid">
        <div className="admission-mini-card">
          <Landmark size={17} />
          <div>
            <span>Đơn vị</span>
            <strong>Trường Đại học Công nghệ - ĐHQGHN</strong>
          </div>
        </div>
        <div className="admission-mini-card">
          <ClipboardList size={17} />
          <div>
            <span>Mã ngành</span>
            <strong>CN1 - CN21</strong>
          </div>
        </div>
      </div>

      <div className="admission-methods">
        {METHOD_ITEMS.map((item) => (
          <div className="admission-method-row" key={item}>
            <FileText size={14} />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <button className="admission-start-btn" type="button" onClick={onStartRegistration}>
        <Route size={15} />
        <span>Bắt đầu đăng ký nguyện vọng</span>
      </button>
    </div>
  );
}
