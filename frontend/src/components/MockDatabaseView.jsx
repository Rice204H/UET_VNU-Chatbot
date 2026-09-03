import { Database, Trash2, User } from "lucide-react";

export default function MockDatabaseView({ submissions, clearSubmissions, getSlotLabel }) {
  return (
    <></>
    // <div className="panel-card database-card">
    //   <div className="panel-header-action">
    //     <h2>Mock Database (Hồ sơ đã lưu)</h2>
    //     {submissions.length > 0 && (
    //       <button className="ghost-button icon-only" onClick={clearSubmissions} title="Xóa toàn bộ hồ sơ">
    //         <Trash2 size={14} />
    //       </button>
    //     )}
    //   </div>
    //   <p className="panel-desc">Các hồ sơ được thêm tự động khi sự kiện [CALL_ACTION] được gọi thành công:</p>

    //   <div className="submissions-list">
    //     {submissions.length === 0 ? (
    //       <div className="empty-db-state">
    //         <Database size={32} className="icon-muted" />
    //         <p>Chưa có hồ sơ thí sinh nào được lưu. Hãy hoàn tất quy trình điền form trên chatbot để lưu hồ sơ!</p>
    //       </div>
    //     ) : (
    //       submissions.map((sub, index) => (
    //         <div key={sub.id || index} className="db-record-card">
    //           <div className="db-record-header">
    //             <div className="db-record-title flex-align">
    //               <User size={13} className="icon-blue" />
    //               <strong>{sub.fullname}</strong>
    //             </div>
    //             <div className="flex-align gap-2">
    //               <span className={`db-record-status ${sub.is_verified ? "verified" : "unverified"}`}>
    //                 {sub.is_verified ? "Đã xác minh ✅" : "Chờ xác minh ⏳"}
    //               </span>
    //               <span className="db-record-method">{sub.admission_method}</span>
    //             </div>
    //           </div>
    //           <div className="db-record-details">
    //             {sub.email && (
    //               <div className="detail-row">
    //                 <span>Email:</span> <strong>{sub.email}</strong>
    //               </div>
    //             )}
    //             <div className="detail-row">
    //               <span>SĐT:</span> <strong>{sub.phone_number}</strong>
    //             </div>
    //             <div className="detail-row">
    //               <span>Ngành:</span> <strong>{sub.chosen_major}</strong>
    //             </div>
    //             {Object.keys(sub.details || {})
    //               .slice(4) // Skip fullname, email, phone_number, chosen_major
    //               .map((detailKey) => {
    //                 const val = sub.details[detailKey];
    //                 const isUrl = detailKey === "evidence_url" && val && (val.startsWith("http") || val.includes("."));
    //                 return (
    //                   <div key={detailKey} className="detail-row sub-detail">
    //                     <span>{getSlotLabel(detailKey)}:</span>
    //                     {isUrl ? (
    //                       <a href={val} target="_blank" rel="noopener noreferrer" className="link-text">
    //                         Xem URL ↗
    //                       </a>
    //                     ) : (
    //                       <span className="detail-val">{val}</span>
    //                     )}
    //                   </div>
    //                 );
    //               })}
    //           </div>
    //           <div className="db-record-footer">
    //             <span className="record-date">{sub.created_at}</span>
    //             <span className="record-id">{sub.id}</span>
    //           </div>
    //         </div>
    //       ))
    //     )}
    //   </div>
    // </div>
  );
}
