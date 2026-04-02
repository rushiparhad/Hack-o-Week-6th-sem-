# Backend - Secure Export Analytics API

## Environment

Create `.env` from `.env.example`.

```env
PORT=4000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/user-export-analytics
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
AES_SECRET=replace_with_32_byte_or_longer_secret
CLIENT_URL=http://localhost:5173
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin@12345
```

## Scripts

- `npm run dev` start with nodemon
- `npm run start` start production server
- `npm run seed` create sample users + sample BPM readings

## Security Design

- JWT auth for protected routes
- AES-256-GCM encryption for BPM values before DB write
- Decryption only for read/export transformations
- Export endpoint rate limiting to reduce abuse
- Helmet + CORS + centralized error handling

## Main API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Metrics

- `GET /api/metrics?dateFrom=&dateTo=&severity=&limit=`
- `POST /api/metrics` with body `{ "bpm": 88, "measuredAt": "ISO" }`
- `POST /api/metrics/simulate`

### Export

- `GET /api/export/csv?dateFrom=&dateTo=&severity=`
- `GET /api/export/pdf?dateFrom=&dateTo=&severity=`

### Logs

- `GET /api/logs?page=1&limit=10&search=csv`

## Seed Data

`npm run seed` generates:

- Admin user (`SEED_ADMIN_EMAIL`)
- Demo user (`demo.user@example.com`)
- 90 metric records over historical timeline with anomalies

## Deployment Notes (Render/Railway)

1. Provision MongoDB Atlas and whitelist app IP.
2. Create backend service from this folder.
3. Set all environment variables from `.env.example`.
4. Build command: `npm install`
5. Start command: `npm run start`
6. Set frontend URL in `CLIENT_URL`.
