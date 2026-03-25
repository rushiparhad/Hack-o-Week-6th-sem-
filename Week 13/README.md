# Dashboard Visualization Studio 📊✨

> A modern full-stack dashboard that turns activity data into clear insights with interactive charts, live refresh, and encrypted API communication. 🚀

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Charts-Recharts-FF6B6B?style=for-the-badge)
![Encryption](https://img.shields.io/badge/Security-AES--256--CBC-111827?style=for-the-badge&logo=shield&logoColor=white)

---

## 🌟 Why This Project?

This project demonstrates how to build a production-style analytics dashboard with:

- 📈 Beautiful data visualizations (line, bar, and pie charts)
- 🔒 Secure encrypted API payloads using AES-256-CBC
- ⚡ Fast frontend performance with React + Vite
- 📱 Responsive design with mobile-friendly navigation
- 🔁 Real-time style refresh workflow for updated metrics

---

## 🧠 Core Features

| Feature | Description |
|---|---|
| 📊 Activity Analytics | Visualize login, uploads, downloads, and active users trends |
| 🧱 KPI Cards | Quick insights with reusable stat cards |
| 📉 Line Chart | Multi-series daily trend tracking |
| 📦 Bar Chart | Upload vs download comparisons |
| 🥧 Pie Chart | Distribution of total activity |
| 🔄 Refresh Action | Manual refresh for latest data |
| ⏳ Loading + Retry | Better UX while fetching/decrypting |
| 🔐 Encrypted API | Backend encrypts and frontend decrypts safely |
| 📲 Responsive Layout | Sidebar and layout adapt to smaller screens |

---

## 🗂️ Folder Structure

```text
Week 13/
├── backend/
│   ├── routes/
│   │   └── activity.js
│   ├── utils/
│   │   └── encryption.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── charts/
    │   │   ├── ActivityLineChart.jsx
    │   │   ├── UploadsBarChart.jsx
    │   │   └── ActivityPieChart.jsx
    │   ├── components/
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── StatCard.jsx
    │   │   └── TopNav.jsx
    │   ├── pages/
    │   │   └── Dashboard.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   └── decrypt.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## ⚙️ Quick Setup

### 1. Start Backend 🔧

```bash
cd backend
npm install
npm run dev
```

Expected: backend runs on http://localhost:5000

Health check:

```http
GET /health
```

### 2. Start Frontend 🎨

```bash
cd frontend
npm install
npm run dev
```

Expected: frontend runs on http://localhost:5173

---

## 🔐 Encryption Flow (How Security Works)

```text
Backend JSON data
   -> encrypt with AES-256-CBC (random IV per response)
   -> send { iv, data }
   -> frontend decrypts using matching key
   -> render charts
```

Important:

- `backend/.env` uses `ENCRYPTION_KEY`
- `frontend/.env` uses `VITE_ENCRYPTION_KEY`
- Both keys must match exactly ✅

---

## 🌐 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/activity` | Returns encrypted activity payload |
| GET | `/health` | Backend health status |

Encrypted response format:

```json
{
  "iv": "hex_string",
  "data": "hex_string"
}
```

---

## 🧰 Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite 5 |
| Styling | TailwindCSS |
| Data Visualization | Recharts |
| Icons | lucide-react |
| Frontend Crypto | crypto-js |
| Backend | Node.js, Express |
| Backend Crypto | Node `crypto` module |

---

## 🔑 Environment Variables

### backend/.env

```env
PORT=5000
CLIENT_URL=http://localhost:5173
ENCRYPTION_KEY=my-dashboard-secret-key-32chars!
```

### frontend/.env

```env
VITE_API_BASE=
VITE_ENCRYPTION_KEY=my-dashboard-secret-key-32chars!
```

---

## 📌 Future Enhancements

- 📤 CSV/PDF report export
- 🌙 Dark mode toggle
- 🔔 Alert notifications for abnormal activity
- 🧪 Unit and integration tests
- ☁️ Cloud deployment with CI/CD

---