import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function UsageLineChart({ data }) {
  const chartData = data.slice(-90);

  return (
    <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.24)" />
          <XAxis dataKey="date" minTickGap={24} tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="energyConsumption" name="Energy" stroke="#0ea5e9" strokeWidth={2.4} dot={false} />
          <Line type="monotone" dataKey="smoothedEnergy" name="Smoothed" stroke="#22c55e" strokeWidth={2.2} dot={false} />
          <Line type="monotone" dataKey="waterUsage" name="Water" stroke="#f59e0b" strokeWidth={1.9} dot={false} />
        </LineChart>
    </ResponsiveContainer>
  );
}

export default UsageLineChart;
