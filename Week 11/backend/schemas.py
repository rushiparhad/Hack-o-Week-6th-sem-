from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Any, Dict, List
from datetime import datetime


# ─── Auth Schemas ────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not v.replace("_", "").isalnum():
            raise ValueError("Username must be alphanumeric (underscores allowed)")
        if len(v) < 3 or len(v) > 30:
            raise ValueError("Username must be between 3 and 30 characters")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None


# ─── Profile Schemas ──────────────────────────────────────────────────────────

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    blood_type: Optional[str] = None
    medical_conditions: Optional[List[str]] = []
    emergency_contact: Optional[str] = None
    timezone: Optional[str] = None


class ProfileResponse(BaseModel):
    user_id: int
    username: str
    email: str
    profile: Optional[Dict[str, Any]]


# ─── Wearable Schemas ─────────────────────────────────────────────────────────

class WearableSync(BaseModel):
    device_id: Optional[str] = None
    device_type: Optional[str] = None   # "fitbit" | "apple_watch" | "garmin" | "generic"
    data_type: str                       # "heart_rate" | "steps" | "sleep" | "spo2"
    record_date: str                     # "YYYY-MM-DD"
    payload: Dict[str, Any]             # Arbitrary health metrics


class WearableSyncResponse(BaseModel):
    id: int
    user_id: int
    device_type: Optional[str]
    data_type: str
    record_date: str
    synced_at: datetime
    payload: Dict[str, Any]

    model_config = {"from_attributes": True}


class RefreshRequest(BaseModel):
    refresh_token: str
