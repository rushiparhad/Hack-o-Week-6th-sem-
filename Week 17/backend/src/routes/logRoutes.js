const express = require('express');
const { auth } = require('../middleware/auth');
const { getExportLogs } = require('../controllers/logController');

const router = express.Router();

router.get('/', auth, getExportLogs);

module.exports = router;
