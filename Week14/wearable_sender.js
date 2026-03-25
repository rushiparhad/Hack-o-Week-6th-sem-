require('dotenv').config();

const { encryptPayload } = require('./encryption');

const API_URL = process.env.API_URL || 'http://localhost:8094/api/ingest';
const ENCRYPTION_SECRET = process.env.WEARABLE_ENCRYPTION_SECRET;

if (!ENCRYPTION_SECRET) {
  throw new Error('Missing WEARABLE_ENCRYPTION_SECRET in environment.');
}

function createSampleWearablePayload() {
  return {
    timestamp: new Date().toISOString(),
    heartRate: 88,
    spo2: 97,
    steps: 4521,
    calories: 268,
    activeMinutes: 42,
    stressLevel: 'moderate',
  };
}

async function sendEncryptedPayload() {
  const payload = createSampleWearablePayload();
  const cipherBlob = encryptPayload(payload, ENCRYPTION_SECRET);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deviceId: 'wearable-band-01',
      receivedAt: new Date().toISOString(),
      cipherBlob,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Ingest failed: ${result.error || response.statusText}`);
  }

  console.log('Encrypted ingest success:', result);
}

sendEncryptedPayload().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
