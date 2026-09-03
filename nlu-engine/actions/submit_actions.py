import json
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, ActiveLoop
from .db_helper import get_db_connection, find_major_code

def reset_all_flowchart_slots() -> List[Dict[Text, Any]]:
    return [
        SlotSet("fullname", None),
        SlotSet("phone_number", None),
        SlotSet("chosen_major", None),
        SlotSet("hsa_id", None),
        SlotSet("hsa_score", None),
        SlotSet("has_ielts", None),
        SlotSet("ielts_score", None),
        SlotSet("math_score", None),
        SlotSet("award_name", None),
        SlotSet("thptqg_block", None),
        SlotSet("thptqg_score", None),
        SlotSet("evidence_url", None),
        SlotSet("confirm_registration", None),
    ]


def get_ielts_bonus(ielts_score: float) -> float:
    if not ielts_score:
        return 0.0
    if ielts_score >= 7.5:
        return 2.5
    elif ielts_score >= 7.0:
        return 2.0
    elif ielts_score >= 6.5:
        return 1.5
    elif ielts_score >= 6.0:
        return 1.0
    elif ielts_score >= 5.5:
        return 0.5
    return 0.0


# --- SUBMIT FORM THPTQG ---
class ActionSubmitThptqgForm(Action):
    def name(self) -> Text:
        return "action_submit_thptqg_form"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        slots = ["fullname", "phone_number", "chosen_major", "thptqg_block", "thptqg_score", "has_ielts", "ielts_score", "ielts_evidence_url", "evidence_url"]
        data = {s: tracker.get_slot(s) for s in slots}
        
        try:
            conn, conn_type = get_db_connection()
            cursor = conn.cursor()
            
            major_code = find_major_code(data["chosen_major"])
            placeholder = "%s" if conn_type == "postgres" else "?"
            
            # Get sender_id (could be user email if logged in)
            sender_id = tracker.sender_id
            user_id = None
            if sender_id and "@" in sender_id:
                cursor.execute(f"SELECT id FROM users WHERE email = {placeholder}", (sender_id,))
                user_row = cursor.fetchone()
                if user_row:
                    user_id = user_row[0] if conn_type == "postgres" else user_row["id"]

            # Ghi vào bảng gốc candidates
            cursor.execute(f"""
                INSERT INTO candidates (user_id, fullname, phone_number, chosen_major_code, admission_method)
                VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, 'THPTQG')
            """, (user_id, data["fullname"], data["phone_number"], major_code))
            
            candidate_id = None
            if conn_type == "postgres":
                cursor.execute("SELECT LASTVAL()")
                candidate_id = cursor.fetchone()[0]
            else:
                candidate_id = cursor.lastrowid
                
            # Tính điểm cộng IELTS
            ielts_val = data["ielts_score"]
            ielts_score_float = None
            bonus_score = 0.0
            if data["has_ielts"] == "Có" and ielts_val:
                try:
                    ielts_score_float = float(ielts_val)
                    bonus_score = get_ielts_bonus(ielts_score_float)
                except ValueError:
                    pass

            total_score = float(data["thptqg_score"] or 0)
            final_score = total_score + bonus_score

            # Ghi vào bảng phụ admission_thptqg
            cursor.execute(f"""
                INSERT INTO admission_thptqg (candidate_id, block_name, total_score, evidence_url, ielts_score, ielts_evidence_url)
                VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})
            """, (candidate_id, data["thptqg_block"], total_score, data["evidence_url"], ielts_score_float, data["ielts_evidence_url"]))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            summary = {
                "fullname": data["fullname"],
                "phone_number": data["phone_number"],
                "chosen_major": data["chosen_major"],
                "thptqg_block": data["thptqg_block"],
                "thptqg_score": data["thptqg_score"],
                "has_ielts": data["has_ielts"],
                "ielts_score": data["ielts_score"],
                "bonus_score": bonus_score,
                "final_score": final_score,
                "evidence_url": data["evidence_url"]
            }
            summary_json = json.dumps(summary, ensure_ascii=False, indent=2)
            
            bonus_text = f"- Điểm IELTS quy đổi: {ielts_score_float} (Cộng {bonus_score} điểm)\n- Tổng điểm xét tuyển sau quy đổi: {final_score}\n" if ielts_score_float else ""

            dispatcher.utter_message(
                text=f"Cảm ơn bạn **{data['fullname']}**! Hồ sơ xét tuyển phương thức **THPTQG** của bạn đã được ghi nhận thành công.\n"
                     f"- Số điện thoại: {data['phone_number']}\n"
                     f"- Ngành xét tuyển: {data['chosen_major']}\n"
                     f"- Tổ hợp: {data['thptqg_block']}\n"
                     f"- Điểm thi THPTQG: {total_score}\n"
                     f"{bonus_text}"
                     f"- Mã số hồ sơ: #UET-{candidate_id}\n\n"
                     f"Ban tuyển sinh UET sẽ sớm liên hệ lại với bạn để thẩm định minh chứng!\n\n"
                     f"[CALL_ACTION: action_submit_thptqg_form]\n{summary_json}"
            )
        except Exception as e:
            dispatcher.utter_message(text="Gặp sự cố khi lưu hồ sơ THPTQG trực tuyến.")
            print(f"Error saving THPTQG candidate: {e}")
            
        return reset_all_flowchart_slots()


