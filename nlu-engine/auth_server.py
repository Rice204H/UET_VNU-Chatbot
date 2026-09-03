from sanic import Sanic
from sanic.response import json
from sanic_cors import CORS
import sys
import os

# Add actions to path so we can import db_helper
sys.path.append(os.path.join(os.path.dirname(__file__), "actions"))
from db_helper import (
    delete_candidate_profile,
    get_all_candidate_aspirations,
    get_all_users,
    get_candidate_aspirations,
    get_user_by_email,
    is_admin_user,
    login_user_db,
    register_user_db,
    update_user_role,
    verify_candidate_profile,
)

app = Sanic("AuthServer")
CORS(app)

@app.post("/api/register")
async def register(request):
    data = request.json
    email = data.get("email")
    fullname = data.get("fullname")
    password = data.get("password")
    if not email or not fullname or not password:
        return json({"status": "error", "message": "Thiếu thông tin đăng ký (email, họ tên, mật khẩu)"}, status=400)
    
    success = register_user_db(email, fullname, password)
    if success:
        user = login_user_db(email, password)
        if user:
            return json({
                "status": "success",
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "fullname": user["fullname"],
                    "role": user.get("role", "student")
                }
            })
    return json({"status": "error", "message": "Email đã tồn tại hoặc đăng ký thất bại"}, status=400)

@app.post("/api/login")
async def login(request):
    data = request.json
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return json({"status": "error", "message": "Thiếu email hoặc mật khẩu"}, status=400)
    
    # Check if user exists
    user = get_user_by_email(email)
    if not user:
        # User does not exist, so register them automatically!
        fullname = email.split("@")[0].capitalize()
        register_success = register_user_db(email, fullname, password)
        if not register_success:
            return json({"status": "error", "message": "Đăng ký tài khoản tự động thất bại"}, status=500)
        user = get_user_by_email(email)
        
    # Attempt login/verify password
    user_logged_in = login_user_db(email, password)
    if user_logged_in:
        aspirations = get_candidate_aspirations(email)
        return json({
            "status": "success",
            "user": {
                "id": user_logged_in["id"],
                "email": user_logged_in["email"],
                "fullname": user_logged_in["fullname"],
                "role": user_logged_in.get("role", "student")
            },
            "aspirations": aspirations
        })
    else:
        return json({"status": "error", "message": "Mật khẩu không chính xác"}, status=401)

@app.post("/api/verify")
async def verify(request):
    data = request.json
    candidate_id = data.get("candidate_id")
    if not candidate_id:
        return json({"status": "error", "message": "Thiếu mã hồ sơ"}, status=400)
    
    try:
        db_id = int(str(candidate_id).replace("UET-", "").strip())
    except ValueError:
        return json({"status": "error", "message": "Mã hồ sơ không hợp lệ"}, status=400)
        
    success = verify_candidate_profile(db_id)
    if success:
        return json({"status": "success"})
    else:
        return json({"status": "error", "message": "Xác minh thất bại"}, status=500)

@app.post("/api/cancel")
async def cancel_aspiration(request):
    data = request.json
    candidate_id = data.get("candidate_id")
    if not candidate_id:
        return json({"status": "error", "message": "Thiếu mã hồ sơ"}, status=400)
    
    try:
        db_id = int(str(candidate_id).replace("UET-", "").strip())
    except ValueError:
        return json({"status": "error", "message": "Mã hồ sơ không hợp lệ"}, status=400)
        
    success = delete_candidate_profile(db_id)
    if success:
        return json({"status": "success"})
    else:
        return json({"status": "error", "message": "Hủy nguyện vọng thất bại"}, status=500)

@app.get("/api/aspirations")
async def get_aspirations(request):
    email = request.args.get("email")
    if not email:
        return json({"status": "error", "message": "Thiếu email"}, status=400)
    aspirations = get_candidate_aspirations(email)
    return json({"status": "success", "aspirations": aspirations})

def get_admin_email(request):
    data = request.json if request.method == "POST" and request.json else {}
    return data.get("admin_email") or request.args.get("admin_email")

def require_admin(request):
    admin_email = get_admin_email(request)
    if not admin_email or not is_admin_user(admin_email):
        return None, json({"status": "error", "message": "Bạn không có quyền quản trị"}, status=403)
    return admin_email, None

@app.get("/api/admin/users")
async def admin_get_users(request):
    _, error_response = require_admin(request)
    if error_response:
        return error_response
    return json({"status": "success", "users": get_all_users()})

@app.get("/api/admin/aspirations")
async def admin_get_aspirations(request):
    _, error_response = require_admin(request)
    if error_response:
        return error_response
    return json({"status": "success", "aspirations": get_all_candidate_aspirations()})

@app.post("/api/admin/verify")
async def admin_verify(request):
    _, error_response = require_admin(request)
    if error_response:
        return error_response

    data = request.json or {}
    candidate_id = data.get("candidate_id")
    if not candidate_id:
        return json({"status": "error", "message": "Thiếu mã hồ sơ"}, status=400)

    success = verify_candidate_profile(candidate_id)
    if success:
        return json({"status": "success"})
    return json({"status": "error", "message": "Xác minh hồ sơ thất bại"}, status=500)

@app.post("/api/admin/cancel")
async def admin_cancel(request):
    _, error_response = require_admin(request)
    if error_response:
        return error_response

    data = request.json or {}
    candidate_id = data.get("candidate_id")
    if not candidate_id:
        return json({"status": "error", "message": "Thiếu mã hồ sơ"}, status=400)

    success = delete_candidate_profile(candidate_id)
    if success:
        return json({"status": "success"})
    return json({"status": "error", "message": "Hủy hồ sơ thất bại"}, status=500)

@app.post("/api/admin/users/role")
async def admin_update_user_role(request):
    _, error_response = require_admin(request)
    if error_response:
        return error_response

    data = request.json or {}
    user_id = data.get("user_id")
    role = data.get("role")
    if not user_id or not role:
        return json({"status": "error", "message": "Thiếu user_id hoặc role"}, status=400)

    success = update_user_role(user_id, role)
    if success:
        return json({"status": "success"})
    return json({"status": "error", "message": "Cập nhật vai trò thất bại"}, status=400)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5006)
