from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

# Schema khi tạo task mới
class TodoCreate(BaseModel):
    title: str
    deadline: Optional[datetime] = None

    @field_validator("title")
    @classmethod
    def title_khong_duoc_rong(cls, v: str) -> str:
        v = v.strip()
        if not v or not any(c.isalnum() for c in v):
            raise ValueError("Tên task không được để trống")
        return v

# Schema khi cập nhật task
class TodoUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None
    deadline: Optional[datetime] = None

    @field_validator("title")
    @classmethod
    def title_khong_duoc_rong(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v or not any(c.isalnum() for c in v):
            raise ValueError("Tên task không được để trống")
        return v