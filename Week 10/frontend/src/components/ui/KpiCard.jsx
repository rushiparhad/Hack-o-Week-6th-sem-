import { motion } from "framer-motion";

function KpiCard({ title, value, subtitle, delay = 0 }) {
  return (
    <motion.article
      className="kpi-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <p className="kpi-title">{title}</p>
      <h3 className="kpi-value">{value}</h3>
      <small className="kpi-subtitle">{subtitle}</small>
    </motion.article>
  );
}

export default KpiCard;
