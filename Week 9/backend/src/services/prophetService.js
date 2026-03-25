const { spawn } = require("child_process");
const path = require("path");

const PYTHON_SCRIPT = path.join(__dirname, "../../../python-ml/forecast_service.py");

const buildFallbackForecast = (records, options = {}) => {
  const sorted = [...records].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  if (!sorted.length) {
    return { forecast: [], peakWindows: [], provider: "fallback" };
  }

  const horizon = Number(options.horizon || 48);
  const loadFactor = Number(options.loadFactor || 1);

  const hourlyBuckets = Array.from({ length: 24 }, () => []);
  for (const row of sorted) {
    const dt = new Date(row.timestamp);
    if (!Number.isFinite(dt.getTime())) continue;
    hourlyBuckets[dt.getHours()].push(Number(row.loadCount) || 0);
  }

  const allLoads = sorted.map((row) => Number(row.loadCount) || 0);
  const globalAvg = allLoads.reduce((sum, val) => sum + val, 0) / Math.max(allLoads.length, 1);
  const recentWindow = allLoads.slice(-24);
  const prevWindow = allLoads.slice(-48, -24);
  const recentAvg = recentWindow.reduce((sum, val) => sum + val, 0) / Math.max(recentWindow.length, 1);
  const prevAvg = prevWindow.reduce((sum, val) => sum + val, 0) / Math.max(prevWindow.length, 1);
  const rawTrend = prevAvg > 0 ? (recentAvg - prevAvg) / prevAvg : 0;
  const trendFactor = Math.max(0.8, Math.min(1.2, 1 + rawTrend * 0.2));

  const lastTs = new Date(sorted[sorted.length - 1].timestamp);
  const forecast = [];

  for (let i = 1; i <= horizon; i += 1) {
    const ts = new Date(lastTs.getTime() + i * 60 * 60 * 1000);
    const hour = ts.getHours();
    const bucket = hourlyBuckets[hour];
    const base = bucket.length
      ? bucket.reduce((sum, val) => sum + val, 0) / bucket.length
      : globalAvg;

    const yhat = Math.max(0, base * loadFactor * trendFactor);
    const spread = Math.max(1, yhat * 0.18);

    forecast.push({
      timestamp: ts.toISOString(),
      yhat: Number(yhat.toFixed(2)),
      yhatLower: Number(Math.max(0, yhat - spread).toFixed(2)),
      yhatUpper: Number((yhat + spread).toFixed(2)),
    });
  }

  const peakWindows = [...forecast]
    .sort((a, b) => b.yhat - a.yhat)
    .slice(0, 8)
    .map((row) => ({
      timestamp: row.timestamp,
      predictedLoad: row.yhat,
    }));

  return {
    forecast,
    peakWindows,
    provider: "fallback",
  };
};

const runProphetForecast = (records, options = {}) => {
  const pythonBin = process.env.PYTHON_BIN || "python";

  return new Promise((resolve, reject) => {
    let settled = false;
    const resolveOnce = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const rejectOnce = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    const payload = {
      records,
      horizon: Number(options.horizon || 48),
      loadFactor: Number(options.loadFactor || 1),
    };

    const processRef = spawn(pythonBin, [PYTHON_SCRIPT], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    processRef.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    processRef.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    processRef.on("error", (error) => {
      console.warn(`Prophet service unavailable, using fallback forecast: ${error.message}`);
      resolveOnce(buildFallbackForecast(records, options));
    });

    processRef.on("close", (code) => {
      if (settled) return;

      if (code !== 0) {
        console.warn(`Prophet service failed, using fallback forecast: ${stderr || `Exit code ${code}`}`);
        resolveOnce(buildFallbackForecast(records, options));
        return;
      }

      try {
        const parsed = JSON.parse(stdout || "{}");
        resolveOnce(parsed);
      } catch (error) {
        console.warn(`Invalid Prophet output, using fallback forecast: ${error.message}`);
        resolveOnce(buildFallbackForecast(records, options));
      }
    });

    processRef.stdin.on("error", (error) => {
      console.warn(`Prophet stdin error, using fallback forecast: ${error.message}`);
      resolveOnce(buildFallbackForecast(records, options));
    });

    try {
      processRef.stdin.write(JSON.stringify(payload));
      processRef.stdin.end();
    } catch (error) {
      console.warn(`Prophet write failed, using fallback forecast: ${error.message}`);
      resolveOnce(buildFallbackForecast(records, options));
    }
  });
};

module.exports = {
  runProphetForecast,
};
