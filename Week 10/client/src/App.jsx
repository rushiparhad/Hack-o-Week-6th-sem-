import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Download,
  Droplets,
  Leaf,
  Moon,
  RefreshCw,
  Sun,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { exportCsv } from "./api/client";
import { useDashboardData } from "./hooks/useDashboardData";
import { number, shortDate } from "./utils/formatters";
import { exportDashboardPdf } from "./utils/report";

const pieColors = ["#006d77", "#83c5be", "#ffb703"];

const initialFilters = {
  from: "",
  to: "",
  department: "all",
  building: "all",
};

function App() {
  const [filters, setFilters] = useState(initialFilters);
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("sustainability-theme");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [detailTitle, setDetailTitle] = useState("Energy Usage Trend");
  const { data, predictionData, drilldownData, metadata, loading, error, refetch } = useDashboardData(filters);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sustainability-theme", theme);
  }, [theme]);

  const selectedOverview = useMemo(() => drilldownData.slice(0, 7), [drilldownData]);

  const onFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleExportCsv = async () => {
    const response = await exportCsv(filters);
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sustainability-report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar panel">
        <div>
          <h1>Campus Tracker</h1>
          <p>Operational sustainability intelligence</p>
        </div>
        <nav>
          <div className="nav-item active"><BarChart3 size={16} /> Overview</div>
          <div className="nav-item"><AlertTriangle size={16} /> Alerts</div>
        </nav>
        <div className="sidebar-footnote">
          <p>Ensemble models</p>
          <p>Linear Regression + Smoothing</p>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar panel">
          <div>
            <h2>Campus-Wide Sustainability Tracker</h2>
            <p>Measure, forecast, and act on sustainability impact across campus.</p>
          </div>
          <div className="toolbar-actions">
            <button className="ghost" onClick={refetch}><RefreshCw size={16} /> Refresh</button>
            <button className="ghost" onClick={handleExportCsv}><Download size={16} /> CSV</button>
            <button
              className="ghost"
              onClick={() => exportDashboardPdf(data.kpis || {}, data.trends || [], filters)}
            >
              <Download size={16} /> PDF
            </button>
            <button className="ghost" onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}>
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />} {theme === "light" ? "Dark" : "Light"}
            </button>
          </div>
        </header>

        <section className="filter-row panel">
          <label>
            From
            <input type="date" value={filters.from} onChange={(e) => onFilterChange("from", e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={filters.to} onChange={(e) => onFilterChange("to", e.target.value)} />
          </label>
          <label>
            Department
            <select value={filters.department} onChange={(e) => onFilterChange("department", e.target.value)}>
              <option value="all">All departments</option>
              {metadata.departments.map((dep) => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </label>
          <label>
            Building
            <select value={filters.building} onChange={(e) => onFilterChange("building", e.target.value)}>
              <option value="all">All buildings</option>
              {metadata.buildings.map((building) => (
                <option key={building} value={building}>{building}</option>
              ))}
            </select>
          </label>
        </section>

        {error ? <div className="error panel">{error}</div> : null}

        <section className="kpi-grid">
          <KpiCard
            icon={<Zap size={18} />}
            title="Total Energy Consumption"
            value={number(data.kpis?.totalEnergyConsumption)}
            unit="kWh"
            loading={loading}
            onClick={() => setDetailTitle("Energy Usage Trend")}
          />
          <KpiCard
            icon={<Droplets size={18} />}
            title="Water Usage"
            value={number(data.kpis?.waterUsage)}
            unit="KL"
            loading={loading}
            onClick={() => setDetailTitle("Water Usage Trend")}
          />
          <KpiCard
            icon={<Leaf size={18} />}
            title="Carbon Emissions Saved"
            value={number(data.kpis?.carbonEmissionsSaved)}
            unit="kgCO2"
            loading={loading}
            onClick={() => setDetailTitle("Carbon Savings")}
          />
          <KpiCard
            icon={<BarChart3 size={18} />}
            title="Sustainability Score"
            value={number(data.kpis?.sustainabilityScore)}
            unit="/100"
            loading={loading}
            onClick={() => setDetailTitle("Sustainability Score Drivers")}
          />
        </section>

        <section className="chart-grid">
          <article className="panel chart-card">
            <header>
              <h3>{detailTitle}</h3>
              <p>Click any chart for drill-down context</p>
            </header>
            <div className="chart-holder">
              {loading ? <Skeleton /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.trends} onClick={() => setDetailTitle("Energy and Water Trend")}>
                    <defs>
                      <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.85} />
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0.08} />
                      </linearGradient>
                      <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.08} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" />
                    <XAxis dataKey="date" tickFormatter={shortDate} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="energyUsage" stroke="#0f766e" fill="url(#energyFill)" />
                    <Area type="monotone" dataKey="waterUsage" stroke="#f59e0b" fill="url(#waterFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>

          <article className="panel chart-card">
            <header><h3>Department Sustainability Comparison</h3></header>
            <div className="chart-holder">
              {loading ? <Skeleton /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.comparison} onClick={() => setDetailTitle("Department Comparison")}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sustainabilityScore" fill="#006d77" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="carbonSaved" fill="#ffb703" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>

          <article className="panel chart-card">
            <header><h3>Resource Distribution</h3></header>
            <div className="chart-holder">
              {loading ? <Skeleton /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart onClick={() => setDetailTitle("Resource Distribution")}>
                    <Tooltip />
                    <Legend />
                    <Pie data={data.resourceDistribution} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105}>
                      {data.resourceDistribution?.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>

          <article className="panel chart-card">
            <header><h3>Model Signals and Forecast</h3></header>
            <div className="chart-holder">
              {loading ? <Skeleton /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictionData.sourceSeries} onClick={() => setDetailTitle("Forecast Signals")}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={shortDate} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="actual" stroke="#334155" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="movingAverage" stroke="#0f766e" dot={false} />
                    <Line type="monotone" dataKey="exponentialSmoothing" stroke="#f59e0b" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="forecast-strip">
              {predictionData.forecast?.map((item) => (
                <div key={item.dayOffset}>
                  <span>D+{item.dayOffset}</span>
                  <strong>{number(item.predictedEnergyUsage)} kWh</strong>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="panel split-grid">
          <article>
            <h3>Drill-down: Campus -&gt; Department -&gt; Building</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Campus</th>
                    <th>Department</th>
                    <th>Building</th>
                    <th>Energy</th>
                    <th>Water</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOverview.map((row) => (
                    <tr key={`${row.department}-${row.building}`}>
                      <td>{row.campus}</td>
                      <td>{row.department}</td>
                      <td>{row.building}</td>
                      <td>{number(row.energyUsage)}</td>
                      <td>{number(row.waterUsage)}</td>
                      <td>{row.sustainabilityScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
          <article>
            <h3>Alerts</h3>
            <div className="alerts-list">
              {(data.alerts || []).length ? data.alerts.map((alert) => (
                <div className="alert-item" key={alert.date}>
                  <AlertTriangle size={14} />
                  <div>
                    <strong>{alert.date}</strong>
                    <p>{alert.message}</p>
                  </div>
                </div>
              )) : <p>No abnormal usage alerts in selected range.</p>}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

function KpiCard({ icon, title, value, unit, onClick, loading }) {
  return (
    <button className="panel kpi-card" onClick={onClick}>
      <div className="kpi-title">{icon}<span>{title}</span></div>
      {loading ? <Skeleton compact /> : <div className="kpi-value">{value}<small>{unit}</small></div>}
    </button>
  );
}

function Skeleton({ compact = false }) {
  return <div className={`skeleton ${compact ? "compact" : ""}`} />;
}

export default App;
