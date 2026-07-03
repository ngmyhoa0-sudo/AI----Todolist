from fastapi import Header, HTTPException
from app.database import supabase

async def verify_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token không hợp lệ")
    
    token = authorization.split(" ")[1]
    
    try:
        user = supabase.auth.get_user(token)
        return {"id": user.user.id, "email": user.user.email}
    except:
        raise HTTPException(status_code=401, detail="Token hết hạn hoặc không hợp lệ")