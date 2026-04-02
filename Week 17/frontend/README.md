# Frontend - Premium Analytics Dashboard

React + Vite frontend for a secure export analytics platform with real-time metric monitoring and anomaly highlights.

## Environment

Create `.env` from `.env.example`.

```env
VITE_API_URL=http://localhost:4000/api
```

## Scripts

- `npm run dev` start local development server
- `npm run build` create production bundle
- `npm run preview` preview production build
- `npm run lint` run ESLint checks

## UI Features

- Glassmorphism dashboard layout
- Light and dark mode with persistent preference
- Animated metric cards and alert badges (Framer Motion)
- Real-time and historical charts (line + bar)
- Secure export panel with filters and download progress
- Searchable/paginated export log table
- Toast notifications and loading skeletons
- Fully responsive across desktop and mobile

## Functional Flow

1. User authenticates
2. Dashboard fetches encrypted metrics (decrypted by API)
3. Anomaly engine flags high and critical BPM readings
4. User applies date/severity filters for export
5. CSV/PDF export downloaded with progress feedback
6. Export log list updates in dashboard

## Deployment (Vercel)

1. Import `frontend/` project into Vercel.
2. Add environment variable:
	- `VITE_API_URL=https://<your-backend-domain>/api`
3. Build command: `npm run build`
4. Output directory: `dist`
