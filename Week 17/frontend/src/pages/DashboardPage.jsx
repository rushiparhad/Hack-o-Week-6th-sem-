import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Waves } from 'lucide-react';
import toast from 'react-hot-toast';
import AlertBadge from '../components/AlertBadge';
import ChartPanel from '../components/ChartPanel';
import DashboardHeader from '../components/DashboardHeader';
import ExportPanel from '../components/ExportPanel';
import LogsTable from '../components/LogsTable';
import MetricCard from '../components/MetricCard';
import SkeletonCard from '../components/SkeletonCard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { exportApi, logsApi, metricsApi } from '../services/api';
import { downloadBlob } from '../utils/formatters';

function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [metrics, setMetrics] = useState([]);
  const [summary, setSummary] = useState({
    liveBpm: 0,
    avgBpm: 0,
    anomalies: 0,
    totalReadings: 0
  });
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await metricsApi.getMetrics({ limit: 160 });
      setMetrics(response.data.metrics || []);
      setSummary(response.data.summary || {});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch metrics');
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const response = await logsApi.getLogs({
        page,
        limit: 8,
        search: debouncedSearch
      });
      setLogs(response.data.logs || []);
      setPagination(response.data.pagination || { page: 1, totalPages: 1, total: 0, limit: 8 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch export logs');
    } finally {
      setLoadingLogs(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchMetrics();
    fetchLogs();
  }, [fetchMetrics, fetchLogs]);

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        await metricsApi.simulateMetric();
        await fetchMetrics();
      } catch {
        // Ignore transient polling errors.
      }
    }, 14000);

    return () => clearInterval(timer);
  }, [fetchMetrics]);

  async function handleSimulate() {
    try {
      await metricsApi.simulateMetric();
      await fetchMetrics();
      toast.success('New simulated metric captured');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to simulate metric');
    }
  }

  async function handleExport(format, filters) {
    setIsExporting(true);
    setProgress(0);

    try {
      const response = await exportApi.download(format, filters, (event) => {
        if (!event.total) {
          setProgress((prev) => (prev < 85 ? prev + 7 : prev));
          return;
        }

        const value = Math.round((event.loaded * 100) / event.total);
        setProgress(Math.max(5, Math.min(value, 100)));
      });

      const extension = format === 'pdf' ? 'pdf' : 'csv';
      const fileName = `metrics-export-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.${extension}`;
      downloadBlob(response.data, fileName);
      setProgress(100);
      toast.success(`${format.toUpperCase()} exported successfully`);
      await fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Export failed');
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setProgress(0);
      }, 450);
    }
  }

  const anomalyRatio = useMemo(() => {
    if (!summary.totalReadings) return 0;
    return Math.round((summary.anomalies / summary.totalReadings) * 100);
  }, [summary.anomalies, summary.totalReadings]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="space-y-5">
        <DashboardHeader user={user} theme={theme} onToggleTheme={toggleTheme} onLogout={logout} />

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="glass-panel p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                Live Monitoring
              </p>
              <h2 className="font-display text-xl font-extrabold text-slate-900 dark:text-slate-50">
                Heart-rate anomaly pipeline active
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <AlertBadge count={summary.anomalies || 0} />
              <button
                onClick={handleSimulate}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
              >
                <RefreshCw size={15} />
                Simulate Reading
              </button>
            </div>
          </div>
        </motion.section>

        {loadingMetrics ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Live BPM" value={summary.liveBpm || 0} subtitle="Latest captured reading" delay={0.05} />
            <MetricCard title="Average BPM" value={summary.avgBpm || 0} subtitle="Rolling average" accent="from-blue-600 to-sky-500" delay={0.1} />
            <MetricCard title="Anomalies" value={summary.anomalies || 0} subtitle="Total flagged events" accent="from-rose-600 to-orange-500" delay={0.15} />
            <MetricCard
              title="Risk Ratio"
              value={`${anomalyRatio}%`}
              subtitle="Anomalies vs total readings"
              accent="from-emerald-600 to-teal-500"
              delay={0.2}
            />
          </section>
        )}

        <ChartPanel data={metrics} />

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <ExportPanel onExport={handleExport} progress={progress} isExporting={isExporting} />

          <article className="glass-panel p-5">
            <div className="flex items-center gap-2">
              <Waves size={16} className="text-cyan-600" />
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">Anomaly Insights</h3>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Critical alerts are generated for readings above 120 BPM. High alerts are generated for readings above 100 BPM.
            </p>

            <div className="mt-4 space-y-2">
              {metrics
                .filter((item) => item.isAnomaly)
                .slice(-5)
                .reverse()
                .map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm dark:border-rose-600/30"
                  >
                    <p className="font-semibold text-rose-800 dark:text-rose-200">
                      {item.severity.toUpperCase()} | {item.bpm} BPM
                    </p>
                    <p className="text-rose-700/90 dark:text-rose-300/90">{item.anomalyReason}</p>
                  </div>
                ))}
              {!metrics.some((item) => item.isAnomaly) ? (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-200">
                  No active anomalies in the current window.
                </div>
              ) : null}
            </div>
          </article>
        </section>

        {loadingLogs ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
          </section>
        ) : (
          <LogsTable
            logs={logs}
            pagination={pagination}
            page={page}
            onPageChange={setPage}
            search={search}
            onSearch={setSearch}
          />
        )}
      </div>
    </main>
  );
}

export default DashboardPage;
