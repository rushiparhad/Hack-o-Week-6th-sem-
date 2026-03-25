const express = require('express');
const router = express.Router();
const { encrypt } = require('../utils/encryption');

// Sample activity data — replace with MongoDB queries as needed
const activityData = [
  { date: '2026-02-01', loginCount: 98,  uploads: 32, downloads: 55, activeUsers: 45 },
  { date: '2026-02-02', loginCount: 112, uploads: 40, downloads: 62, activeUsers: 52 },
  { date: '2026-02-03', loginCount: 87,  uploads: 28, downloads: 41, activeUsers: 38 },
  { date: '2026-02-04', loginCount: 134, uploads: 53, downloads: 78, activeUsers: 64 },
  { date: '2026-02-05', loginCount: 145, uploads: 61, downloads: 85, activeUsers: 71 },
  { date: '2026-02-06', loginCount: 119, uploads: 44, downloads: 67, activeUsers: 58 },
  { date: '2026-02-07', loginCount: 156, uploads: 72, downloads: 91, activeUsers: 82 },
  { date: '2026-02-08', loginCount: 103, uploads: 35, downloads: 49, activeUsers: 47 },
  { date: '2026-02-09', loginCount: 127, uploads: 48, downloads: 73, activeUsers: 61 },
  { date: '2026-02-10', loginCount: 142, uploads: 58, downloads: 82, activeUsers: 69 },
  { date: '2026-02-11', loginCount: 168, uploads: 74, downloads: 96, activeUsers: 87 },
  { date: '2026-02-12', loginCount: 131, uploads: 52, downloads: 77, activeUsers: 63 },
  { date: '2026-02-13', loginCount: 115, uploads: 43, downloads: 64, activeUsers: 55 },
  { date: '2026-02-14', loginCount: 189, uploads: 89, downloads: 112, activeUsers: 98 },
  { date: '2026-02-15', loginCount: 143, uploads: 61, downloads: 84, activeUsers: 72 },
  { date: '2026-02-16', loginCount: 122, uploads: 47, downloads: 69, activeUsers: 59 },
  { date: '2026-02-17', loginCount: 158, uploads: 76, downloads: 93, activeUsers: 84 },
  { date: '2026-02-18', loginCount: 135, uploads: 55, downloads: 79, activeUsers: 66 },
  { date: '2026-02-19', loginCount: 147, uploads: 63, downloads: 88, activeUsers: 75 },
  { date: '2026-02-20', loginCount: 176, uploads: 82, downloads: 104, activeUsers: 93 },
  { date: '2026-02-21', loginCount: 162, uploads: 77, downloads: 98, activeUsers: 88 },
  { date: '2026-02-22', loginCount: 138, uploads: 57, downloads: 81, activeUsers: 68 },
  { date: '2026-02-23', loginCount: 125, uploads: 49, downloads: 71, activeUsers: 62 },
  { date: '2026-02-24', loginCount: 153, uploads: 68, downloads: 90, activeUsers: 79 },
  { date: '2026-02-25', loginCount: 171, uploads: 80, downloads: 101, activeUsers: 90 },
  { date: '2026-02-26', loginCount: 144, uploads: 62, downloads: 85, activeUsers: 73 },
  { date: '2026-02-27', loginCount: 133, uploads: 54, downloads: 78, activeUsers: 65 },
  { date: '2026-02-28', loginCount: 160, uploads: 75, downloads: 95, activeUsers: 85 },
  { date: '2026-03-01', loginCount: 120, uploads: 45, downloads: 60, activeUsers: 55 },
  { date: '2026-03-02', loginCount: 148, uploads: 65, downloads: 87, activeUsers: 76 },
  { date: '2026-03-03', loginCount: 167, uploads: 78, downloads: 99, activeUsers: 88 },
  { date: '2026-03-04', loginCount: 139, uploads: 58, downloads: 82, activeUsers: 69 },
  { date: '2026-03-05', loginCount: 154, uploads: 70, downloads: 92, activeUsers: 81 },
  { date: '2026-03-06', loginCount: 172, uploads: 83, downloads: 106, activeUsers: 94 },
  { date: '2026-03-07', loginCount: 145, uploads: 64, downloads: 86, activeUsers: 74 },
  { date: '2026-03-08', loginCount: 161, uploads: 76, downloads: 97, activeUsers: 86 },
  { date: '2026-03-09', loginCount: 178, uploads: 85, downloads: 109, activeUsers: 96 },
  { date: '2026-03-10', loginCount: 155, uploads: 71, downloads: 93, activeUsers: 82 },
  { date: '2026-03-11', loginCount: 183, uploads: 88, downloads: 114, activeUsers: 101 },
  { date: '2026-03-12', loginCount: 196, uploads: 94, downloads: 122, activeUsers: 108 },
];

router.get('/', (req, res) => {
  try {
    const payload = JSON.stringify(activityData);
    const encrypted = encrypt(payload);
    res.json(encrypted);
  } catch (err) {
    console.error('Encryption error:', err);
    res.status(500).json({ error: 'Failed to process data' });
  }
});

module.exports = router;
