import { useState, useEffect, useMemo, useCallback } from 'react';
import { LogIn, Upload, Download, Users } from 'lucide-react';

import Sidebar       from '../components/Sidebar';
import TopNav        from '../components/TopNav';
import StatCard      from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ActivityLineChart from '../charts/ActivityLineChart';
import UploadsBarChart   from '../charts/UploadsBarChart';
import ActivityPieChart  from '../charts/ActivityPieChart';
import { fetchActivity } from '../services/api';

export default function Dashboard() {
  const [data,        setData]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchActivity()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    if (!data.length) return null;
    return {
      totalLogins:     data.reduce((s, d) => s + d.loginCount,   0),
      totalUploads:    data.reduce((s, d) => s + d.uploads,      0),
      totalDownloads:  data.reduce((s, d) => s + d.downloads,    0),
      peakActiveUsers: Math.max(...data.map((d) => d.activeUsers)),
    };
  }, [data]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* ── Sidebar ────────────────────────── */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main column ────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopNav
          onMenuClick={() => setSidebarOpen(true)}
          onRefresh={load}
          loading={loading}
        />

        <main className="flex-1 overflow-auto p-4 md:p-6">

          {/* Loading */}
          {loading && <LoadingSpinner />}

          {/* Error */}
          {!loading && error && (
            <div className="flex h-64 flex-col items-center justify-center gap-4">
              <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-5 text-center shadow-sm">
                <p className="font-semibold text-red-600">Failed to load data</p>
                <p className="mt-1 text-xs text-red-400">{error}</p>
              </div>
              <button
                onClick={load}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {/* Dashboard content */}
          {!loading && !error && stats && (
            <div className="space-y-6">

              {/* ── Stat cards ── */}
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Summary
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    title="Total Logins"
                    value={stats.totalLogins}
                    icon={LogIn}
                    color="blue"
                    trend={12}
                    subtitle="All users combined"
                  />
                  <StatCard
                    title="Total Uploads"
                    value={stats.totalUploads}
                    icon={Upload}
                    color="emerald"
                    trend={8}
                    subtitle="Files sent to server"
                  />
                  <StatCard
                    title="Total Downloads"
                    value={stats.totalDownloads}
                    icon={Download}
                    color="violet"
                    trend={-3}
                    subtitle="Files retrieved"
                  />
                  <StatCard
                    title="Peak Active Users"
                    value={stats.peakActiveUsers}
                    icon={Users}
                    color="amber"
                    trend={5}
                    subtitle="Highest single day"
                  />
                </div>
              </section>

              {/* ── Line chart ── */}
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Trends
                </h2>
                <ActivityLineChart data={data} />
              </section>

              {/* ── Bar + Pie ── */}
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Analysis
                </h2>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <UploadsBarChart data={data} />
                  <ActivityPieChart data={data} />
                </div>
              </section>

              {/* Footer note */}
              <p className="pb-2 text-center text-xs text-slate-400">
                Data encrypted in transit · {data.length} days loaded · Last refreshed{' '}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
