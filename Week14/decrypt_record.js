require('dotenv').config();

const RECORD_ID = process.argv[2] || '1';
const BASE_URL = process.env.BASE_URL || 'http://localhost:8094';

async function run() {
  const response = await fetch(`${BASE_URL}/api/records/${RECORD_ID}/decrypt`);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }

  console.log(JSON.stringify(body, null, 2));
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
