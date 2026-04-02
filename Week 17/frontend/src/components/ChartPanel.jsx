import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { format } from 'date-fns';

function ChartPanel({ data }) {
  const chartData = data.map((item) => ({
    ...item,
    label: format(new Date(item.measuredAt), 'HH:mm'),
    anomalyValue: item.isAnomaly ? item.bpm : null
  }));

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <article className="rounded-3xl border border-white/35 bg-white/55 p-5 backdrop-blur-xl dark:border-slate-700/45 dark:bg-slate-900/55">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">Realtime BPM Trend</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-300">Line graph with anomaly overlays</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.2} />
              <XAxis dataKey="label" />
              <YAxis domain={[50, 150]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bpm" stroke="#0284c7" strokeWidth={2.5} dot={false} name="BPM" />
              <Line type="monotone" dataKey="anomalyValue" stroke="#dc2626" strokeWidth={3} dot={false} name="Anomaly" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-3xl border border-white/35 bg-white/55 p-5 backdrop-blur-xl dark:border-slate-700/45 dark:bg-slate-900/55">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">Distribution by Readings</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-300">Bar graph for quick historical scan</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.slice(-20)}>
              <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.2} />
              <XAxis dataKey="label" />
              <YAxis domain={[50, 150]} />
              <Tooltip />
              <Bar dataKey="bpm" radius={[8, 8, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}

export default ChartPanel;
