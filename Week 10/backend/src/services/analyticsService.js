const SustainabilityRecord = require("../models/SustainabilityRecord");
const {
  linearRegressionForecast,
  movingAverage,
  exponentialSmoothing,
  blendForecast,
} = require("../utils/math");

function toDateRange(from, to) {
  const now = new Date();
  const fromDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const toDate = to ? new Date(to) : now;
  return { fromDate, toDate };
}

function buildFilter({ from, to, building, department, campus }) {
  const { fromDate, toDate } = toDateRange(from, to);
  const query = {
    timestamp: { $gte: fromDate, $lte: toDate },
  };

  if (building && building !== "all") query.building = building;
  if (department && department !== "all") query.department = department;
  if (campus && campus !== "all") query.campus = campus;

  return query;
}

function formatDay(dateBits) {
  return `${dateBits.year}-${String(dateBits.month).padStart(2, "0")}-${String(dateBits.day).padStart(2, "0")}`;
}

function safePercentChange(current, previous) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

function deriveSustainabilityScore(metrics) {
  const normalizedEnergy = Math.min(100, metrics.energyConsumption / 160);
  const normalizedWater = Math.min(100, metrics.waterUsage / 120);
  const normalizedCarbon = Math.min(100, metrics.carbonEmissions / 60);
  const normalizedWaste = Math.min(100, metrics.wasteGenerated / 22);

  const score =
    100 -
    (0.35 * normalizedEnergy +
      0.25 * normalizedWater +
      0.25 * normalizedCarbon +
      0.15 * normalizedWaste);

  return Math.max(0, Math.min(100, Number(score.toFixed(1))));
}

function getAnomalies(trends) {
  if (!trends.length) return [];

  const values = trends.map((row) => row.energyConsumption);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance) || 1;

  return trends
    .filter((row) => (row.energyConsumption - mean) / stdDev > 1.4)
    .slice(-6)
    .map((row) => ({
      date: row.date,
      metric: "energyConsumption",
      severity: row.energyConsumption > mean + 2 * stdDev ? "critical" : "warning",
      value: row.energyConsumption,
      message: `Energy usage spike detected on ${row.date}.`,
    }));
}

function getRecommendations({ kpis, anomalies }) {
  const list = [];
  if (kpis.energyConsumption > 140000) {
    list.push("Reduce HVAC runtime in high-consumption blocks during peak hours.");
  }
  if (kpis.waterUsage > 90000) {
    list.push("Water usage is above average. Audit washroom leak points and irrigation timing.");
  }
  if (kpis.wasteGenerated > 30000) {
    list.push("Waste generation is high. Introduce source-level segregation drives per department.");
  }
  if (anomalies.length > 0) {
    list.push("Monitor anomaly days closely and run targeted inspections in affected buildings.");
  }
  if (list.length === 0) {
    list.push("Current sustainability profile is stable. Continue weekly optimization reviews.");
  }
  return list;
}

async function getFilterMetadata(from, to) {
  const { fromDate, toDate } = toDateRange(from, to);

  const [campuses, departments, buildings] = await Promise.all([
    SustainabilityRecord.distinct("campus", { timestamp: { $gte: fromDate, $lte: toDate } }),
    SustainabilityRecord.distinct("department", { timestamp: { $gte: fromDate, $lte: toDate } }),
    SustainabilityRecord.distinct("building", { timestamp: { $gte: fromDate, $lte: toDate } }),
  ]);

  return {
    campuses: campuses.sort(),
    departments: departments.sort(),
    buildings: buildings.sort(),
  };
}

