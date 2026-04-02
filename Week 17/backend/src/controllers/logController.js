const ExportLog = require('../models/ExportLog');

async function getExportLogs(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const search = (req.query.search || '').trim();

    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };

    if (search) {
      filter.format = { $regex: search, $options: 'i' };
    }

    const [logs, total] = await Promise.all([
      ExportLog.find(filter)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ExportLog.countDocuments(filter)
    ]);

    return res.status(200).json({
      logs: logs.map((log) => ({
        id: log._id,
        user: log.userId?.name || 'Unknown',
        email: log.userId?.email || 'Unknown',
        role: log.userId?.role || 'user',
        format: log.format,
        dateFrom: log.dateFrom,
        dateTo: log.dateTo,
        severity: log.severity,
        recordsExported: log.recordsExported,
        createdAt: log.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getExportLogs };
