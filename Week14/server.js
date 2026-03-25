require('dotenv').config();

const express = require('express');
const {
  createDb,
  insertCipherRecord,
  getRecentRecords,
  getRecordById,
} = require('./db');
const { decryptPayload } = require('./encryption');

const PORT = Number(process.env.PORT || 8094);
const ENCRYPTION_SECRET = process.env.WEARABLE_ENCRYPTION_SECRET;
const DB_PATH = process.env.DB_PATH || 'wearable_encrypted.db';

if (!ENCRYPTION_SECRET) {
  throw new Error(
    'Missing WEARABLE_ENCRYPTION_SECRET in environment. Add it in .env file.'
  );
}

const app = express();
const db = createDb(DB_PATH);

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', encryption: 'enabled', timestamp: Date.now() });
});

app.post('/api/ingest', async (req, res) => {
  try {
    const { deviceId, cipherBlob, receivedAt } = req.body || {};

    if (!deviceId || !cipherBlob) {
      return res.status(400).json({
        error: 'deviceId and cipherBlob are required.',
      });
    }

    const { algorithm, iv, ciphertext, hmac } = cipherBlob;
    if (!algorithm || !iv || !ciphertext || !hmac) {
      return res.status(400).json({
        error: 'cipherBlob must include algorithm, iv, ciphertext, and hmac.',
      });
    }

    const id = await insertCipherRecord(db, {
      deviceId,
      algorithm,
      iv,
      ciphertext,
      hmac,
      receivedAt: receivedAt || new Date().toISOString(),
    });

    return res.status(201).json({
      message: 'Encrypted payload stored successfully.',
      id,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/records', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const rows = await getRecentRecords(db, limit);

    res.json({
      count: rows.length,
      records: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/records/:id/decrypt', async (req, res) => {
  try {
    const row = await getRecordById(db, Number(req.params.id));
    if (!row) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    const plaintext = decryptPayload(
      {
        iv: row.iv,
        ciphertext: row.ciphertext,
        hmac: row.hmac,
      },
      ENCRYPTION_SECRET
    );

    return res.json({
      id: row.id,
      deviceId: row.device_id,
      decryptedPayload: plaintext,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Week14 encryption server running on http://localhost:${PORT}`);
  console.log(`Using encrypted SQLite DB: ${DB_PATH}`);
});
