# Campus-Wide Sustainability Tracker

Production-ready full-stack dashboard for campus sustainability analytics with ensemble forecasting.

## What It Solves

The app tracks and predicts four key sustainability metrics:

- Carbon footprint (kg CO2)
- Energy consumption (kWh)
- Water usage (liters)
- Waste generation (kg)

It combines data engineering, forecasting, and a premium SaaS-style interface so administrators can monitor trends, detect anomalies, and act faster.

## Core Capabilities

- Time-series campus data ingestion and seeding
- Ensemble analytics: linear regression + moving average + exponential smoothing
- KPI cards with live updates and period-over-period comparison
- Drill-down filters by campus, department, building, and date range
- Building-vs-building comparison mode
- Smart anomaly detection and recommendations
- CSV export for reports
- Responsive light/dark modern UI with glassmorphism and animations

## Tech Stack

### Frontend

- React + Vite
- Tailwind CSS
- Recharts
- Framer Motion
- Lucide React

### Backend

- Node.js + Express
- MongoDB + Mongoose
- Zod
- json2csv

## Project Structure

```text
Week 10/
├── package.json
├── README.md
├── backend/
│   ├── data/
│   │   └── sampleData.js
│   ├── scripts/
│   │   └── seedData.js
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   └── styles/
    ├── tailwind.config.js
    └── postcss.config.js
```

## Setup (Step by Step)

### 1. Install dependencies

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure environment

PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Set these values in `backend/.env`:

```env
PORT=5050
MONGO_URI=mongodb://127.0.0.1:27017/campus_sustainability
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### 3. Seed sample data

```bash
npm run seed
```

### 4. Run full stack

```bash
npm run dev
```

### 5. Open locally

- Frontend: http://localhost:5173
- Backend: http://localhost:5050

## API Endpoints

Base path: `/api`

- `GET /api/health` health check
- `GET /api/dashboard` KPI + trends + anomalies + recommendations
- `GET /api/predictions` 7-day ensemble forecast
- `GET /api/drilldown` building/department drilldown + optional comparison
- `GET /api/filters` available filter metadata
- `GET /api/export/csv` export trend report
- `GET /api/stream` SSE stream for live KPI refresh

### Common Query Parameters

- `from`, `to` (YYYY-MM-DD)
- `campus`
- `department`
- `building`
- `compareA`, `compareB`

## Ensemble Modeling Notes

The forecast pipeline blends:

1. Linear regression forecast for trend direction
2. Exponential smoothing for recent signal stability
3. Weighted blending for final forecast values

Moving average is also computed for smoothed visualization in the dashboard.

## Deployment

### Frontend (Vercel)

- Set project root to `frontend`
- Build command: `npm run build`
- Output directory: `dist`

### Backend (Render or Railway)

- Set project root to `backend`
- Build command: `npm install`
- Start command: `npm run start`
- Environment variables:
  - `PORT`
  - `MONGO_URI` (MongoDB Atlas)
  - `CLIENT_ORIGIN`
  - `NODE_ENV=production`

### Database (MongoDB Atlas)

- Create cluster
- Add network access and DB user
- Use Atlas connection string in `MONGO_URI`

## Demo Readiness Checklist

- App starts without runtime errors
- Seed script inserts realistic data
- Filters, drilldown, and comparison work
- Forecast and smoothing charts render correctly
- Dark/light theme toggle works
- CSV export downloads successfully

## License

ISC