async function getDashboardData(filters) {
  const query = buildFilter(filters);
  const prevQuery = buildFilter({
    ...filters,
    from: filters.previousFrom,
    to: filters.previousTo,
  });

  const [currentRecords, previousRecords, dailyTrend, departmentSplit] = await Promise.all([
    SustainabilityRecord.find(query).sort({ timestamp: 1 }).lean(),
    SustainabilityRecord.find(prevQuery).lean(),
    SustainabilityRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          energyConsumption: { $sum: "$energyConsumption" },
          waterUsage: { $sum: "$waterUsage" },
          carbonEmissions: { $sum: "$carbonEmissions" },
          wasteGenerated: { $sum: "$wasteGenerated" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]),
    SustainabilityRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$department",
          energyConsumption: { $sum: "$energyConsumption" },
          waterUsage: { $sum: "$waterUsage" },
          carbonEmissions: { $sum: "$carbonEmissions" },
          wasteGenerated: { $sum: "$wasteGenerated" },
        },
      },
      { $sort: { energyConsumption: -1 } },
    ]),
  ]);

  const aggregate = (records) =>
    records.reduce(
      (acc, row) => {
        acc.energyConsumption += row.energyConsumption;
        acc.waterUsage += row.waterUsage;
        acc.carbonEmissions += row.carbonEmissions;
        acc.wasteGenerated += row.wasteGenerated;
        return acc;
      },
      { energyConsumption: 0, waterUsage: 0, carbonEmissions: 0, wasteGenerated: 0 }
    );

  const currentTotals = aggregate(currentRecords);
  const previousTotals = aggregate(previousRecords);

  const kpis = {
    energyConsumption: Number(currentTotals.energyConsumption.toFixed(2)),
    waterUsage: Number(currentTotals.waterUsage.toFixed(2)),
    carbonEmissions: Number(currentTotals.carbonEmissions.toFixed(2)),
    wasteGenerated: Number(currentTotals.wasteGenerated.toFixed(2)),
    sustainabilityScore: deriveSustainabilityScore(currentTotals),
  };

  const comparisons = {
    energyConsumption: Number(safePercentChange(currentTotals.energyConsumption, previousTotals.energyConsumption).toFixed(2)),
    waterUsage: Number(safePercentChange(currentTotals.waterUsage, previousTotals.waterUsage).toFixed(2)),
    carbonEmissions: Number(safePercentChange(currentTotals.carbonEmissions, previousTotals.carbonEmissions).toFixed(2)),
    wasteGenerated: Number(safePercentChange(currentTotals.wasteGenerated, previousTotals.wasteGenerated).toFixed(2)),
  };

  const trends = dailyTrend.map((row) => ({
    date: formatDay(row._id),
    energyConsumption: Number(row.energyConsumption.toFixed(2)),
    waterUsage: Number(row.waterUsage.toFixed(2)),
    carbonEmissions: Number(row.carbonEmissions.toFixed(2)),
    wasteGenerated: Number(row.wasteGenerated.toFixed(2)),
  }));

  const smoothing = movingAverage(trends.map((row) => row.energyConsumption), 7);
  const enrichedTrends = trends.map((row, index) => ({
    ...row,
    smoothedEnergy: Number((smoothing[index] ?? row.energyConsumption).toFixed(2)),
  }));

  const anomalies = getAnomalies(enrichedTrends);
  const recommendations = getRecommendations({ kpis, anomalies });

  const distribution = departmentSplit.map((row) => ({
    name: row._id,
    energyConsumption: Number(row.energyConsumption.toFixed(2)),
    waterUsage: Number(row.waterUsage.toFixed(2)),
    carbonEmissions: Number(row.carbonEmissions.toFixed(2)),
    wasteGenerated: Number(row.wasteGenerated.toFixed(2)),
    sustainabilityScore: deriveSustainabilityScore(row),
  }));

  return {
    kpis,
    comparisons,
    trends: enrichedTrends,
    distribution,
    anomalies,
    recommendations,
    totalRecords: currentRecords.length,
  };
}

function forecastSeries(values, horizon = 7) {
  const regression = linearRegressionForecast(values, horizon);
  const smoothing = exponentialSmoothing(values, 0.35);
  const trailingSmoothing = smoothing.slice(-horizon);
  return blendForecast(regression, trailingSmoothing);
}

