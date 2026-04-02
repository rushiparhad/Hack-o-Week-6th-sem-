import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { startDataSimulation } from './services/dataSimulator.js';
import { detectAnomaly } from './services/anomalyDetection.js';
import { Alert } from './models/Alert.js';
import { Metric } from './models/Metric.js';

// Load environment variables
dotenv.config();

// Initialize Express and Socket.io
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.SOCKET_CORS?.split(',') || ['http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory alert storage (for demo purposes, normally would use MongoDB)
const alerts = [];
const metrics = [];

// ============ SOCKET.IO EVENTS ============

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Send initial state
  socket.emit('initial_state', {
    alerts: alerts.slice(-20), // Last 20 alerts
    metrics: metrics.slice(-50), // Last 50 metrics
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ============ REST API ENDPOINTS ============

// Get all alerts
app.get('/api/alerts', (req, res) => {
  const { severity } = req.query;
  let filteredAlerts = alerts;

  if (severity) {
    filteredAlerts = alerts.filter((a) => a.severity === severity);
  }

  res.json({
    success: true,
    count: filteredAlerts.length,
    alerts: filteredAlerts.slice(-100), // Last 100 alerts
  });
});

// Get alert statistics
app.get('/api/stats', (req, res) => {
  const critical = alerts.filter((a) => a.severity === 'critical').length;
  const warning = alerts.filter((a) => a.severity === 'warning').length;
  const normal = alerts.filter((a) => a.severity === 'normal').length;

  res.json({
    success: true,
    stats: { critical, warning, normal },
    totalAlerts: alerts.length,
  });
});

// Get metrics
app.get('/api/metrics', (req, res) => {
  res.json({
    success: true,
    count: metrics.length,
    metrics: metrics.slice(-100),
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ DATA SIMULATION ============

// Simulate real-time BPM data
const simulateMetric = () => {
  // Generate realistic BPM values (60-120 normally, 100+ for anomalies)
  const baselineBPM = 75;
  const randomVariation = Math.random() * 30 - 15; // ±15 variation
  let bpm = baselineBPM + randomVariation;

  // 15% chance of anomaly (high BPM)
  if (Math.random() < 0.15) {
    bpm = 100 + Math.random() * 40; // 100-140 BPM
  }

  bpm = Math.round(bpm);
  
  // Ensure BPM is within valid range
  bpm = Math.max(40, Math.min(200, bpm));

  const metric = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    bpm: parseInt(bpm, 10), // Explicitly convert to integer
    heart_rate: parseInt(bpm, 10),
    oxygen: Math.round((95 + Math.random() * 5) * 10) / 10,
    temperature: Math.round((36.5 + Math.random() * 2) * 10) / 10,
  };

  metrics.push(metric);
  if (metrics.length > 500) metrics.shift(); // Keep only last 500

  // Detect anomaly
  const anomaly = detectAnomaly(bpm);

  if (anomaly.isAnomaly) {
    const alert = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      severity: anomaly.severity,
      message: anomaly.message,
      value: bpm,
      type: 'BPM_ANOMALY',
      read: false,
    };

    alerts.push(alert);
    if (alerts.length > 500) alerts.shift(); // Keep only last 500

    // Broadcast alert to all connected clients
    io.emit('new_alert', alert);
    io.emit('metric_update', metric);

    console.log(`🚨 Alert: ${alert.severity.toUpperCase()} - BPM: ${bpm}`);
  } else {
    // Still emit metric update even if no anomaly
    io.emit('metric_update', metric);
  }
};

// Start data simulation every 1 second
setInterval(simulateMetric, 1000);

// ============ START SERVER ============

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🏥 Real-Time Alert System Backend   ║
║          Server Running               ║
╚════════════════════════════════════════╝
📍 http://localhost:${PORT}
🔌 WebSocket: ws://localhost:${PORT}
✨ Ready to receive client connections
  `);
});
