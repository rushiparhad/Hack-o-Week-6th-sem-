import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

/**
 * BPM Card Component
 * Displays current BPM with animated value
 */
export default function BPMCard({ currentBPM = 0, severity }) {
  const [displayBPM, setDisplayBPM] = useState(0);

  // Validate and sanitize BPM (should be 40-200)
  const validBPM = Math.max(0, Math.min(200, typeof currentBPM === 'number' ? currentBPM : 0));

  useEffect(() => {
    let interval;
    const diff = validBPM - displayBPM;
    
    if (Math.abs(diff) > 0.5) {
      interval = setInterval(() => {
        setDisplayBPM((prev) => {
          // Animate smoothly toward target, clamping to valid range
          const currentDiff = validBPM - prev;
          if (Math.abs(currentDiff) < 0.5) {
            return validBPM; // Snap to target when close
          }
          const step = currentDiff * 0.2; // 20% of remaining distance per frame
          const newValue = prev + step;
          // Ensure value stays within valid BPM range (0-200)
          return Math.max(0, Math.min(200, Math.round(newValue)));
        });
      }, 20);
    } else if (displayBPM !== validBPM) {
      setDisplayBPM(validBPM); // Snap to target if very close
    }

    return () => clearInterval(interval);
  }, [validBPM, displayBPM]);

  const getSeverityColor = () => {
    if (severity === 'critical') return 'text-red-600 dark:text-red-400';
    if (severity === 'warning') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getSeverityBgColor = () => {
    if (severity === 'critical')
      return 'bg-red-100 dark:bg-red-900/20 ring-red-400';
    if (severity === 'warning')
      return 'bg-yellow-100 dark:bg-yellow-900/20 ring-yellow-400';
    return 'bg-green-100 dark:bg-green-900/20 ring-green-400';
  };

  const shouldPulse = severity === 'critical';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card ${getSeverityBgColor()} ring-2 overflow-hidden relative`}
    >
      {/* Background pulse effect */}
      {shouldPulse && (
        <>
          <div className="absolute inset-0 bg-red-500/10 animate-pulse-glow rounded-xl" />
          <motion.div
            className="absolute inset-0 border-2 border-red-500 rounded-xl"
            animate={{ opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Heart Rate (BPM)
            </p>
            <p className={`text-5xl font-bold ${getSeverityColor()} transition-colors`}>
              {displayBPM}
            </p>
          </div>

          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Heart className={`w-10 h-10 ${getSeverityColor()}`} fill="currentColor" />
          </motion.div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              severity === 'critical'
                ? 'bg-red-500 animate-pulse'
                : severity === 'warning'
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
          />
          <span className={`text-sm font-semibold ${getSeverityColor()}`}>
            {severity === 'critical'
              ? '🔴 Critical'
              : severity === 'warning'
              ? '🟡 Warning'
              : '🟢 Normal'}
          </span>
        </div>

        {/* Additional info */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
}
