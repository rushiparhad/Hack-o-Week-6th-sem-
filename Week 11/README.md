# User Registration Portal 👤🔐

> A secure and modern User Registration Portal built with FastAPI, JWT authentication, and encrypted user/wearable data storage. ✨

![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-111827?style=for-the-badge)
![Encryption](https://img.shields.io/badge/Security-Fernet%20Encryption-10B981?style=for-the-badge)

---

## 🌟 Project Overview

This project is a full-stack registration and authentication portal where users can:

- 📝 Register with email, username, and password
- 🔐 Log in securely and receive JWT tokens
- 👤 Manage personal profile details
- ⌚ Sync wearable health records
- 🛡️ Keep sensitive information encrypted at rest

It combines practical backend security concepts with an attractive frontend experience.

---

## 🚀 Highlights

| Feature | Description |
|---|---|
| ✅ User Registration | Create new user accounts with input validation |
| 🔑 Secure Login | JWT access + refresh token workflow |
| 🔄 Token Refresh | Session continuity with refresh endpoint |
| 🚪 Logout | Refresh token revocation support |
| 🔒 Password Security | Passwords hashed using bcrypt/passlib |
| 🧬 Encrypted Profile Data | Sensitive profile fields encrypted before DB storage |
| ❤️ Wearable Sync | Sync health metrics such as heart rate, steps, sleep, SpO₂ |
| 📱 Modern UI | Beautiful login + dashboard pages with responsive design |
| 🩺 Health Endpoint | Quick service status check with `/health` |

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI |
| Authentication | JWT (`python-jose`) |
| Password Hashing | Passlib/Bcrypt |
| Encryption | `cryptography` (Fernet) |
| ORM | SQLAlchemy |
| Database | SQLite |
| Validation | Pydantic |
| Frontend | HTML, CSS, JavaScript |

---

## 🗂️ Project Structure

```text
Week 11/
├── app.py                    # FastAPI app (single-file variant)
├── index.html                # Login/Register frontend page
├── dashboard.html            # User dashboard page
├── requirements.txt          # Root dependencies
├── portal.db                 # SQLite database file
├── backend/
│   ├── main.py               # Modular FastAPI backend app
│   ├── auth.py               # JWT + password utilities
│   ├── database.py           # DB engine and session setup
│   ├── models.py             # SQLAlchemy models
│   ├── schemas.py            # Pydantic schemas/validators
│   ├── encryption.py         # Fernet encryption helpers
│   ├── .env                  # Environment configuration
│   └── requirements.txt      # Backend-pinned dependencies
└── proj1.py                  # Optional/empty helper script
```

---

## ⚙️ Setup Guide

### 1. Clone and move into the folder

```bash
cd "Week 11"
```

### 2. Create and activate virtual environment (recommended)

```bash
python -m venv .venv
.venv\Scripts\activate
```

### 3. Install dependencies

Option A (backend-specific):

```bash
pip install -r backend/requirements.txt
```

Option B (root requirements):

```bash
pip install -r requirements.txt
```

### 4. Run the API server

```bash
uvicorn backend.main:app --reload
```

Server starts at: http://127.0.0.1:8000

### 5. Open frontend pages

- Open `index.html` in browser for login/registration.
- After login, navigate to `dashboard.html`.

---

## 🔐 Authentication Flow

```text
Register -> Login -> Get access + refresh token
       -> Call protected routes with Bearer access token
       -> Refresh token when access token expires
       -> Logout to revoke refresh token
```

---

## 🌐 API Endpoints

### Auth Routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get token pair |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Revoke refresh token |

### User Routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/users/me` | Get current user details |
| PUT | `/api/users/me/profile` | Update encrypted profile |
| GET | `/api/users/me/profile` | Get decrypted profile |

### Wearable Routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/wearable/sync` | Save encrypted wearable payload |
| GET | `/api/wearable/data` | Fetch wearable records (decrypted response) |

### Utility Route

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | API health check |

---

## 🧪 Example Health Data Payload

```json
{
  "device_id": "fitbit_001",
  "device_type": "fitbit",
  "data_type": "heart_rate",
  "record_date": "2026-03-25",
  "payload": {
    "value": 74,
    "unit": "bpm"
  }
}
```

---

## 🛡️ Security Notes

- Passwords are hashed, never stored in plaintext.
- Sensitive user profile and wearable payload data are encrypted before storage.
- Refresh token fingerprints are hashed in DB for safer token management.
- In production, always set strong secrets in `.env` and restrict CORS origins.

---

## 🔮 Future Enhancements

- 📧 Email verification flow
- 🔐 Role-based access control (RBAC)
- 📊 Trend charts for wearable metrics
- ☁️ Deployment on cloud (Render/Railway/AWS)
- 🧪 Automated tests (pytest + TestClient)

---

## 🙌 Conclusion

This User Registration Portal is a strong foundation for secure health-tech or fitness applications. It demonstrates practical authentication, encryption, and API design with a modern UI experience.

If you want, this can be extended into a complete production-ready health analytics platform. 🚀
