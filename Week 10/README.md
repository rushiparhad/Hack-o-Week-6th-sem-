# Campus-wide Sustainability Tracker 🌍

> Turning raw campus data into smart sustainability action. 📊♻️

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-3C873A?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

---

## ✨ Project Vision

Campuses produce huge sustainability signals every day: energy usage, water consumption, and resource efficiency patterns.

This project builds a **campus intelligence dashboard** that helps administrators and student leaders:

- detect high-impact areas quickly 🔎
- monitor trends over time 📈
- take data-driven sustainability decisions 🌱
- communicate outcomes with export-ready reports 🧾

---

## 🚀 Key Features

- KPI cards for top-level sustainability indicators
- Forecasting panel for trend anticipation
- Drill-down analytics by department and building
- Global filters for date range, building, and department
- CSV export from API and PDF-friendly frontend reporting
- Responsive UI for desktop and laptop dashboards

---

## 🧠 System Flow

```text
React (Vite) Dashboard UI
        |
        | HTTP (Axios)
        v
Express API (routes -> controllers -> services)
        |
        | Mongoose
        v
MongoDB
```

---

## 🛠️ Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React, Vite, Recharts, Axios, date-fns, jsPDF |
| Backend | Node.js, Express, Mongoose, Zod, json2csv |
| Tooling | Concurrently, Nodemon, ESLint |

---

## 📁 Week 10 Structure

```text
Week 10/
├── package.json
├── README.md
├── server/      # primary backend used by root scripts
├── client/      # primary frontend used by root scripts
├── backend/     # alternate/parallel backend track
└── frontend/    # alternate/parallel frontend track
```

---

## ⚡ Quick Start

### 1) Install dependencies

```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2) Configure backend environment

PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

Recommended `server/.env` values:

```env
PORT=5050
MONGO_URI=mongodb://127.0.0.1:27017/campus_sustainability
CLIENT_ORIGIN=http://localhost:5173,http://localhost:5175
```

### 3) Seed sample data

```bash
npm run seed
```

### 4) Run full stack

```bash
npm run dev
```

Local URLs:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5050

---

## 🎛️ Available Scripts

### Root

```bash
npm run dev     # run client + server in parallel
npm run build   # build client
npm run start   # start server in production mode
npm run seed    # seed sustainability data
```

### Client

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Server

```bash
npm run dev
npm run start
npm run seed
```

---

## 🌐 API Overview

Base path: `/api`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/health | Health check |
| GET | /api/dashboard | KPI + chart payload |
| GET | /api/predictions | Forecast analytics |
| GET | /api/drilldown | Building and department insights |
| GET | /api/filters | Available filter values |
| GET | /api/export/csv | Export filtered data as CSV |

Common query params:

- `from` (YYYY-MM-DD)
- `to` (YYYY-MM-DD)
- `department`
- `building`

---

## 💡 Impact on Campus Operations

- Better resource allocation for sustainability teams
- Faster identification of high-consumption zones
- More transparent sustainability reporting
- Stronger decision-making for campus planning

---

## 🔭 Next Improvements

- Role-based authentication and admin views
- Automated weekly sustainability summaries via email
- Real-time anomaly alerts for usage spikes
- Multi-campus benchmarking and comparisons

---

## 🏁 Final Note

Sustainability is not just about tracking numbers.
It is about enabling smarter daily decisions across the entire campus ecosystem.

**Measure clearly. Act faster. Build greener campuses.** 🌿

---

## 📄 License

ISC
