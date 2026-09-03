"""
query_actions.py
================
Tất cả action tra cứu thông tin ngành học.

Logic context (last_queried_major):
  - Khi tìm được ngành chính xác (1 kết quả) → SlotSet("last_queried_major", major_code)
  - Khi hỏi tiếp (không có entity mới) → fallback về last_queried_major
  - Thứ tự ưu tiên: entity hiện tại → last_queried_major → chosen_major (form slot)
"""

from typing import Any, Text, Dict, List, Optional
from rasa_sdk import Action, Tracker
from rasa_sdk.events import SlotSet
from rasa_sdk.executor import CollectingDispatcher
from .db_helper import get_db_connection, get_db_cursor, save_support_request


# ─── Helper: trích entity ngành từ tin nhắn hiện tại ──────────────────────

def _get_major_from_message(tracker: Tracker) -> Optional[str]:
    """Lấy entity ngành từ tin nhắn mới nhất (major hoặc nganh_hoc)."""
    return (
        next(tracker.get_latest_entity_values("major"), None)
        or next(tracker.get_latest_entity_values("nganh_hoc"), None)
    )


def _resolve_major(tracker: Tracker) -> Optional[str]:
    """
    Xác định ngành cần tra cứu theo thứ tự ưu tiên:
      1. Entity trong tin nhắn hiện tại (người dùng đề cập ngành mới)
      2. Slot last_queried_major (context từ câu hỏi trước)
      3. Slot chosen_major (từ form đang active)
    """
    return (
        _get_major_from_message(tracker)
        or tracker.get_slot("last_queried_major")
        or tracker.get_slot("chosen_major")
    )


def _query_majors(cursor, conn_type: str, term: str) -> list:
    """Query DB tìm ngành theo tên hoặc mã ngành."""
    placeholder = "%s" if conn_type == "postgres" else "?"
    query = (
        f"SELECT major_code, major_name, tuition_fee, benchmark_2025, quota, description "
        f"FROM majors "
        f"WHERE LOWER(major_name) LIKE LOWER({placeholder}) "
        f"   OR LOWER(major_code) LIKE LOWER({placeholder})"
    )
    cursor.execute(query, (f"%{term}%", f"%{term}%"))
    return cursor.fetchall()


# ═══════════════════════════════════════════════════════════════════════════
# Action: Hỏi thông tin tổng quan về ngành
# ═══════════════════════════════════════════════════════════════════════════

class ActionQueryMajorInfo(Action):
    def name(self) -> Text:
        return "action_query_major_info"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        major_raw = _resolve_major(tracker)

        if not major_raw:
            dispatcher.utter_message(
                text="Bạn muốn hỏi về ngành cụ thể nào?\n"
                     "Ví dụ: _Khoa học máy tính_, _CN8_, _Trí tuệ nhân tạo_..."
            )
            return []

        try:
            conn, conn_type = get_db_connection()
            cursor = get_db_cursor(conn, conn_type)
            rows = _query_majors(cursor, conn_type, major_raw)
            cursor.close()
            conn.close()

            if not rows:
                dispatcher.utter_message(
                    text=f"Mình chưa tìm thấy ngành **{major_raw}** trong danh mục UET.\n"
                         f"Bạn có thể thử lại bằng mã ngành (VD: CN8) hoặc tên đầy đủ."
                )
                return []

            row = dict(rows[0])
            msg = (
                f"📚 **{row['major_name']} ({row['major_code']})**\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"• Học phí dự kiến: **{row['tuition_fee']:,.0f} triệu VNĐ/năm**\n"
                f"• Điểm chuẩn 2025: **{row['benchmark_2025'] or 'Chưa cập nhật'}**\n"
                f"• Chỉ tiêu tuyển sinh: {row['quota']:,} sinh viên\n\n"
                f"{row['description']}\n\n"
                f"Bạn muốn biết thêm về ngành này không?"
            )
            dispatcher.utter_message(
                text=msg,
                buttons=[
                    {"title": "💰 Học phí chi tiết", "payload": f"học phí ngành {row['major_code']}"},
                    {"title": "📊 Điểm chuẩn 2025", "payload": f"điểm chuẩn ngành {row['major_code']}"},
                    {"title": "📝 Đăng ký nguyện vọng", "payload": "/dang_ky_nguyen_vong"},
                ]
            )
            # ✅ Lưu context: ngành vừa được tra cứu thành công
            return [SlotSet("last_queried_major", row["major_code"])]

        except Exception as e:
            print(f"Error in ActionQueryMajorInfo: {e}")
            dispatcher.utter_message(text="Hệ thống tra cứu đang bận, vui lòng thử lại sau!")
            return []


