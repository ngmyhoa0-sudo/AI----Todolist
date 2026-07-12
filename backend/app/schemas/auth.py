from pydantic import BaseModel, Field

class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ForgotPassword(BaseModel):
    email: str

class ResetPassword(BaseModel):
    email: str
    otp: str
    new_password: str = Field(alias="newPassword")

    model_config = {"populate_by_name": True}

class RefreshTokenRequest(BaseModel):
    refresh_token: str