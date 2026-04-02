const express = require('express');
const { auth } = require('../middleware/auth');
const { exportRateLimiter } = require('../middleware/rateLimiter');
const { exportData } = require('../controllers/exportController');

const router = express.Router();

router.get('/:format', auth, exportRateLimiter, exportData);

module.exports = router;
