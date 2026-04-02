import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Download, Filter } from 'lucide-react';

/**
 * Alert History Component
 * Displays detailed history of all alerts
 */
export default function AlertHistory({ alerts }) {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filteredAlerts = useMemo(() => {
    if (filterSeverity === 'all') return alerts;
    return alerts.filter((a) => a.severity === filterSeverity);
  }, [alerts, filterSeverity]);

  const getSeverityBadge = (severity) => {
    const classes = {
      critical: 'badge-danger',
      warning: 'badge-warning',
      normal: 'badge-success',
    };
    return classes[severity] || classes.normal;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: '🔴',
      warning: '🟡',
      normal: '🟢',
    };
    return icons[severity] || icons.normal;
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Timestamp', 'Severity', 'Message', 'Value'],
      ...filteredAlerts.map((a) => [
        new Date(a.timestamp).toLocaleString(),
        a.severity,
        a.message,
        a.value,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alerts-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span>📋</span> Alert History
        </h2>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <Filter className="w-4 h-4 text-slate-500 mt-2.5" />
        <div className="flex gap-2">
          {['all', 'critical', 'warning', 'normal'].map((severity) => (
            <button
              key={severity}
              onClick={() => setFilterSeverity(severity)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                filterSeverity === severity
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alert list */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
        {filteredAlerts.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredAlerts
              .slice()
              .reverse()
              .map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === alert.id ? null : alert.id)
                    }
                    className="w-full px-4 py-3 text-left flex items-center justify-between"
                  >
                    <div className="flex-1 flex items-center gap-3">
                      <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm line-clamp-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className={getSeverityBadge(alert.severity)}>
                        {alert.severity}
                      </div>
                    </div>
                    <motion.div
                      animate={{
                        rotate: expandedId === alert.id ? 180 : 0,
                      }}
                    >
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </motion.div>
                  </button>

                  {/* Expanded details */}
                  {expandedId === alert.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="px-4 py-3 bg-slate-100 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700"
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">
                            Type
                          </p>
                          <p className="font-medium">{alert.type}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">
                            Value
                          </p>
                          <p className="font-medium">{alert.value}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">
                            Message
                          </p>
                          <p className="font-medium">{alert.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <p className="text-sm">No alerts found</p>
          </div>
        )}
      </div>

      {/* Stats footer */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
        Showing {filteredAlerts.length} of {alerts.length} alerts
      </div>
    </motion.div>
  );
}
