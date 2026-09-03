from sanic import Sanic
from sanic.response import json
from sanic_cors import CORS
import sys
import os

# Add actions to path so we can import db_helper
sys.path.append(os.path.join(os.path.dirname(__file__), "actions"))
from db_helper import register_user_db, login_user_db, get_candidate_aspirations, verify_candidate_profile, get_user_by_email, delete_candidate_profile

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
                    "fullname": user["fullname"]
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
                "fullname": user_logged_in["fullname"]
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5006)
