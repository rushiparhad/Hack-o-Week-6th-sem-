import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-lg">
      <p className="mb-2 font-semibold text-slate-700">{fmtDate(label)}</p>
      {payload.map((p) => (
        <div key={p.name} className="mb-1 flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: p.fill }}
          />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function UploadsBarChart({ data }) {
  const chartData = data.slice(-14);

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-800">Uploads vs Downloads</h2>
        <p className="mt-0.5 text-sm text-slate-400">Daily comparison — last 14 days</p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          barCategoryGap="32%"
          barGap={3}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: '#f8fafc', radius: 6 }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
          <Bar
            dataKey="uploads"
            name="Uploads"
            fill="#10b981"
            radius={[5, 5, 0, 0]}
          />
          <Bar
            dataKey="downloads"
            name="Downloads"
            fill="#8b5cf6"
            radius={[5, 5, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
