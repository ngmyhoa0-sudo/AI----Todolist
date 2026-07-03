from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Schema khi tạo task mới
class TodoCreate(BaseModel):
    title: str
    deadline: Optional[datetime] = None

# Schema khi cập nhật task
class TodoUpdate(BaseModel):
    title: Optional[str] = None          
    is_completed: Optional[bool] = None  
    deadline: Optional[datetime] = None  