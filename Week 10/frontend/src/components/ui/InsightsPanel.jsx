function InsightsPanel({ anomalies = [], recommendations = [] }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Anomalies</p>
        <div className="mt-2 space-y-2">
          {anomalies.length === 0 && (
            <div className="rounded-xl border border-emerald-300/40 bg-emerald-100/60 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-600/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              No critical anomalies in selected time window.
            </div>
          )}
          {anomalies.map((item) => (
            <div
              key={`${item.date}-${item.metric}`}
              className="rounded-xl border border-amber-300/40 bg-amber-100/60 px-3 py-2 text-sm text-amber-700 dark:border-amber-600/30 dark:bg-amber-500/10 dark:text-amber-300"
            >
              {item.message}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Recommendations</p>
        <div className="mt-2 space-y-2">
          {recommendations.map((item, index) => (
            <div key={index} className="rounded-xl border border-sky-300/40 bg-sky-100/60 px-3 py-2 text-sm text-sky-700 dark:border-sky-600/30 dark:bg-sky-500/10 dark:text-sky-300">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InsightsPanel;
