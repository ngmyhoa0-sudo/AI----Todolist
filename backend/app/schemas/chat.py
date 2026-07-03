from pydantic import BaseModel
from datetime import datetime

class ChatMessage(BaseModel):
    role: str        # "user" hoặc "ai"
    content: str     # nội dung tin nhắn

class ChatCreate(BaseModel):
    message: str     # tin nhắn người dùng gửi lên

class ChatResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime