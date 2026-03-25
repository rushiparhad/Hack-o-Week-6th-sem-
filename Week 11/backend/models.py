from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Encrypted profile data (stored as encrypted JSON string)
    encrypted_profile = Column(Text, nullable=True)


class WearableData(Base):
    __tablename__ = "wearable_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    device_id = Column(String(100), nullable=True)
    device_type = Column(String(100), nullable=True)  # e.g. "fitbit", "apple_watch"
    synced_at = Column(DateTime(timezone=True), server_default=func.now())

    # All sensitive health metrics stored encrypted
    encrypted_payload = Column(Text, nullable=False)  # AES/Fernet encrypted JSON

    # Non-sensitive metadata (unencrypted for querying)
    data_type = Column(String(50), nullable=True)      # "heart_rate", "steps", "sleep"
    record_date = Column(String(20), nullable=True)    # "2026-03-05"


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    token_hash = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False)
