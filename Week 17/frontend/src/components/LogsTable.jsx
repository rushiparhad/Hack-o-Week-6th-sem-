import { formatTimestamp } from '../utils/formatters';

function LogsTable({ logs, pagination, page, onPageChange, search, onSearch }) {
  return (
    <section className="rounded-3xl border border-white/35 bg-white/55 p-5 backdrop-blur-xl dark:border-slate-700/45 dark:bg-slate-900/55">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">Export Activity Logs</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">Search, paginate, and audit CSV/PDF exports</p>
        </div>
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search by format..."
          className="rounded-xl border border-white/35 bg-white/70 px-3 py-2 text-sm outline-none dark:border-slate-700/50 dark:bg-slate-900/70"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 dark:text-slate-300">
              <th className="pb-2">User</th>
              <th className="pb-2">Format</th>
              <th className="pb-2">Severity</th>
              <th className="pb-2">Records</th>
              <th className="pb-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-200/50 dark:border-slate-700/50">
                <td className="py-2">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{log.user}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{log.email}</div>
                </td>
                <td className="py-2 uppercase">{log.format}</td>
                <td className="py-2 capitalize">{log.severity}</td>
                <td className="py-2">{log.recordsExported}</td>
                <td className="py-2">{formatTimestamp(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-slate-300/60 px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-700/60"
        >
          Prev
        </button>
        <span className="text-sm text-slate-600 dark:text-slate-300">
          Page {pagination.page} / {pagination.totalPages || 1}
        </span>
        <button
          disabled={page >= (pagination.totalPages || 1)}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-slate-300/60 px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-700/60"
        >
          Next
        </button>
      </div>
    </section>
  );
}

export default LogsTable;
