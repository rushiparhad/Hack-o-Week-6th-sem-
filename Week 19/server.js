import express from 'express';
import { anomalyReports, encryptedDataAuditLogs, users } from './data/seed.js';

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';

app.use(express.json());
app.use(express.static('public'));

function getAuthenticatedUser(req) {
  const userId = req.header('x-user-id');
  if (!userId) {
    return null;
  }

  return users[userId] || null;
}

function requireAuth(req, res, next) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Provide a valid x-user-id header.'
    });
  }

  req.user = user;
  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role ${req.user.role} is not allowed for this resource.`
      });
    }

    next();
  };
}

app.get('/api/me', requireAuth, (req, res) => {
  res.json(req.user);
});

app.get('/api/admin/audit-logs', requireAuth, requireRole('admin'), (req, res) => {
  const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 100));
  const sortedLogs = [...encryptedDataAuditLogs].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  res.json({
    records: sortedLogs.slice(0, limit),
    count: sortedLogs.length
  });
});

app.get('/api/admin/anomaly-reports', requireAuth, requireRole('admin'), (req, res) => {
  const sortedReports = [...anomalyReports].sort((a, b) => {
    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
  });

  res.json({
    records: sortedReports,
    count: sortedReports.length
  });
});

app.listen(port, host, () => {
  console.log(`Admin audit service listening on http://${host}:${port}`);
});
