import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Wifi, WifiOff } from 'lucide-react';

/**
 * Status Indicator Component
 * Displays connection status and other system info
 */
export default function StatusIndicator({ isConnected, alertCount }) {
  const [pulseAnimation, setPulseAnimation] = React.useState(true);

  useEffect(() => {
    // Breathing animation based on status
    const interval = setInterval(() => {
      setPulseAnimation((prev) => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        System Status
      </h3>

      {/* Connection Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-sm">Backend Connected</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    ws://localhost:5000
                  </p>
                </div>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400 animate-pulse" />
                <div>
                  <p className="font-semibold text-sm">Disconnected</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Retrying connection...
                  </p>
                </div>
              </>
            )}
          </div>
          <motion.div
            animate={{ scale: isConnected ? [1, 1.2, 1] : 0 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-green-500"
          />
        </div>

        {/* Alert Count */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {alertCount || 0}
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              Total Alerts
            </p>
          </div>

          <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {new Date().toLocaleTimeString()}
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              Current Time
            </p>
          </div>
        </div>

        {/* System Health */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-300 dark:border-blue-700">
          <p className="font-semibold text-sm text-blue-700 dark:text-blue-300">
            ✨ System Healthy
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            All systems operating normally
          </p>
        </div>
      </div>
    </motion.div>
  );
}
