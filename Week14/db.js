const sqlite3 = require('sqlite3').verbose();

function createDb(dbPath) {
  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run(
      `
      CREATE TABLE IF NOT EXISTS encrypted_wearable_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        algorithm TEXT NOT NULL,
        iv TEXT NOT NULL,
        ciphertext TEXT NOT NULL,
        hmac TEXT NOT NULL,
        received_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
      `
    );

    db.run(
      'CREATE INDEX IF NOT EXISTS idx_device_created ON encrypted_wearable_data(device_id, created_at)'
    );
  });

  return db;
}

function insertCipherRecord(db, record) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO encrypted_wearable_data
        (device_id, algorithm, iv, ciphertext, hmac, received_at)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        record.deviceId,
        record.algorithm,
        record.iv,
        record.ciphertext,
        record.hmac,
        record.receivedAt,
      ],
      function onInsert(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      }
    );
  });
}

function getRecentRecords(db, limit = 20) {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT id, device_id, algorithm, iv, ciphertext, hmac, received_at, created_at
      FROM encrypted_wearable_data
      ORDER BY id DESC
      LIMIT ?
      `,
      [limit],
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      }
    );
  });
}

function getRecordById(db, id) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT id, device_id, algorithm, iv, ciphertext, hmac, received_at, created_at
      FROM encrypted_wearable_data
      WHERE id = ?
      `,
      [id],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      }
    );
  });
}

module.exports = {
  createDb,
  insertCipherRecord,
  getRecentRecords,
  getRecordById,
};
