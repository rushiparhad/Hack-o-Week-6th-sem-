import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ComparisonChart({ data }) {
  const chartData = (data || []).slice(0, 6).map((item) => ({
    name: item.name,
    score: item.sustainabilityScore,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.24)" />
        <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="score" fill="#22c55e" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default ComparisonChart;
