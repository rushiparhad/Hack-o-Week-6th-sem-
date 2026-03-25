import dayjs from "dayjs";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function UsageLineChart({ data }) {
  const chartData = data.slice(-180).map((point) => ({
    time: dayjs(point.timestamp).format("DD MMM HH:mm"),
    load: point.loadCount,
  }));

  return (
    <article className="chart-card">
      <h3>Historical Laundry Usage</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.12)" />
          <XAxis dataKey="time" minTickGap={28} tick={{ fill: "#8ca3bb", fontSize: 11 }} />
          <YAxis tick={{ fill: "#8ca3bb", fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="load" stroke="#5cc8ff" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </article>
  );
}

export default UsageLineChart;
