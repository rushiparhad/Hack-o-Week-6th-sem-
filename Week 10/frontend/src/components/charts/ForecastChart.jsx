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

function ForecastChart({ data }) {
  const chartData = data;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.24)" />
        <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} />
        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="energyConsumption" name="Energy" stroke="#0ea5e9" strokeWidth={2.3} dot={false} />
        <Line type="monotone" dataKey="waterUsage" name="Water" stroke="#f59e0b" strokeWidth={2.1} dot={false} />
        <Line type="monotone" dataKey="carbonEmissions" name="Carbon" stroke="#ef4444" strokeWidth={2.1} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default ForecastChart;
