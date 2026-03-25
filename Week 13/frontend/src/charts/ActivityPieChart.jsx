import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const SLICE_COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b'];
const RADIAN = Math.PI / 180;

function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: item } = payload[0];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-lg">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: item.fill }}
        />
        <span className="font-semibold text-slate-700">{name}</span>
      </div>
      <p className="mt-1 text-slate-500">
        {value.toLocaleString()} actions
      </p>
    </div>
  );
}

export default function ActivityPieChart({ data }) {
  // Aggregate totals across all days
  const totals = data.reduce(
    (acc, d) => ({
      Logins:       acc.Logins       + d.loginCount,
      Uploads:      acc.Uploads      + d.uploads,
      Downloads:    acc.Downloads    + d.downloads,
      'Active Users': acc['Active Users'] + d.activeUsers,
    }),
    { Logins: 0, Uploads: 0, Downloads: 0, 'Active Users': 0 }
  );

  const chartData = Object.entries(totals).map(([name, value]) => ({ name, value }));

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-800">Activity Distribution</h2>
        <p className="mt-0.5 text-sm text-slate-400">Total breakdown by category</p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            outerRadius={105}
            labelLine={false}
            label={renderLabel}
            dataKey="value"
            strokeWidth={2}
            stroke="#fff"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