# ═══════════════════════════════════════════════════════════════════════════
# Action: Hỏi danh sách ngành để chọn khi đăng ký
# ═══════════════════════════════════════════════════════════════════════════

class ActionAskChosenMajor(Action):
    def name(self) -> Text:
        return "action_ask_chosen_major"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        try:
            conn, conn_type = get_db_connection()
            cursor = get_db_cursor(conn, conn_type)
            cursor.execute("SELECT major_code, major_name FROM majors ORDER BY major_code")
            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            # Gợi ý ngành từ context nếu có
            context_major = tracker.get_slot("last_queried_major")
            hint = f"\n_Gợi ý: bạn vừa hỏi về **{context_major}**, bạn có muốn đăng ký ngành này không?_" if context_major else ""

            buttons = []
            for row in rows:
                rd = dict(row) if not isinstance(row, dict) else row
                buttons.append({
                    "title": f"{rd['major_name']} ({rd['major_code']})",
                    "payload": f"{rd['major_name']} ({rd['major_code']})"
                })

            dispatcher.utter_message(
                text=f"Bạn muốn đặt nguyện vọng vào ngành nào? Chọn một trong các ngành đào tạo của UET:{hint}",
                buttons=buttons
            )
        except Exception as e:
            print(f"Error in ActionAskChosenMajor: {e}")
            dispatcher.utter_message(
                text="Bạn muốn đặt nguyện vọng vào ngành nào? (Ví dụ: Khoa học máy tính):",
                buttons=[
                    {"title": "Khoa học máy tính (CN8)", "payload": "Khoa học máy tính (CN8)"},
                    {"title": "Công nghệ thông tin (CN1)", "payload": "Công nghệ thông tin (CN1)"},
                    {"title": "Trí tuệ nhân tạo (CN12)", "payload": "Trí tuệ nhân tạo (CN12)"},
                ]
            )
        return []


# ═══════════════════════════════════════════════════════════════════════════
# Action: Hỏi học phí theo ngành
# ═══════════════════════════════════════════════════════════════════════════

class ActionQueryTuitionByMajor(Action):
    def name(self) -> Text:
        return "action_query_tuition_by_major"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        major_raw = _resolve_major(tracker)

        if not major_raw:
            dispatcher.utter_message(
                text="Bạn muốn hỏi học phí ngành nào?\n"
                     "Ví dụ: _Khoa học máy tính_, _CN8_, _Trí tuệ nhân tạo_..."
            )
            return []

        # Cho biết đang dùng context nếu không có entity mới
        using_context = not _get_major_from_message(tracker)

        try:
            conn, conn_type = get_db_connection()
            cursor = get_db_cursor(conn, conn_type)
            rows = _query_majors(cursor, conn_type, major_raw)
            cursor.close()
            conn.close()

            if not rows:
                dispatcher.utter_message(
                    text=f"Mình chưa tìm thấy ngành **{major_raw}** trong danh mục.\n"
                         f"Bạn có thể thử lại với tên đầy đủ hoặc mã ngành (VD: CN8)."
                )
                return []

            if len(rows) == 1:
                row = dict(rows[0])
                fee = row["tuition_fee"]
                fee_str = f"{fee:,.0f} triệu VNĐ/năm" if fee else "Đang cập nhật"

                context_note = f"_(Dựa trên ngành bạn vừa hỏi: **{row['major_code']}**)_\n\n" if using_context else ""
                msg = (
                    f"{context_note}"
                    f"💰 **Học phí — {row['major_name']} ({row['major_code']})**\n"
                    f"━━━━━━━━━━━━━━━━━━━━━━━━\n"
                    f"• Học phí dự kiến: **{fee_str}**\n\n"
                    f"_Mức học phí có thể điều chỉnh theo từng năm học. "
                    f"Vui lòng xác nhận với trang tuyển sinh chính thức của UET._\n\n"
                    f"Bạn có muốn xem thêm điểm chuẩn hoặc đăng ký xét tuyển không?"
                )
                dispatcher.utter_message(
                    text=msg,
                    buttons=[
                        {"title": "📊 Điểm chuẩn 2025", "payload": f"điểm chuẩn ngành {row['major_code']}"},
                        {"title": "📝 Đăng ký nguyện vọng", "payload": "/dang_ky_nguyen_vong"},
                    ]
                )
                # ✅ Cập nhật context
                return [SlotSet("last_queried_major", row["major_code"])]
            else:
                lines = [f"🔍 Tìm thấy nhiều ngành phù hợp với **\"{major_raw}\"**:\n"]
                for r in rows:
                    rd = dict(r)
                    fee = rd["tuition_fee"]
                    fee_str = f"{fee:,.0f} triệu VNĐ/năm" if fee else "Đang cập nhật"
                    lines.append(f"• **{rd['major_name']} ({rd['major_code']})**: {fee_str}")
                lines.append("\nHỏi chính xác hơn để mình trả lời chi tiết hơn nhé!")
                dispatcher.utter_message(text="\n".join(lines))
                return []

        except Exception as e:
            print(f"Error in ActionQueryTuitionByMajor: {e}")
            dispatcher.utter_message(text="Hệ thống tra cứu đang bận, vui lòng thử lại sau!")
            return []


