require('dotenv').config();
const express = require('express');
const cors = require('cors');
const activityRoutes = require('./routes/activity');

const app = express();

const defaultClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const localhostOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === defaultClientUrl || localhostOriginPattern.test(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/activity', activityRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const START_PORT = Number(process.env.PORT || 5000);
const MAX_PORT_ATTEMPTS = 10;

function startServer(port, attemptsLeft) {
  const server = app.listen(port, () => {
    console.log(`Dashboard API server running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use. Retrying on ${nextPort}...`);
      startServer(nextPort, attemptsLeft - 1);
      return;
    }

    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

startServer(START_PORT, MAX_PORT_ATTEMPTS);
