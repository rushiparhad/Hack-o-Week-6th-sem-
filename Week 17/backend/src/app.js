const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const metricRoutes = require('./routes/metricRoutes');
const exportRoutes = require('./routes/exportRoutes');
const logRoutes = require('./routes/logRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl === '*' ? true : env.clientUrl,
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/logs', logRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
