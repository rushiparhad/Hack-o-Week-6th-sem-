import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';

/**
 * Alert Panel Component
 * Displays latest alerts with animations
 */
export default function AlertPanel({ alerts, onDismiss }) {
  const [displayAlerts, setDisplayAlerts] = useState([]);

  useEffect(() => {
    // Show last 5 alerts
    setDisplayAlerts(alerts.slice(-5));
  }, [alerts]);

  const getSeverityColor = (severity) => {
    if (severity === 'critical')
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-300 dark:border-red-700',
        icon: '🔴',
      };
    if (severity === 'warning')
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-300 dark:border-yellow-700',
        icon: '🟡',
      };
    return {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-300 dark:border-green-700',
      icon: '🟢',
    };
  };

  const playNotificationSound = () => {
    // Create a simple beep sound
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gain.gain.setValueAtTime(0.3, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    } catch (e) {
      console.log('Audio context not available');
    }
  };

  useEffect(() => {
    // Play sound for critical and warning alerts
    if (alerts.length > 0) {
      const latestAlert = alerts[alerts.length - 1];
      if (latestAlert.severity === 'critical' || latestAlert.severity === 'warning') {
        playNotificationSound();
      }
    }
  }, [alerts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Live Alerts
      </h2>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {displayAlerts.length > 0 ? (
            displayAlerts.slice().reverse().map((alert) => {
              const colors = getSeverityColor(alert.severity);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-3 rounded-lg border ${colors.bg} ${colors.border} relative group`}
                >
                  <div className="flex gap-3">
                    <div className="text-lg flex-shrink-0">{colors.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-1">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>

                  {/* Pulse animation for critical */}
                  {alert.severity === 'critical' && (
                    <motion.div
                      className="absolute inset-0 border border-red-500 rounded-lg pointer-events-none"
                      animate={{ opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No alerts yet</p>
              <p className="text-xs mt-1">All systems are operating normally</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Alert summary */}
      {alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <p className="font-semibold text-red-600 dark:text-red-400">
                {alerts.filter((a) => a.severity === 'critical').length}
              </p>
              <p className="text-slate-600 dark:text-slate-400">Critical</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                {alerts.filter((a) => a.severity === 'warning').length}
              </p>
              <p className="text-slate-600 dark:text-slate-400">Warning</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-green-600 dark:text-green-400">
                {alerts.filter((a) => a.severity === 'normal').length}
              </p>
              <p className="text-slate-600 dark:text-slate-400">Normal</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
