# Week14 - Data Encryption Pipeline

This project implements an end-to-end encryption pipeline for incoming wearable JSON data.

- Encryption: `CryptoJS` AES-256-CBC + HMAC-SHA256
- Storage: SQLite database containing only ciphertext + metadata
- API: Encrypted ingest endpoint and record retrieval

## Files

- `server.js` - Express API for ingesting/storing ciphertext records
- `encryption.js` - Shared CryptoJS encrypt/decrypt utilities
- `db.js` - SQLite schema and queries
- `wearable_sender.js` - Simulated wearable client that encrypts before sending
- `decrypt_record.js` - Helper script to decrypt a stored record
- `.env.example` - Environment template

## Setup

```bash
cd Week14
cp .env.example .env
npm install
```

Set a strong secret in `.env`:

```env
WEARABLE_ENCRYPTION_SECRET=replace-with-a-very-strong-secret
```

## Run

Start server:

```bash
npm start
```

Send encrypted wearable sample:

```bash
npm run send:test
```

View ciphertext records:

```bash
curl "http://localhost:8094/api/records?limit=10"
```

Decrypt one record for validation:

```bash
npm run decrypt:test -- 1
```

## API Contract

### `POST /api/ingest`

Request body:

```json
{
  "deviceId": "wearable-band-01",
  "receivedAt": "2026-03-25T14:00:00.000Z",
  "cipherBlob": {
    "algorithm": "AES-256-CBC",
    "iv": "hex-string",
    "ciphertext": "base64-string",
    "hmac": "hex-string"
  }
}
```

### `GET /api/records`
Returns stored ciphertext records from SQLite.

### `GET /api/records/:id/decrypt`
Decrypts a stored record server-side using `WEARABLE_ENCRYPTION_SECRET`.
