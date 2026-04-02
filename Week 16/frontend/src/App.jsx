import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import BPMCard from './components/BPMCard';
import ChartComponent from './components/ChartComponent';
import AlertPanel from './components/AlertPanel';
import AlertHistory from './components/AlertHistory';
import StatusIndicator from './components/StatusIndicator';
import socketService from './services/socketService';

/**
 * Main App Component
 * Orchestrates all dashboard components and manages real-time data
 */
export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Data states
  const [currentBPM, setCurrentBPM] = useState(0);
  const [severity, setSeverity] = useState('normal');
  const [metrics, setMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const connectionRef = useRef(false);
  const alertIdsRef = useRef(new Set());

  // Apply theme
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      html.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Connect to WebSocket
  useEffect(() => {
    const connectToBackend = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);
        connectionRef.current = true;

        // Listen for initial state
        socketService.onInitialState((data) => {
          console.log('📥 Received initial state:', data);
          if (data.metrics) setMetrics(data.metrics);
          if (data.alerts) {
            setAlerts(data.alerts);
            data.alerts.forEach((a) => alertIdsRef.current.add(a.id));
          }
        });

        // Listen for metric updates
        socketService.onMetricUpdate((metric) => {
          // Validate BPM value
          const validBPM = metric?.bpm ? Math.max(0, Math.min(200, parseInt(metric.bpm, 10))) : 0;
          
          setMetrics((prev) => {
            const updated = [...prev, metric];
            return updated.slice(-100); // Keep last 100
          });
          setCurrentBPM(validBPM);

          // Update severity based on BPM
          if (validBPM >= 120) {
            setSeverity('critical');
          } else if (validBPM >= 100) {
            setSeverity('warning');
          } else if (validBPM <= 50) {
            setSeverity('warning');
          } else {
            setSeverity('normal');
          }
        });

        // Listen for new alerts
        socketService.onNewAlert((alert) => {
          console.log('🚨 New alert:', alert);
          
          // Avoid duplicate alerts
          if (!alertIdsRef.current.has(alert.id)) {
            alertIdsRef.current.add(alert.id);
            setAlerts((prev) => [...prev, alert]);

            // Show notification
            showDesktopNotification(alert);
          }
        });
      } catch (error) {
        console.error('❌ Connection failed:', error);
        setIsConnected(false);
        
        // Retry after 3 seconds
        setTimeout(connectToBackend, 3000);
      }
    };

    connectToBackend();

    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, []);

  // Desktop notification
  const showDesktopNotification = (alert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🏥 Health Alert', {
        body: alert.message,
        icon: '🏥',
        tag: 'health-alert',
        requireInteraction: alert.severity === 'critical',
      });
    }
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Handle alert dismiss
  const handleDismissAlert = (alertId) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setDismissedAlerts((prev) => {
        const next = new Set(prev);
        next.delete(alertId);
        return next;
      });
    }, 300);
  };

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id));

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {/* Header */}
        <Header isDark={isDark} setIsDark={setIsDark} />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Connection status banner */}
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300"
            >
              <p className="font-semibold">⚠️ Backend Connection Lost</p>
              <p className="text-sm mt-1">
                Attempting to reconnect to server... Make sure backend is running on
                http://localhost:5000
              </p>
            </motion.div>
          )}

          {/* Top Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* BPM Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <BPMCard currentBPM={currentBPM} severity={severity} />
            </motion.div>

            {/* Status Indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <StatusIndicator isConnected={isConnected} alertCount={alerts.length} />
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4">📈 Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Avg BPM (last min)
                  </span>
                  <span className="font-bold">
                    {metrics.length > 0
                      ? Math.round(
                          metrics
                            .slice(-60)
                            .reduce((sum, m) => sum + m.bpm, 0) /
                            Math.min(60, metrics.length)
                        )
                      : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Avg Oxygen
                  </span>
                  <span className="font-bold">
                    {metrics.length > 0
                      ? (
                          metrics
                            .slice(-60)
                            .reduce((sum, m) => sum + m.oxygen, 0) /
                            Math.min(60, metrics.length)
                        ).toFixed(1)
                      : '--'}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Data Points
                  </span>
                  <span className="font-bold">{metrics.length}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <ChartComponent metrics={metrics} isDark={isDark} />
          </motion.div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alert Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-1"
            >
              <AlertPanel
                alerts={visibleAlerts}
                onDismiss={handleDismissAlert}
              />
            </motion.div>

            {/* Alert History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-2"
            >
              <AlertHistory alerts={alerts} />
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 py-8 px-4">
          <div className="max-w-7xl mx-auto text-center text-sm text-slate-600 dark:text-slate-400">
            <p>🏥 Real-Time Alert System Dashboard</p>
            <p className="mt-2">
              Built with React, Socket.io, and Recharts • Created for healthcare monitoring
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
