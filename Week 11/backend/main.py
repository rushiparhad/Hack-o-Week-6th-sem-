"""
Wearable User Registration Portal — FastAPI Backend
Endpoints:
  POST /api/auth/register  — create account
  POST /api/auth/login     — get JWT pair
  POST /api/auth/refresh   — refresh access token
  POST /api/auth/logout    — revoke refresh token
  GET  /api/users/me       — current user info
  PUT  /api/users/me/profile — update encrypted profile
  GET  /api/users/me/profile — read decrypted profile
  POST /api/wearable/sync  — ingest wearable data (encrypted at rest)
  GET  /api/wearable/data  — list wearable records (decrypted on the fly)
"""

from datetime import datetime, timezone, timedelta

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
import auth
import encryption
from database import engine, get_db

# ─── Bootstrap ────────────────────────────────────────────────────────────────

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Wearable User Portal API",
    description="JWT-authenticated backend with AES-encrypted user profiles & wearable sync",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Lock this down to your frontend origin in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Auth Routes ──────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=schemas.UserResponse, status_code=201)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    """Register a new user. Password is bcrypt-hashed before storage."""
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = models.User(
        email=payload.email,
        username=payload.username,
        full_name=payload.full_name,
        hashed_password=auth.hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/auth/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticate and return access + refresh JWT tokens."""
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not auth.verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    token_data = {"sub": str(user.id), "email": user.email}
    access_token = auth.create_access_token(token_data)
    refresh_token = auth.create_refresh_token(token_data)

    # Persist refresh token hash
    rt = models.RefreshToken(
        user_id=user.id,
        token_hash=auth.hash_token(refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(rt)
    db.commit()

    return schemas.Token(access_token=access_token, refresh_token=refresh_token)


@app.post("/api/auth/refresh", response_model=schemas.Token)
def refresh_tokens(payload: schemas.RefreshRequest, db: Session = Depends(get_db)):
    """Exchange a valid refresh token for a new token pair."""
    decoded = auth.decode_token(payload.refresh_token)
    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    token_hash = auth.hash_token(payload.refresh_token)
    rt = db.query(models.RefreshToken).filter(
        models.RefreshToken.token_hash == token_hash,
        models.RefreshToken.revoked == False,
    ).first()
    if not rt:
        raise HTTPException(status_code=401, detail="Refresh token revoked or not found")

    # Revoke old and issue new pair
    rt.revoked = True
    token_data = {"sub": decoded["sub"], "email": decoded["email"]}
    new_access = auth.create_access_token(token_data)
    new_refresh = auth.create_refresh_token(token_data)

    new_rt = models.RefreshToken(
        user_id=rt.user_id,
        token_hash=auth.hash_token(new_refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(new_rt)
    db.commit()
    return schemas.Token(access_token=new_access, refresh_token=new_refresh)


@app.post("/api/auth/logout", status_code=204)
def logout(payload: schemas.RefreshRequest, db: Session = Depends(get_db)):
    """Revoke a refresh token (client should also discard the access token)."""
    token_hash = auth.hash_token(payload.refresh_token)
    rt = db.query(models.RefreshToken).filter(
        models.RefreshToken.token_hash == token_hash
    ).first()
    if rt:
        rt.revoked = True
        db.commit()


# ─── User / Profile Routes ────────────────────────────────────────────────────

@app.get("/api/users/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    """Return the authenticated user's public info."""
    return current_user


@app.put("/api/users/me/profile", response_model=schemas.ProfileResponse)
def update_profile(
    payload: schemas.ProfileUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update user profile. The entire profile dict is AES-encrypted
    (Fernet) before being written to the database.
    """
    profile_data = payload.model_dump(exclude_none=True)
    current_user.encrypted_profile = encryption.encrypt_dict(profile_data)
    db.commit()
    db.refresh(current_user)
    return schemas.ProfileResponse(
        user_id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        profile=profile_data,
    )


@app.get("/api/users/me/profile", response_model=schemas.ProfileResponse)
def get_profile(
    current_user: models.User = Depends(auth.get_current_user),
):
    """Return the authenticated user's decrypted profile."""
    profile = None
    if current_user.encrypted_profile:
        profile = encryption.decrypt_dict(current_user.encrypted_profile)
    return schemas.ProfileResponse(
        user_id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        profile=profile,
    )


# ─── Wearable Sync Routes ─────────────────────────────────────────────────────

@app.post("/api/wearable/sync", response_model=schemas.WearableSyncResponse, status_code=201)
def sync_wearable(
    payload: schemas.WearableSync,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Ingest a wearable data record.
    The health-metrics payload is encrypted with Fernet before storage.
    Only metadata fields (data_type, record_date) are stored in plaintext
    to allow efficient filtering.
    """
    encrypted = encryption.encrypt_dict(payload.payload)
    record = models.WearableData(
        user_id=current_user.id,
        device_id=payload.device_id,
        device_type=payload.device_type,
        data_type=payload.data_type,
        record_date=payload.record_date,
        encrypted_payload=encrypted,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return schemas.WearableSyncResponse(
        id=record.id,
        user_id=record.user_id,
        device_type=record.device_type,
        data_type=record.data_type,
        record_date=record.record_date,
        synced_at=record.synced_at,
        payload=payload.payload,
    )


@app.get("/api/wearable/data", response_model=list[schemas.WearableSyncResponse])
def get_wearable_data(
    data_type: str = Query(None, description="Filter by data_type (e.g. 'heart_rate')"),
    record_date: str = Query(None, description="Filter by date (YYYY-MM-DD)"),
    limit: int = Query(50, le=200),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Return the current user's wearable records (decrypted on the fly)."""
    query = db.query(models.WearableData).filter(
        models.WearableData.user_id == current_user.id
    )
    if data_type:
        query = query.filter(models.WearableData.data_type == data_type)
    if record_date:
        query = query.filter(models.WearableData.record_date == record_date)

    records = query.order_by(models.WearableData.synced_at.desc()).limit(limit).all()

    results = []
    for r in records:
        decrypted = encryption.decrypt_dict(r.encrypted_payload)
        results.append(
            schemas.WearableSyncResponse(
                id=r.id,
                user_id=r.user_id,
                device_type=r.device_type,
                data_type=r.data_type,
                record_date=r.record_date,
                synced_at=r.synced_at,
                payload=decrypted,
            )
        )
    return results


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "Wearable Portal API"}
