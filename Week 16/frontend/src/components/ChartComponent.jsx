import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';

/**
 * Chart Component
 * Real-time BPM line chart with Recharts
 */
export default function ChartComponent({ metrics, isDark }) {
  // Format data for chart
  const chartData = useMemo(() => {
    return metrics
      .slice(-50) // Show last 50 data points
      .map((m) => ({
        timestamp: new Date(m.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        bpm: m.bpm,
        oxygen: m.oxygen,
        temperature: (m.temperature * 10).toFixed(1), // Scale for visibility
      }));
  }, [metrics]);

  const colors = isDark
    ? {
        grid: '#334155',
        text: '#cbd5e1',
      }
    : {
        grid: '#e2e8f0',
        text: '#64748b',
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>📊</span> Vital Signs Trend
      </h2>

      <div className="w-full h-80 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.grid}
                opacity={0.3}
              />
              <XAxis
                dataKey="timestamp"
                stroke={colors.text}
                fontSize={12}
                interval={Math.max(0, Math.floor(chartData.length / 5) - 1)}
              />
              <YAxis stroke={colors.text} fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  color: isDark ? '#f1f5f9' : '#1e293b',
                }}
                cursor={{ stroke: isDark ? '#475569' : '#cbd5e1' }}
              />
              <Legend />

              {/* Alert thresholds */}
              <ReferenceLine
                y={100}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{ value: 'Warning (100)', position: 'right', fill: colors.text, fontSize: 12 }}
              />
              <ReferenceLine
                y={120}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{ value: 'Critical (120)', position: 'right', fill: colors.text, fontSize: 12 }}
              />

              {/* Lines */}
              <Line
                type="monotone"
                dataKey="bpm"
                stroke="#8b5cf6"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
                name="Heart Rate (BPM)"
              />
              <Line
                type="monotone"
                dataKey="oxygen"
                stroke="#06b6d4"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
                name="Oxygen (%)"
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#ec4899"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
                name="Temp (°C × 10)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            Waiting for data...
          </div>
        )}
      </div>

      {/* Legend info */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span className="text-slate-600 dark:text-slate-400">Heart Rate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-cyan-500" />
          <span className="text-slate-600 dark:text-slate-400">Oxygen</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-pink-500" />
          <span className="text-slate-600 dark:text-slate-400">Temperature</span>
        </div>
      </div>
    </motion.div>
  );
}