# ═══════════════════════════════════════════════════════════════════════════
# Action: Hỏi điểm chuẩn theo ngành
# ═══════════════════════════════════════════════════════════════════════════

class ActionQueryBenchmarkByMajor(Action):
    def name(self) -> Text:
        return "action_query_benchmark_by_major"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        major_raw = _resolve_major(tracker)

        if not major_raw:
            dispatcher.utter_message(
                text="Bạn muốn hỏi điểm chuẩn ngành nào?\n"
                     "Ví dụ: _Trí tuệ nhân tạo_, _CN12_, _Khoa học máy tính_..."
            )
            return []

        using_context = not _get_major_from_message(tracker)

        try:
            conn, conn_type = get_db_connection()
            cursor = get_db_cursor(conn, conn_type)
            rows = _query_majors(cursor, conn_type, major_raw)
            cursor.close()
            conn.close()

            if not rows:
                dispatcher.utter_message(
                    text=f"Mình chưa tìm thấy ngành **{major_raw}** trong danh mục.\n"
                         f"Bạn có thể thử lại với tên đầy đủ hoặc mã ngành (VD: CN12)."
                )
                return []

            if len(rows) == 1:
                row = dict(rows[0])
                score = row["benchmark_2025"]
                quota = row["quota"]
                score_str = str(score) if score else "Chưa có dữ liệu"
                quota_str = f"{quota:,} chỉ tiêu" if quota else "Đang cập nhật"

                context_note = f"_(Dựa trên ngành bạn vừa hỏi: **{row['major_code']}**)_\n\n" if using_context else ""
                msg = (
                    f"{context_note}"
                    f"📊 **Điểm chuẩn 2025 — {row['major_name']} ({row['major_code']})**\n"
                    f"━━━━━━━━━━━━━━━━━━━━━━━━\n"
                    f"• Điểm chuẩn năm 2025: **{score_str}**\n"
                    f"• Chỉ tiêu tuyển sinh: {quota_str}\n\n"
                    f"_Điểm chuẩn có thể thay đổi theo phương thức xét tuyển (HSA, THPT, SAT…)._\n\n"
                    f"Bạn có muốn xem học phí hoặc đăng ký xét tuyển không?"
                )
                dispatcher.utter_message(
                    text=msg,
                    buttons=[
                        {"title": "💰 Học phí chi tiết", "payload": f"học phí ngành {row['major_code']}"},
                        {"title": "📝 Đăng ký nguyện vọng", "payload": "/dang_ky_nguyen_vong"},
                    ]
                )
                # ✅ Cập nhật context
                return [SlotSet("last_queried_major", row["major_code"])]
            else:
                lines = [f"🔍 Điểm chuẩn 2025 các ngành phù hợp với **\"{major_raw}\"**:\n"]
                for r in rows:
                    rd = dict(r)
                    score = rd["benchmark_2025"]
                    score_str = str(score) if score else "Chưa có dữ liệu"
                    lines.append(f"• **{rd['major_name']} ({rd['major_code']})**: {score_str}")
                lines.append("\nHỏi chính xác hơn để mình trả lời chi tiết hơn nhé!")
                dispatcher.utter_message(text="\n".join(lines))
                return []

        except Exception as e:
            print(f"Error in ActionQueryBenchmarkByMajor: {e}")
            dispatcher.utter_message(text="Hệ thống tra cứu đang bận, vui lòng thử lại sau!")
            return []


