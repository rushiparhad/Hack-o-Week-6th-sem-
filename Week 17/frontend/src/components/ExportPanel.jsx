import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';

function ExportPanel({ onExport, progress, isExporting }) {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    severity: 'all'
  });

  const progressWidth = useMemo(() => `${Math.min(progress, 100)}%`, [progress]);

  function updateField(event) {
    setFilters((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  }

  return (
    <section className="rounded-3xl border border-white/35 bg-white/55 p-5 backdrop-blur-xl dark:border-slate-700/45 dark:bg-slate-900/55">
      <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">Secure Export Center</h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-300">On-the-fly decrypt, filter, and export as CSV or PDF</p>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600 dark:text-slate-300">From</span>
          <input
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={updateField}
            className="w-full rounded-xl border border-white/35 bg-white/70 px-3 py-2 outline-none dark:border-slate-700/50 dark:bg-slate-900/70"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600 dark:text-slate-300">To</span>
          <input
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={updateField}
            className="w-full rounded-xl border border-white/35 bg-white/70 px-3 py-2 outline-none dark:border-slate-700/50 dark:bg-slate-900/70"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600 dark:text-slate-300">Severity</span>
          <select
            name="severity"
            value={filters.severity}
            onChange={updateField}
            className="w-full rounded-xl border border-white/35 bg-white/70 px-3 py-2 outline-none dark:border-slate-700/50 dark:bg-slate-900/70"
          >
            <option value="all">All</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => onExport('csv', filters)}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
        >
          <Download size={16} />
          Export CSV
        </button>
        <button
          onClick={() => onExport('pdf', filters)}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-50"
        >
          <Download size={16} />
          Export PDF
        </button>
      </div>

      {isExporting ? (
        <div className="mt-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
            Download progress: {progress}%
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/70">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all" style={{ width: progressWidth }} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ExportPanel;
