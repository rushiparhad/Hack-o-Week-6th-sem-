import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = {
  low: "#41d3bd",
  medium: "#5cc8ff",
  high: "#ff6b6b",
};

function CategoryPieChart({ distribution }) {
  const chartData = Object.entries(distribution || {}).map(([name, value]) => ({ name, value }));

  return (
    <article className="chart-card">
      <h3>Usage Category Distribution (Naive Bayes)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={106} label>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </article>
  );
}

export default CategoryPieChart;
