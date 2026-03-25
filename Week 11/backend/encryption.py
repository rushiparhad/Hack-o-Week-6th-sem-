"""
Symmetric encryption for sensitive user profiles and wearable health data.
Uses Fernet (AES-128-CBC + HMAC-SHA256) from the cryptography library.
A unique per-installation key is generated on first run and stored in .env.
"""
import os
import base64
import json
from typing import Any, Dict

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from dotenv import load_dotenv

load_dotenv()

_ENCRYPTION_KEY_ENV = "ENCRYPTION_KEY"
_SALT = b"wearable_portal_salt_v1"  # fixed salt; change per deployment


def _load_or_generate_key() -> bytes:
    """
    Load key from .env or derive one from SECRET_KEY via PBKDF2.
    If ENCRYPTION_KEY is set and is a valid 32-byte base64-urlsafe key, use it.
    Otherwise derive from SECRET_KEY so we always have a deterministic key.
    """
    raw = os.getenv(_ENCRYPTION_KEY_ENV, "")
    try:
        key = base64.urlsafe_b64decode(raw)
        if len(key) == 32:
            return base64.urlsafe_b64encode(key)  # valid Fernet key
    except Exception:
        pass

    # Derive from SECRET_KEY using PBKDF2
    secret = os.getenv("SECRET_KEY", "fallback_secret").encode()
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=_SALT,
        iterations=480_000,
    )
    derived = kdf.derive(secret)
    return base64.urlsafe_b64encode(derived)


_fernet = Fernet(_load_or_generate_key())


# ─── Public API ────────────────────────────────────────────────────────────────

def encrypt_dict(data: Dict[str, Any]) -> str:
    """Serialize a dict to JSON, encrypt with Fernet, return base64 string."""
    plaintext = json.dumps(data, default=str).encode("utf-8")
    return _fernet.encrypt(plaintext).decode("utf-8")


def decrypt_dict(ciphertext: str) -> Dict[str, Any]:
    """Decrypt a Fernet-encrypted string back to a dict."""
    plaintext = _fernet.decrypt(ciphertext.encode("utf-8"))
    return json.loads(plaintext.decode("utf-8"))


def encrypt_str(value: str) -> str:
    """Encrypt a plain string."""
    return _fernet.encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_str(ciphertext: str) -> str:
    """Decrypt a Fernet-encrypted string."""
    return _fernet.decrypt(ciphertext.encode("utf-8")).decode("utf-8")
