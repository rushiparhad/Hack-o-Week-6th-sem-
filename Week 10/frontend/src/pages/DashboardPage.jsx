import { motion } from "framer-motion";
import {
  AlertTriangle,
  Droplets,
  Factory,
  Leaf,
  Recycle,
  Zap,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import KpiCard from "../components/ui/KpiCard";
import FilterBar from "../components/ui/FilterBar";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import TrendChart from "../components/charts/UsageLineChart";
import ForecastChart from "../components/charts/ForecastChart";
import DistributionChart from "../components/charts/CategoryPieChart";
import ComparisonChart from "../components/charts/ComparisonChart";
import InsightsPanel from "../components/ui/InsightsPanel";
import { useDashboardData } from "../hooks/useDashboardData";

function DashboardPage() {
  const {
    filters,
    setFilters,
    dashboard,
    predictions,
    drilldown,
    metadata,
    liveKpis,
    loading,
    error,
  } = useDashboardData();

  const cards = [
    {
      title: "Total Carbon Footprint",
      value: (liveKpis?.carbonEmissions ?? dashboard?.kpis?.carbonEmissions) || 0,
      unit: "kg CO2",
      delta: dashboard?.comparisons?.carbonEmissions || 0,
      icon: Factory,
      color: "critical",
    },
    {
      title: "Energy Consumption",
      value: (liveKpis?.energyConsumption ?? dashboard?.kpis?.energyConsumption) || 0,
      unit: "kWh",
      delta: dashboard?.comparisons?.energyConsumption || 0,
      icon: Zap,
      color: "neutral",
    },
    {
      title: "Water Usage",
      value: (liveKpis?.waterUsage ?? dashboard?.kpis?.waterUsage) || 0,
      unit: "liters",
      delta: dashboard?.comparisons?.waterUsage || 0,
      icon: Droplets,
      color: "warning",
    },
    {
      title: "Waste Generated",
      value: (liveKpis?.wasteGenerated ?? dashboard?.kpis?.wasteGenerated) || 0,
      unit: "kg",
      delta: dashboard?.comparisons?.wasteGenerated || 0,
      icon: Recycle,
      color: "good",
    },
  ];

  return (
    <DashboardLayout
      score={dashboard?.kpis?.sustainabilityScore || 0}
      filters={filters}
      metadata={metadata}
      onFilterChange={setFilters}
    >
      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} />}

      {!loading && !error && dashboard && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-4"
        >
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((item, idx) => (
              <KpiCard key={item.title} item={item} delay={idx * 0.06} />
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-12">
            <article className="glass-card xl:col-span-8">
              <h3 className="section-title">Energy Trend and Smoothing</h3>
              <TrendChart data={dashboard.trends} />
            </article>

            <article className="glass-card xl:col-span-4">
              <h3 className="section-title">Department Distribution</h3>
              <DistributionChart data={dashboard.distribution} />
            </article>

            <article className="glass-card xl:col-span-7">
              <h3 className="section-title">7-Day Ensemble Forecast</h3>
              <ForecastChart data={predictions?.forecast || []} />
            </article>

            <article className="glass-card xl:col-span-5">
              <h3 className="section-title">Department Comparison</h3>
              <ComparisonChart data={dashboard.distribution} />
            </article>
          </section>

          <section className="grid gap-4 xl:grid-cols-12">
            <article className="glass-card xl:col-span-8">
              <div className="mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Leaf className="h-4 w-4" />
                <h3 className="section-title">Drill-Down by Building and Department</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {(drilldown.points || []).slice(0, 8).map((row) => (
                  <div key={`${row.campus}-${row.department}-${row.building}`} className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{row.building}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{row.department} • {row.campus}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Energy: {row.energyConsumption.toLocaleString()} kWh</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Water: {row.waterUsage.toLocaleString()} L</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Carbon: {row.carbonEmissions.toLocaleString()} kg CO2</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card xl:col-span-4">
              <div className="mb-4 flex items-center gap-2 text-amber-600 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="section-title">Smart Insights</h3>
              </div>
              <InsightsPanel anomalies={dashboard.anomalies} recommendations={dashboard.recommendations} />
            </article>
          </section>
        </motion.div>
      )}
    </DashboardLayout>
  );
}

export default DashboardPage;
