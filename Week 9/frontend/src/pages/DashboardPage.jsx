import { motion } from "framer-motion";

import DashboardLayout from "../components/layout/DashboardLayout";
import UsageLineChart from "../components/charts/UsageLineChart";
import ForecastChart from "../components/charts/ForecastChart";
import CategoryPieChart from "../components/charts/CategoryPieChart";
import KpiCard from "../components/ui/KpiCard";
import FilterBar from "../components/ui/FilterBar";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import { useDashboardData } from "../hooks/useDashboardData";

function DashboardPage() {
  const { filters, setFilters, data, stats, loading, error } = useDashboardData();

  return (
    <DashboardLayout>
      <motion.div
        className="dashboard-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <FilterBar filters={filters} onChange={setFilters} />

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} />}

        {!loading && !error && data && (
          <>
            <section className="kpi-grid">
              <KpiCard title="Total Usage" value={stats.totalUsage} subtitle="Total loads in selected range" delay={0.05} />
              <KpiCard
                title="Peak Hours"
                value={stats.peakHours.map((h) => `${h}:00`).join(", ")}
                subtitle="Top high-demand hours"
                delay={0.1}
              />
              <KpiCard title="Avg Load" value={stats.avgLoad} subtitle="Average loads per record" delay={0.15} />
              <KpiCard
                title="Prediction Accuracy"
                value={`${stats.predictionAccuracy}%`}
                subtitle="Naive Bayes validation score"
                delay={0.2}
              />
            </section>

            <section className="charts-grid">
              <UsageLineChart data={data.history} />
              <ForecastChart forecast={data.forecast} />
              <CategoryPieChart distribution={data.categorized.distribution} />
            </section>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

export default DashboardPage;
