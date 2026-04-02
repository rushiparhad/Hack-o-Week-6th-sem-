import { motion } from "framer-motion";
import CountUp from "react-countup";
import { TrendingDown, TrendingUp } from "lucide-react";

const colorMap = {
  good: "text-emerald-600 dark:text-emerald-300",
  warning: "text-amber-600 dark:text-amber-300",
  critical: "text-rose-600 dark:text-rose-300",
  neutral: "text-sky-600 dark:text-sky-300",
};

function KpiCard({ item, delay = 0 }) {
  const Icon = item.icon;
  const isUp = item.delta >= 0;

  return (
    <motion.article
      className="glass-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{item.title}</p>
        <Icon className={`h-5 w-5 ${colorMap[item.color] || colorMap.neutral}`} />
      </div>

      <h3 className="mt-4 font-display text-2xl text-slate-800 dark:text-slate-100">
        <CountUp end={item.value} duration={1.2} separator="," decimals={2} /> {item.unit}
      </h3>

      <div className="mt-2 flex items-center gap-1 text-sm">
        {isUp ? <TrendingUp className="h-4 w-4 text-rose-500" /> : <TrendingDown className="h-4 w-4 text-emerald-500" />}
        <span className={isUp ? "text-rose-500" : "text-emerald-500"}>{Math.abs(item.delta).toFixed(2)}%</span>
        <span className="text-slate-500 dark:text-slate-400">vs previous period</span>
      </div>
    </motion.article>
  );
}

export default KpiCard;
