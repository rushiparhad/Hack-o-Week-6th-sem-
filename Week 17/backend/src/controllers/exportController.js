const ExportLog = require('../models/ExportLog');
const HealthMetric = require('../models/HealthMetric');
const { formatRows, generateCsv, generatePdf } = require('../services/exportService');
const { buildFilter, decorateMetric } = require('./metricsController');

async function exportData(req, res, next) {
  try {
    const { format } = req.params;

    if (!['csv', 'pdf'].includes(format)) {
      return res.status(400).json({ message: 'Unsupported export format' });
    }

    const filter = buildFilter(req.user._id, req.query);

    const docs = await HealthMetric.find(filter).sort({ measuredAt: 1 }).lean();
    const metrics = docs.map(decorateMetric);
    const rows = formatRows(metrics);

    await ExportLog.create({
      userId: req.user._id,
      format,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo) : undefined,
      severity: req.query.severity || 'all',
      recordsExported: rows.length
    });

    const timestamp = Date.now();

    if (format === 'csv') {
      const csv = generateCsv(rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=metrics-${timestamp}.csv`);
      return res.status(200).send(csv);
    }

    const pdfBuffer = await generatePdf(rows, {
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      severity: req.query.severity
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=metrics-${timestamp}.pdf`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
}

module.exports = { exportData };
