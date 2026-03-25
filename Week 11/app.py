"""
app.py — Wearable User Portal Backend
  POST /register     — create account (password bcrypt-hashed)
  POST /login        — returns JWT access token
  GET  /me           — get current user (JWT required)
  POST /wearable     — sync wearable data (payload stored encrypted)
  GET  /wearable     — get your wearable records (decrypted)
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
import json, hashlib, os, base64

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import bcrypt as _bcrypt
from jose import jwt, JWTError
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY = "change_this_in_production_min32chars!!"
ALGORITHM  = "HS256"
TOKEN_EXP_MINUTES = 60

# ── Database ──────────────────────────────────────────────────────────────────
engine = create_engine("sqlite:///./portal.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String, unique=True, index=True, nullable=False)
    username      = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at    = Column(DateTime, default=datetime.utcnow)

class WearableRecord(Base):
    __tablename__ = "wearable"
    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, nullable=False)
    data_type      = Column(String, nullable=False)   # e.g. "heart_rate"
    record_date    = Column(String, nullable=False)   # "YYYY-MM-DD"
    encrypted_data = Column(Text,   nullable=False)   # Fernet-encrypted JSON
    synced_at      = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:    yield db
    finally: db.close()

# ── Encryption (Fernet / AES-128-CBC) ────────────────────────────────────────
def _make_key() -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32,
                     salt=b"wearable_salt_v1", iterations=200_000)
    return base64.urlsafe_b64encode(kdf.derive(SECRET_KEY.encode()))

_fernet = Fernet(_make_key())

def encrypt(data: dict) -> str:
    return _fernet.encrypt(json.dumps(data).encode()).decode()

def decrypt(token: str) -> dict:
    return json.loads(_fernet.decrypt(token.encode()).decode())

# ── Auth helpers ──────────────────────────────────────────────────────────────
oauth2 = OAuth2PasswordBearer(tokenUrl="/login")

def hash_pw(plain: str) -> str:
    return _bcrypt.hashpw(plain.encode(), _bcrypt.gensalt()).decode()

def verify_pw(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode(), hashed.encode())

def make_token(user_id: int, email: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXP_MINUTES)
    return jwt.encode({"sub": str(user_id), "email": email, "exp": exp}, SECRET_KEY, ALGORITHM)

def current_user(token: str = Depends(oauth2), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        if not user: raise Exception()
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ── Schemas ───────────────────────────────────────────────────────────────────
class RegisterIn(BaseModel):
    email:    EmailStr
    username: str
    password: str

class LoginIn(BaseModel):
    email:    EmailStr
    password: str

class WearableIn(BaseModel):
    data_type:   str            # "heart_rate" | "steps" | "sleep" | etc.
    record_date: str            # "YYYY-MM-DD"
    payload:     dict           # arbitrary health metrics

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Wearable Portal API")

app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

@app.post("/register", status_code=201)
def register(body: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already registered")
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    user = User(email=body.email, username=body.username,
                password_hash=hash_pw(body.password))
    db.add(user); db.commit(); db.refresh(user)
    return {"id": user.id, "email": user.email, "username": user.username}

@app.post("/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_pw(body.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    return {"access_token": make_token(user.id, user.email), "token_type": "bearer"}

@app.get("/me")
def me(user: User = Depends(current_user)):
    return {"id": user.id, "email": user.email, "username": user.username,
            "joined": user.created_at}

@app.post("/wearable", status_code=201)
def sync(body: WearableIn, user: User = Depends(current_user),
         db: Session = Depends(get_db)):
    rec = WearableRecord(user_id=user.id, data_type=body.data_type,
                         record_date=body.record_date,
                         encrypted_data=encrypt(body.payload))
    db.add(rec); db.commit(); db.refresh(rec)
    return {"id": rec.id, "data_type": rec.data_type,
            "record_date": rec.record_date, "synced_at": rec.synced_at}

@app.get("/wearable")
def get_wearable(user: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.query(WearableRecord).filter(
        WearableRecord.user_id == user.id
    ).order_by(WearableRecord.synced_at.desc()).all()
    return [{"id": r.id, "data_type": r.data_type,
             "record_date": r.record_date, "payload": decrypt(r.encrypted_data),
             "synced_at": r.synced_at} for r in rows]