# --- SUBMIT FORM HSA ---
class ActionSubmitHsaForm(Action):
    def name(self) -> Text:
        return "action_submit_hsa_form"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        slots = ["fullname", "phone_number", "chosen_major", "hsa_id", "hsa_score", "evidence_url"]
        data = {s: tracker.get_slot(s) for s in slots}
        
        try:
            conn, conn_type = get_db_connection()
            cursor = conn.cursor()
            
            major_code = find_major_code(data["chosen_major"])
            placeholder = "%s" if conn_type == "postgres" else "?"
            
            # Get sender_id (could be user email if logged in)
            sender_id = tracker.sender_id
            user_id = None
            if sender_id and "@" in sender_id:
                cursor.execute(f"SELECT id FROM users WHERE email = {placeholder}", (sender_id,))
                user_row = cursor.fetchone()
                if user_row:
                    user_id = user_row[0] if conn_type == "postgres" else user_row["id"]

            # Ghi vào bảng gốc candidates
            cursor.execute(f"""
                INSERT INTO candidates (user_id, fullname, phone_number, chosen_major_code, admission_method)
                VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, 'HSA')
            """, (user_id, data["fullname"], data["phone_number"], major_code))
            
            candidate_id = None
            if conn_type == "postgres":
                cursor.execute("SELECT LASTVAL()")
                candidate_id = cursor.fetchone()[0]
            else:
                candidate_id = cursor.lastrowid
                
            # Ghi vào bảng phụ admission_hsa
            cursor.execute(f"""
                INSERT INTO admission_hsa (candidate_id, hsa_id, hsa_score, evidence_url)
                VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder})
            """, (candidate_id, data["hsa_id"], int(float(data["hsa_score"] or 0)), data["evidence_url"]))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            summary = {
                "fullname": data["fullname"],
                "phone_number": data["phone_number"],
                "chosen_major": data["chosen_major"],
                "hsa_id": data["hsa_id"],
                "hsa_score": data["hsa_score"],
                "evidence_url": data["evidence_url"]
            }
            summary_json = json.dumps(summary, ensure_ascii=False, indent=2)
            
            dispatcher.utter_message(
                text=f"Cảm ơn bạn **{data['fullname']}**! Hồ sơ xét tuyển phương thức **HSA** của bạn đã được ghi nhận thành công.\n"
                     f"- Số điện thoại: {data['phone_number']}\n"
                     f"- Ngành xét tuyển: {data['chosen_major']}\n"
                     f"- Mã số hồ sơ: #UET-{candidate_id}\n\n"
                     f"Ban tuyển sinh UET sẽ sớm liên hệ lại với bạn để thẩm định minh chứng!\n\n"
                     f"[CALL_ACTION: action_submit_hsa_form]\n{summary_json}"
            )
        except Exception as e:
            dispatcher.utter_message(text="Gặp sự cố khi lưu hồ sơ HSA trực tuyến.")
            print(f"Error saving HSA candidate: {e}")
            
        return reset_all_flowchart_slots()


