const MAX_POINTS = 60;
const WS_URL = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}`;

const dataStore = {
  points: [],
  last: null,
};

const goals = {
  steps: 10000,
  calories: 600,
};

const elements = {
  currentDate: document.getElementById("currentDate"),
  connectionDot: document.getElementById("connectionDot"),
  connectionText: document.getElementById("connectionText"),
  mode: document.getElementById("activityMode"),
  alertsPanel: document.getElementById("alertsPanel"),
  calorieBar: document.getElementById("calorieBar"),
  calorieProgressLabel: document.getElementById("calorieProgressLabel"),
  values: {
    heartRate: document.getElementById("heartRateValue"),
    steps: document.getElementById("stepsValue"),
    spo2: document.getElementById("spo2Value"),
    calories: document.getElementById("caloriesValue"),
    activeMinutes: document.getElementById("activeMinutesValue"),
  },
  trend: {
    heartRate: document.getElementById("heartRateTrend"),
    steps: document.getElementById("stepsTrend"),
    spo2: document.getElementById("spo2Trend"),
    calories: document.getElementById("caloriesTrend"),
    activeMinutes: document.getElementById("activeMinutesTrend"),
  },
};

const miniChartKeys = ["heartRate", "steps", "spo2", "calories", "activeMinutes"];
const miniChartSvg = {
  heartRate: d3.select("#heartRateMini"),
  steps: d3.select("#stepsMini"),
  spo2: d3.select("#spo2Mini"),
  calories: d3.select("#caloriesMini"),
  activeMinutes: d3.select("#activeMinutesMini"),
};

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 450, easing: "easeOutQuad" },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(15,23,42,0.95)",
      borderColor: "rgba(148,163,184,0.3)",
      borderWidth: 1,
      titleColor: "#e2e8f0",
      bodyColor: "#cbd5e1",
    },
  },
  scales: {
    x: {
      ticks: { color: "#94a3b8", maxTicksLimit: 6 },
      grid: { color: "rgba(148,163,184,0.15)" },
    },
    y: {
      ticks: { color: "#94a3b8" },
      grid: { color: "rgba(148,163,184,0.15)" },
    },
  },
};

function mkLineChart(canvasId, color, fillColor, yMin = null, yMax = null) {
  return new Chart(document.getElementById(canvasId), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          borderColor: color,
          backgroundColor: fillColor,
          borderWidth: 2,
          fill: true,
          tension: 0.45,
          pointRadius: 0,
          pointHitRadius: 10,
        },
      ],
    },
    options: {
      ...chartDefaults,
      scales: {
        ...chartDefaults.scales,
        y: {
          ...chartDefaults.scales.y,
          ...(yMin !== null ? { min: yMin } : {}),
          ...(yMax !== null ? { max: yMax } : {}),
        },
      },
    },
  });
}

const charts = {
  ecg: mkLineChart("ecgChart", "#fb7185", "rgba(251,113,133,0.16)", 50, 130),
  hrHistory: mkLineChart("hrHistoryChart", "#22d3ee", "rgba(34,211,238,0.16)", 50, 130),
  steps: mkLineChart("stepsChart", "#60a5fa", "rgba(96,165,250,0.16)", 0, null),
  calories: mkLineChart("caloriesChart", "#34d399", "rgba(52,211,153,0.16)", 0, null),
};

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function setConnection(connected) {
  elements.connectionDot.classList.toggle("bg-emerald-400", connected);
  elements.connectionDot.classList.toggle("bg-rose-500", !connected);
  elements.connectionText.textContent = connected ? "Connected" : "Disconnected";
}

function pushPoint(point) {
  dataStore.points.push(point);
  if (dataStore.points.length > MAX_POINTS) {
    dataStore.points.splice(0, dataStore.points.length - MAX_POINTS);
  }
  dataStore.last = point;
}

function setHistory(points) {
  dataStore.points = points.slice(-MAX_POINTS);
  dataStore.last = dataStore.points[dataStore.points.length - 1] || null;
}

function trendArrow(current, previous, trendEl) {
  if (previous === null || previous === undefined) return;
  const up = current >= previous;
  trendEl.textContent = up ? "↗" : "↘";
  trendEl.classList.toggle("down", !up);
}

function renderMetricValue(metric, value, prev) {
  if (metric === "steps") {
    elements.values[metric].textContent = value.toLocaleString();
  } else {
    elements.values[metric].textContent = value;
  }
  trendArrow(value, prev, elements.trend[metric]);
}

function flashCard(metric) {
  const card = document.querySelector(`[data-metric="${metric}"]`);
  if (!card) return;
  card.classList.add("updated");
  setTimeout(() => card.classList.remove("updated"), 450);
}

function renderTopMetrics(point, previous) {
  renderMetricValue("heartRate", point.heartRate, previous?.heartRate);
  renderMetricValue("steps", point.steps, previous?.steps);
  renderMetricValue("spo2", point.spo2.toFixed(1), previous?.spo2);
  renderMetricValue("calories", point.calories.toFixed(1), previous?.calories);
  renderMetricValue("activeMinutes", point.activeMinutes.toFixed(1), previous?.activeMinutes);

  miniChartKeys.forEach((key) => flashCard(key));

  elements.mode.textContent = point.mode;

  const caloriePercent = Math.min((point.calories / goals.calories) * 100, 100);
  elements.calorieBar.style.width = `${caloriePercent}%`;
  elements.calorieProgressLabel.textContent = `${point.calories.toFixed(1)} / ${goals.calories} kcal`;
}

function updateChart(chart, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

function renderMainCharts() {
  const labels = dataStore.points.map((p) => formatTime(p.timestamp));
  updateChart(charts.ecg, labels, dataStore.points.map((p) => p.heartRate));
  updateChart(charts.hrHistory, labels, dataStore.points.map((p) => p.heartRate));
  updateChart(charts.steps, labels, dataStore.points.map((p) => p.steps));
  updateChart(charts.calories, labels, dataStore.points.map((p) => p.calories));
}

function drawMiniSparkline(svg, values, color, baseline = null) {
  const width = 220;
  const height = 64;
  const margin = { top: 6, right: 6, bottom: 8, left: 6 };

  svg.selectAll("*").remove();
  if (!values.length) return;

  const x = d3
    .scaleLinear()
    .domain([0, values.length - 1])
    .range([margin.left, width - margin.right]);

  const minValue = baseline !== null ? Math.min(d3.min(values), baseline) : d3.min(values);
  const maxValue = baseline !== null ? Math.max(d3.max(values), baseline) : d3.max(values);

  const y = d3
    .scaleLinear()
    .domain([minValue - 1, maxValue + 1])
    .range([height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x((_, i) => x(i))
    .y((d) => y(d))
    .curve(d3.curveCardinal);

  svg
    .append("path")
    .datum(values)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 2)
    .attr("d", line);
}

function renderMiniCharts() {
  drawMiniSparkline(miniChartSvg.heartRate, dataStore.points.map((p) => p.heartRate), "#fb7185", 80);
  drawMiniSparkline(miniChartSvg.steps, dataStore.points.map((p) => p.steps), "#60a5fa", 0);
  drawMiniSparkline(miniChartSvg.spo2, dataStore.points.map((p) => p.spo2), "#22d3ee", 95);
  drawMiniSparkline(miniChartSvg.calories, dataStore.points.map((p) => p.calories), "#34d399", 0);
  drawMiniSparkline(miniChartSvg.activeMinutes, dataStore.points.map((p) => p.activeMinutes), "#f59e0b", 0);
}

function renderAlerts(point) {
  const alerts = [];
  if (point.heartRate > 110) {
    alerts.push({ level: "warning", title: "High Heart Rate", msg: `Heart rate at ${point.heartRate} BPM` });
  }
  if (point.spo2 < 95) {
    alerts.push({ level: "critical", title: "Low SpO2", msg: `Blood oxygen at ${point.spo2.toFixed(1)}%` });
  }

  if (!alerts.length) {
    elements.alertsPanel.innerHTML = `<div class="alert-card alert-ok"><p class="m-0 font-medium">All vitals are in healthy range</p><p class="m-0 mt-1 text-sm text-slate-300">Monitoring continuously for anomalies.</p></div>`;
    return;
  }

  elements.alertsPanel.innerHTML = alerts
    .map(
      (a) =>
        `<div class="alert-card"><p class="m-0 font-medium">${a.title}</p><p class="m-0 mt-1 text-sm text-slate-200">${a.msg}</p></div>`
    )
    .join("");
}

function drawStepsRing(percent, steps) {
  const target = d3.select("#stepsRing");
  target.selectAll("*").remove();

  const width = 220;
  const height = 150;
  const radius = 48;

  const svg = target.append("svg").attr("viewBox", `0 0 ${width} ${height}`);
  const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2 + 10})`);

  const arc = d3.arc().innerRadius(radius - 10).outerRadius(radius).startAngle(-Math.PI);

  g.append("path").datum({ endAngle: 0 }).attr("d", arc).attr("fill", "rgba(148,163,184,0.2)");

  g.append("path")
    .datum({ endAngle: -Math.PI + (Math.PI * percent) / 100 })
    .attr("d", arc)
    .attr("fill", "#22d3ee");

  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "-2")
    .attr("fill", "#e2e8f0")
    .style("font-size", "20px")
    .style("font-weight", 600)
    .text(`${Math.round(percent)}%`);

  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "20")
    .attr("fill", "#94a3b8")
    .style("font-size", "12px")
    .text(`${steps.toLocaleString()} steps`);
}

