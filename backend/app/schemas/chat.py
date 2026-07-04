from pydantic import BaseModel
from datetime import datetime

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCreate(BaseModel):
    message: str

class ChatHistoryCreate(BaseModel):
    message: str
    role: str = "user"

class ParseTaskRequest(BaseModel):
    text: str

class ChatResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime