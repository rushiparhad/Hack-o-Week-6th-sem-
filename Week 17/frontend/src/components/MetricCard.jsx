import { motion } from 'framer-motion';

function MetricCard({ title, value, subtitle, accent = 'from-cyan-500 to-blue-600', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="rounded-2xl border border-white/30 bg-white/55 p-5 shadow-lg backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/55"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
        {title}
      </p>
      <div className={`mt-3 bg-gradient-to-r ${accent} bg-clip-text text-3xl font-black text-transparent`}>
        {value}
      </div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
    </motion.div>
  );
}

export default MetricCard;
