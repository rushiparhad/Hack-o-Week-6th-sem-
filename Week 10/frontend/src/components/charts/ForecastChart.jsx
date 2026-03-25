import dayjs from "dayjs";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ForecastChart({ forecast }) {
  const chartData = (forecast?.forecast || []).slice(-200).map((row) => ({
    time: dayjs(row.timestamp).format("DD MMM HH:mm"),
    yhat: row.yhat,
    low: row.yhatLower,
    high: row.yhatUpper,
  }));

  return (
    <article className="chart-card">
      <h3>Forecasted Peak Demand (Prophet)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.12)" />
          <XAxis dataKey="time" minTickGap={26} tick={{ fill: "#8ca3bb", fontSize: 11 }} />
          <YAxis tick={{ fill: "#8ca3bb", fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="high" stackId="1" stroke="transparent" fill="rgba(250, 166, 26, 0.24)" />
          <Area type="monotone" dataKey="low" stackId="1" stroke="transparent" fill="#111827" />
          <Line type="monotone" dataKey="yhat" stroke="#faa61a" strokeWidth={2.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </article>
  );
}

export default ForecastChart;
