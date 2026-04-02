const HealthMetric = require('../models/HealthMetric');
const { encryptValue, decryptValue } = require('../services/cryptoService');
const { detectAnomaly } = require('../services/anomalyService');

function parseDateRange(query) {
  const dateFrom = query.dateFrom ? new Date(query.dateFrom) : null;
  const dateTo = query.dateTo ? new Date(query.dateTo) : null;

  return {
    dateFrom: Number.isNaN(dateFrom?.getTime()) ? null : dateFrom,
    dateTo: Number.isNaN(dateTo?.getTime()) ? null : dateTo
  };
}

function buildFilter(userId, query) {
  const { dateFrom, dateTo } = parseDateRange(query);
  const filter = { userId };

  if (dateFrom || dateTo) {
    filter.measuredAt = {};
    if (dateFrom) filter.measuredAt.$gte = dateFrom;
    if (dateTo) filter.measuredAt.$lte = dateTo;
  }

  if (query.severity && query.severity !== 'all') {
    filter.severity = query.severity;
  }

  return filter;
}

function decorateMetric(metricDoc) {
  const bpm = Number(decryptValue(metricDoc.bpmEncrypted));

  return {
    id: metricDoc._id,
    bpm,
    isAnomaly: metricDoc.isAnomaly,
    severity: metricDoc.severity,
    anomalyReason: metricDoc.anomalyReason,
    measuredAt: metricDoc.measuredAt
  };
}

async function ingestMetric(req, res, next) {
  try {
    const { bpm, measuredAt } = req.body;

    if (typeof bpm !== 'number' || bpm < 30 || bpm > 240) {
      return res.status(400).json({ message: 'bpm must be a number between 30 and 240' });
    }

    const anomaly = detectAnomaly(bpm);
    const metric = await HealthMetric.create({
      userId: req.user._id,
      bpmEncrypted: encryptValue(String(bpm)),
      isAnomaly: anomaly.isAnomaly,
      severity: anomaly.severity,
      anomalyReason: anomaly.reason,
      measuredAt: measuredAt ? new Date(measuredAt) : new Date()
    });

    return res.status(201).json({ metric: decorateMetric(metric) });
  } catch (error) {
    return next(error);
  }
}

async function simulateMetric(req, res, next) {
  try {
    const bpm = Math.floor(Math.random() * (145 - 58 + 1)) + 58;
    req.body = { bpm };
    return ingestMetric(req, res, next);
  } catch (error) {
    return next(error);
  }
}

async function getMetrics(req, res, next) {
  try {
    const filter = buildFilter(req.user._id, req.query);
    const limit = Math.min(Number(req.query.limit) || 120, 500);

    const metricsDocs = await HealthMetric.find(filter)
      .sort({ measuredAt: -1 })
      .limit(limit)
      .lean();

    const metrics = metricsDocs.reverse().map(decorateMetric);

    const anomalies = metrics.filter((metric) => metric.isAnomaly).length;
    const avgBpm = metrics.length
      ? Math.round(metrics.reduce((sum, item) => sum + item.bpm, 0) / metrics.length)
      : 0;

    return res.status(200).json({
      metrics,
      summary: {
        liveBpm: metrics.length ? metrics[metrics.length - 1].bpm : 0,
        avgBpm,
        anomalies,
        totalReadings: metrics.length
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  ingestMetric,
  simulateMetric,
  getMetrics,
  buildFilter,
  decorateMetric
};
