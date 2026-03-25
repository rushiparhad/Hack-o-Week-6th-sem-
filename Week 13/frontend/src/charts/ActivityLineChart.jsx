import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const LINES = [
  { key: 'loginCount',  label: 'Logins',       color: '#6366f1' },
  { key: 'uploads',     label: 'Uploads',      color: '#10b981' },
  { key: 'downloads',   label: 'Downloads',    color: '#8b5cf6' },
  { key: 'activeUsers', label: 'Active Users', color: '#f59e0b' },
];

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
        <div key={p.dataKey} className="mb-1 flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ActivityLineChart({ data }) {
  // Show last 14 entries for readability
  const chartData = data.slice(-14);

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-800">Daily Activity Trends</h2>
        <p className="mt-0.5 text-sm text-slate-400">Last 14 days — logins, uploads, downloads & active users</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
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
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
          />
          {LINES.map(({ key, label, color }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={label}
              stroke={color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
