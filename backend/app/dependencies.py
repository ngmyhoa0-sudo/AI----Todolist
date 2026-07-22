from fastapi import Header, HTTPException
from app.database import supabase

DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh"

async def verify_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

    token = authorization.split(" ")[1]

    try:
        user = supabase.auth.get_user(token)
        user_id = user.user.id
        email = user.user.email
    except Exception:
        raise HTTPException(status_code=401, detail="Token hết hạn hoặc không hợp lệ")

    timezone = DEFAULT_TIMEZONE
    try:
        settings_res = supabase.table("user_settings").select("timezone").eq("user_id", user_id).execute()
        if settings_res.data:
            timezone = settings_res.data[0]["timezone"]
    except Exception:
        pass  # Không lấy được cài đặt múi giờ thì dùng mặc định, không chặn request

    return {"id": user_id, "email": email, "timezone": timezone}