function drawSpo2Gauge(spo2) {
  const target = d3.select("#spo2Gauge");
  target.selectAll("*").remove();

  const width = 220;
  const height = 150;
  const radius = 48;

  const svg = target.append("svg").attr("viewBox", `0 0 ${width} ${height}`);
  const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2 + 10})`);

  const arc = d3.arc().innerRadius(radius - 10).outerRadius(radius).startAngle(-Math.PI);
  const score = Math.max(0, Math.min((spo2 - 90) / 10, 1));

  g.append("path").datum({ endAngle: 0 }).attr("d", arc).attr("fill", "rgba(148,163,184,0.2)");
  g.append("path")
    .datum({ endAngle: -Math.PI + Math.PI * score })
    .attr("d", arc)
    .attr("fill", spo2 < 95 ? "#fb7185" : "#34d399");

  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "-2")
    .attr("fill", "#e2e8f0")
    .style("font-size", "20px")
    .style("font-weight", 600)
    .text(`${spo2.toFixed(1)}%`);

  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "20")
    .attr("fill", "#94a3b8")
    .style("font-size", "12px")
    .text(spo2 < 95 ? "Low oxygen" : "Healthy range");
}

function renderD3Widgets(point) {
  const stepsPct = Math.min((point.steps / goals.steps) * 100, 100);
  drawStepsRing(stepsPct, point.steps);
  drawSpo2Gauge(point.spo2);
}

function refreshUI(point, previous = null) {
  renderTopMetrics(point, previous);
  renderMainCharts();
  renderMiniCharts();
  renderD3Widgets(point);
  renderAlerts(point);
}

function handleSensorData(point) {
  const previous = dataStore.last;
  pushPoint(point);
  refreshUI(point, previous);
}

function hydrate(points) {
  setHistory(points);
  const latest = dataStore.last;
  if (latest) {
    refreshUI(latest);
  }
}

function initDate() {
  const now = new Date();
  elements.currentDate.textContent = now.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function connectSocket() {
  const ws = new WebSocket(WS_URL);

  ws.addEventListener("open", () => {
    setConnection(true);
    ws.send(JSON.stringify({ type: "register", role: "dashboard" }));
  });

  ws.addEventListener("close", () => {
    setConnection(false);
    setTimeout(connectSocket, 1500);
  });

  ws.addEventListener("message", (event) => {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }

    if (message.type === "history" && Array.isArray(message.payload)) {
      hydrate(message.payload);
      return;
    }

    if (message.type === "sensor_data" && message.payload) {
      handleSensorData(message.payload);
    }
  });
}

initDate();
setConnection(false);
connectSocket();
