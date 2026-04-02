import { motion } from 'framer-motion';

function AlertBadge({ count }) {
  const hasAlert = count > 0;

  return (
    <motion.span
      animate={hasAlert ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={{ repeat: hasAlert ? Infinity : 0, duration: 1.6 }}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
        hasAlert
          ? 'bg-rose-500/20 text-rose-700 ring-1 ring-rose-400/40 dark:text-rose-200'
          : 'bg-emerald-500/20 text-emerald-700 ring-1 ring-emerald-400/40 dark:text-emerald-100'
      }`}
    >
      {hasAlert ? `${count} active alerts` : 'System healthy'}
    </motion.span>
  );
}

export default AlertBadge;