async function getPredictionData(filters) {
  const query = buildFilter(filters);

  const dailyData = await SustainabilityRecord.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          year: { $year: "$timestamp" },
          month: { $month: "$timestamp" },
          day: { $dayOfMonth: "$timestamp" },
        },
        energyConsumption: { $sum: "$energyConsumption" },
        waterUsage: { $sum: "$waterUsage" },
        carbonEmissions: { $sum: "$carbonEmissions" },
        wasteGenerated: { $sum: "$wasteGenerated" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  const toArray = (key) => dailyData.map((row) => row[key]);
  const trendPoints = dailyData.map((row) => ({
    date: formatDay(row._id),
    energyConsumption: Number(row.energyConsumption.toFixed(2)),
    waterUsage: Number(row.waterUsage.toFixed(2)),
    carbonEmissions: Number(row.carbonEmissions.toFixed(2)),
    wasteGenerated: Number(row.wasteGenerated.toFixed(2)),
  }));

  const energyForecast = forecastSeries(toArray("energyConsumption"));
  const waterForecast = forecastSeries(toArray("waterUsage"));
  const carbonForecast = forecastSeries(toArray("carbonEmissions"));
  const wasteForecast = forecastSeries(toArray("wasteGenerated"));

  const forecast = energyForecast.map((value, index) => ({
    day: index + 1,
    energyConsumption: Number(value.toFixed(2)),
    waterUsage: Number((waterForecast[index] ?? 0).toFixed(2)),
    carbonEmissions: Number((carbonForecast[index] ?? 0).toFixed(2)),
    wasteGenerated: Number((wasteForecast[index] ?? 0).toFixed(2)),
  }));

  return { trendPoints, forecast };
}

async function getDrilldownData(filters) {
  const query = buildFilter(filters);

  const rows = await SustainabilityRecord.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          building: "$building",
          department: "$department",
          campus: "$campus",
        },
        energyConsumption: { $sum: "$energyConsumption" },
        waterUsage: { $sum: "$waterUsage" },
        carbonEmissions: { $sum: "$carbonEmissions" },
        wasteGenerated: { $sum: "$wasteGenerated" },
      },
    },
    { $sort: { energyConsumption: -1 } },
  ]);

  const points = rows.map((row) => ({
    building: row._id.building,
    department: row._id.department,
    campus: row._id.campus,
    energyConsumption: Number(row.energyConsumption.toFixed(2)),
    waterUsage: Number(row.waterUsage.toFixed(2)),
    carbonEmissions: Number(row.carbonEmissions.toFixed(2)),
    wasteGenerated: Number(row.wasteGenerated.toFixed(2)),
    sustainabilityScore: deriveSustainabilityScore(row),
  }));

  const { compareA, compareB } = filters;
  let comparison = null;
  if (compareA && compareB && compareA !== compareB) {
    const [left, right] = [compareA, compareB].map(
      (building) =>
        points.find((point) => point.building === building) || {
          building,
          energyConsumption: 0,
          waterUsage: 0,
          carbonEmissions: 0,
          wasteGenerated: 0,
          sustainabilityScore: 0,
        }
    );

    comparison = {
      left,
      right,
      delta: {
        energyConsumption: Number((left.energyConsumption - right.energyConsumption).toFixed(2)),
        waterUsage: Number((left.waterUsage - right.waterUsage).toFixed(2)),
        carbonEmissions: Number((left.carbonEmissions - right.carbonEmissions).toFixed(2)),
        wasteGenerated: Number((left.wasteGenerated - right.wasteGenerated).toFixed(2)),
      },
    };
  }

  return { points, comparison };
}

module.exports = {
  getDashboardData,
  getPredictionData,
  getDrilldownData,
  getFilterMetadata,
};