# ═══════════════════════════════════════════════════════════════════════════
# Action: Fallback tùy biến (Xử lý khi không hiểu ý người dùng)
# ═══════════════════════════════════════════════════════════════════════════

class ActionCustomFallback(Action):
    def name(self) -> Text:
        return "action_custom_fallback"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Đếm số lần fallback liên tiếp trong lịch sử hội thoại (luồng tự do)
        fallback_count = 1  # Tính cả lần fallback hiện tại đang chạy
        
        for event in reversed(tracker.events):
            if event.get("event") == "action":
                action_name = event.get("name")
                if action_name == "action_listen":
                    continue
                if action_name in ["action_custom_fallback", "action_default_fallback", "utter_default"]:
                    fallback_count += 1
                else:
                    # Gặp một action bình thường khác -> ngắt chuỗi fallback liên tiếp
                    break
        
        # Nếu đang trong form (vòng lặp điền hồ sơ) thì không áp dụng luật nói chuyện tự do này
        in_form = tracker.active_loop.get("name") is not None
        
        # Nếu ở luồng tự do và bị fallback >= 3 lần liên tiếp
        if not in_form and fallback_count >= 3:
            dispatcher.utter_message(
                text="⚠️ **Nhập sai quá 3 lần liên tiếp**\n"
                     "Hệ thống nhận thấy bạn đang gặp khó khăn khi điền hồ sơ. "
                     "Bạn có thể kết nối với Fanpage Tuyển sinh của trường hoặc gặp tư vấn viên trực tiếp để được hỗ trợ.",
                buttons=[
                    {"title": "💬 Fanpage Tuyển sinh", "url": "https://www.facebook.com/groups/426349504198734"},
                    {"title": "🧑‍💼 Gặp tư vấn viên", "payload": "/gap_tu_van_vien"},
                    {"title": "🔄 Đăng ký lại từ đầu", "payload": "/dang_ky_nguyen_vong"}
                ]
            )
            return []

        # Ngược lại, hoặc nếu đang trong form, trả về phản hồi fallback mặc định
        dispatcher.utter_message(
            text="Xin lỗi, mình chưa hiểu rõ ý của bạn. Bạn có thể diễn đạt lại rõ hơn hoặc bấm chọn một trong các nội dung cần hỗ trợ dưới đây nhé:",
            buttons=[
                {"title": "📚 Tìm hiểu ngành học", "payload": "Tư vấn giúp mình ngành học"},
                {"title": "📝 Đăng ký nguyện vọng", "payload": "/dang_ky_nguyen_vong"}
            ]
        )
        return []


class ActionSubmitSupportForm(Action):
    def name(self) -> Text:
        return "action_submit_support_form"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        support_issue = tracker.get_slot("support_issue")
        sender_id = tracker.sender_id
        
        # Lưu vào cơ sở dữ liệu
        success = save_support_request(sender_id, support_issue)
        
        if success:
            dispatcher.utter_message(
                text=f"✅ **Đã gửi yêu cầu hỗ trợ thành công!**\n"
                     f"Vấn đề bạn đang gặp phải: *\"{support_issue}\"* đã được chuyển tiếp đến tư vấn viên tuyển sinh.\n"
                     f"Chúng tôi sẽ liên hệ lại hỗ trợ bạn sớm nhất có thể. Cảm ơn bạn!"
            )
        else:
            dispatcher.utter_message(
                text=f"✅ **Đã tiếp nhận yêu cầu hỗ trợ!**\n"
                     f"Vấn đề: *\"{support_issue}\"* đã được gửi thành công. Tư vấn viên sẽ phản hồi bạn sớm nhất có thể!"
            )
            
        return [SlotSet("support_issue", None)]
