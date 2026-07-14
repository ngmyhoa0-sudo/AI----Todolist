from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

REPEAT_RULES = {"daily", "weekly", "weekday", "monthly", "yearly"}


def _validate_repeat_rule(v):
    if v is not None and v not in REPEAT_RULES:
        raise ValueError(f"repeat_rule phải là 1 trong: {', '.join(sorted(REPEAT_RULES))}")
    return v


# Schema khi tạo task mới
class TodoCreate(BaseModel):
    title: str
    deadline: Optional[datetime] = None
    repeat_rule: Optional[str] = None

    @field_validator("title")
    @classmethod
    def title_khong_duoc_rong(cls, v: str) -> str:
        v = v.strip()
        if not v or not any(c.isalnum() for c in v):
            raise ValueError("Tên task không được để trống")
        return v

    @field_validator("repeat_rule")
    @classmethod
    def repeat_rule_hop_le(cls, v):
        return _validate_repeat_rule(v)


# Schema khi cập nhật task
class TodoUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None
    deadline: Optional[datetime] = None
    repeat_rule: Optional[str] = None

    @field_validator("title")
    @classmethod
    def title_khong_duoc_rong(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v or not any(c.isalnum() for c in v):
            raise ValueError("Tên task không được để trống")
        return v

    @field_validator("repeat_rule")
    @classmethod
    def repeat_rule_hop_le(cls, v):
        return _validate_repeat_rule(v)