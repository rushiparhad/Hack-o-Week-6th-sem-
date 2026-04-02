const express = require('express');
const { auth } = require('../middleware/auth');
const {
  ingestMetric,
  simulateMetric,
  getMetrics
} = require('../controllers/metricsController');

const router = express.Router();

router.get('/', auth, getMetrics);
router.post('/', auth, ingestMetric);
router.post('/simulate', auth, simulateMetric);

module.exports = router;