# --- SUBMIT FORM IELTS ---
class ActionSubmitIeltsForm(Action):
    def name(self) -> Text:
        return "action_submit_ielts_form"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        slots = ["fullname", "phone_number", "chosen_major", "ielts_score", "math_score", "evidence_url"]
        data = {s: tracker.get_slot(s) for s in slots}
        
        try:
            conn, conn_type = get_db_connection()
            cursor = conn.cursor()
            
            major_code = find_major_code(data["chosen_major"])
            placeholder = "%s" if conn_type == "postgres" else "?"
            
            # Get sender_id (could be user email if logged in)
            sender_id = tracker.sender_id
            user_id = None
            if sender_id and "@" in sender_id:
                cursor.execute(f"SELECT id FROM users WHERE email = {placeholder}", (sender_id,))
                user_row = cursor.fetchone()
                if user_row:
                    user_id = user_row[0] if conn_type == "postgres" else user_row["id"]

            # Ghi vào bảng gốc candidates
            cursor.execute(f"""
                INSERT INTO candidates (user_id, fullname, phone_number, chosen_major_code, admission_method)
                VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, 'IELTS')
            """, (user_id, data["fullname"], data["phone_number"], major_code))
            
            candidate_id = None
            if conn_type == "postgres":
                cursor.execute("SELECT LASTVAL()")
                candidate_id = cursor.fetchone()[0]
            else:
                candidate_id = cursor.lastrowid
                
            # Ghi vào bảng phụ admission_ielts
            cursor.execute(f"""
                INSERT INTO admission_ielts (candidate_id, ielts_score, math_score, evidence_url)
                VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder})
            """, (candidate_id, float(data["ielts_score"] or 0), float(data["math_score"] or 0), data["evidence_url"]))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            summary = {
                "fullname": data["fullname"],
                "phone_number": data["phone_number"],
                "chosen_major": data["chosen_major"],
                "ielts_score": data["ielts_score"],
                "math_score": data["math_score"],
                "evidence_url": data["evidence_url"]
            }
            summary_json = json.dumps(summary, ensure_ascii=False, indent=2)
            
            dispatcher.utter_message(
                text=f"Cảm ơn bạn **{data['fullname']}**! Hồ sơ xét tuyển phương thức **IELTS** của bạn đã được ghi nhận thành công.\n"
                     f"- Số điện thoại: {data['phone_number']}\n"
                     f"- Ngành xét tuyển: {data['chosen_major']}\n"
                     f"- Mã số hồ sơ: #UET-{candidate_id}\n\n"
                     f"Ban tuyển sinh UET sẽ sớm liên hệ lại với bạn để thẩm định minh chứng!\n\n"
                     f"[CALL_ACTION: action_submit_ielts_form]\n{summary_json}"
            )
        except Exception as e:
            dispatcher.utter_message(text="Gặp sự cố khi lưu hồ sơ IELTS trực tuyến.")
            print(f"Error saving IELTS candidate: {e}")
            
        return reset_all_flowchart_slots()


# --- SUBMIT FORM TUYEN THANG ---
class ActionSubmitDirectForm(Action):
    def name(self) -> Text:
        return "action_submit_direct_form"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        slots = ["fullname", "phone_number", "chosen_major", "award_name", "evidence_url"]
        data = {s: tracker.get_slot(s) for s in slots}
        
        try:
            conn, conn_type = get_db_connection()
            cursor = conn.cursor()
            
            major_code = find_major_code(data["chosen_major"])
            placeholder = "%s" if conn_type == "postgres" else "?"
            
            # Get sender_id (could be user email if logged in)
            sender_id = tracker.sender_id
            user_id = None
            if sender_id and "@" in sender_id:
                cursor.execute(f"SELECT id FROM users WHERE email = {placeholder}", (sender_id,))
                user_row = cursor.fetchone()
                if user_row:
                    user_id = user_row[0] if conn_type == "postgres" else user_row["id"]

            # Ghi vào bảng gốc candidates
            cursor.execute(f"""
                INSERT INTO candidates (user_id, fullname, phone_number, chosen_major_code, admission_method)
                VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, 'TUYEN_THANG')
            """, (user_id, data["fullname"], data["phone_number"], major_code))
            
            candidate_id = None
            if conn_type == "postgres":
                cursor.execute("SELECT LASTVAL()")
                candidate_id = cursor.fetchone()[0]
            else:
                candidate_id = cursor.lastrowid
                
            # Ghi vào bảng phụ admission_direct
            cursor.execute(f"""
                INSERT INTO admission_direct (candidate_id, award_name, evidence_url)
                VALUES ({placeholder}, {placeholder}, {placeholder})
            """, (candidate_id, data["award_name"], data["evidence_url"]))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            summary = {
                "fullname": data["fullname"],
                "phone_number": data["phone_number"],
                "chosen_major": data["chosen_major"],
                "award_name": data["award_name"],
                "evidence_url": data["evidence_url"]
            }
            summary_json = json.dumps(summary, ensure_ascii=False, indent=2)
            
            dispatcher.utter_message(
                text=f"Cảm ơn bạn **{data['fullname']}**! Hồ sơ xét tuyển phương thức **TUYÊN THẲNG** của bạn đã được ghi nhận thành công.\n"
                     f"- Số điện thoại: {data['phone_number']}\n"
                     f"- Ngành xét tuyển: {data['chosen_major']}\n"
                     f"- Mã số hồ sơ: #UET-{candidate_id}\n\n"
                     f"Ban tuyển sinh UET sẽ sớm liên hệ lại với bạn để thẩm định minh chứng!\n\n"
                     f"[CALL_ACTION: action_submit_direct_form]\n{summary_json}"
            )
        except Exception as e:
            dispatcher.utter_message(text="Gặp sự cố khi lưu hồ sơ tuyển thẳng trực tuyến.")
            print(f"Error saving direct admission candidate: {e}")
            
        return reset_all_flowchart_slots()


