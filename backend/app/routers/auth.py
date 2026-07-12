from fastapi import APIRouter, HTTPException
from app.schemas.auth import UserRegister, UserLogin, ForgotPassword, ResetPassword, RefreshTokenRequest
from app.database import supabase

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(body: UserRegister):
    try:
        supabase.auth.sign_up({
            "email": body.email,
            "password": body.password
        })
        return {"message": "Đăng ký thành công, vui lòng kiểm tra email!"}
    except Exception:
        raise HTTPException(status_code=400, detail="Đăng ký thất bại. Email đã tồn tại hoặc không hợp lệ.")

@router.post("/login")
def login(body: UserLogin):
    try:
        res = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password
        })
        return {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "user_id": res.user.id,
            "email": res.user.email
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng.")

@router.post("/logout")
def logout():
    supabase.auth.sign_out()
    return {"message": "Đăng xuất thành công"}

@router.post("/forgot-password")
def forgot_password(body: ForgotPassword):
    supabase.auth.reset_password_email(body.email)
    return {"message": "Email đặt lại mật khẩu đã được gửi!"}

@router.post("/reset-password")
def reset_password(body: ResetPassword):
    try:
        res = supabase.auth.verify_otp({
            "email": body.email,
            "token": body.otp,
            "type": "recovery"
        })
        supabase.auth.update_user({"password": body.new_password})
        return {"message": "Đặt lại mật khẩu thành công!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Mã OTP không đúng hoặc đã hết hạn")

@router.post("/guest")
def guest_login():
    try:
        res = supabase.auth.sign_in_anonymously()
        return {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "user_id": res.user.id,
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Không thể tạo phiên khách. Vui lòng thử lại.")

@router.post("/refresh")
def refresh_token(body: RefreshTokenRequest):
    try:
        res = supabase.auth.refresh_session(body.refresh_token)
        return {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Không thể làm mới phiên đăng nhập. Vui lòng đăng nhập lại.")