# --- CANCEL ACTIVE FLOW ---
class ActionCancelFlow(Action):
    def name(self) -> Text:
        return "action_cancel_flow"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(
            text="⚠️ **Đã hủy quy trình đăng ký hiện tại.**\n\n"
                 "Mọi thông tin nháp đã được xóa sạch. Hệ thống quay về trạng thái hội thoại tự do.\n"
                 "Bạn có thể đặt câu hỏi hoặc chọn lại phương thức đăng ký."
        )
        # Tắt vòng lặp active và reset toàn bộ slots liên quan đến form
        return [ActiveLoop(None)] + reset_all_flowchart_slots()


# --- ASK FOR CONFIRMATION (Duyệt lại hồ sơ) ---
class ActionAskConfirmRegistration(Action):
    def name(self) -> Text:
        return "action_ask_confirm_registration"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        active_loop = tracker.active_loop.get("name")
        
        fullname = tracker.get_slot("fullname")
        phone = tracker.get_slot("phone_number")
        major = tracker.get_slot("chosen_major")
        evidence = tracker.get_slot("evidence_url")
        
        msg = (
            f"📝 **Duyệt lại hồ sơ đăng ký xét tuyển**\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"Thí sinh vui lòng kiểm tra kỹ các thông tin dưới đây:\n\n"
            f"• Họ và tên: **{fullname}**\n"
            f"• Số điện thoại: **{phone}**\n"
            f"• Ngành xét tuyển: **{major}**\n"
        )
        
        if active_loop == "hsa_form":
            msg += (
                f"• Số báo danh HSA: **{tracker.get_slot('hsa_id')}**\n"
                f"• Điểm thi HSA: **{tracker.get_slot('hsa_score')} điểm**\n"
            )
        elif active_loop == "ielts_form":
            msg += (
                f"• Điểm IELTS: **{tracker.get_slot('ielts_score')}**\n"
                f"• Điểm môn Toán: **{tracker.get_slot('math_score')} điểm**\n"
            )
        elif active_loop == "direct_form":
            msg += (
                f"• Nội dung giải thưởng: **{tracker.get_slot('award_name')}**\n"
            )
        elif active_loop == "thptqg_form":
            msg += (
                f"• Tổ hợp xét tuyển: **{tracker.get_slot('thptqg_block')}**\n"
                f"• Điểm thi THPTQG: **{tracker.get_slot('thptqg_score')} điểm**\n"
            )
            
        msg += (
            f"• Link minh chứng: {evidence}\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"Nếu mọi thông tin đã chính xác, vui lòng bấm **Xác nhận nộp**.\n"
            f"Nếu phát hiện sai sót, bạn có thể nhập trực tiếp mục cần sửa (Ví dụ: *'Sửa số điện thoại'*, *'Sửa họ tên'*)."
        )
        
        dispatcher.utter_message(
            text=msg,
            buttons=[
                {"title": "✅ Xác nhận nộp", "payload": "xác nhận"},
                {"title": "❌ Hủy bỏ hồ sơ", "payload": "hủy bỏ"}
            ]
        )
        return []


