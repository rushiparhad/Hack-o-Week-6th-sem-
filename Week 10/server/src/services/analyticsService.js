const SustainabilityRecord = require("../models/SustainabilityRecord");
const {
  linearRegressionForecast,
  movingAverage,
  exponentialSmoothing,
  ensembleForecast,
} = require("../utils/math");

function toDateRange(from, to) {
  const now = new Date();
  const fromDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const toDate = to ? new Date(to) : now;
  return { fromDate, toDate };
}

function buildFilter({ from, to, department, building }) {
  const { fromDate, toDate } = toDateRange(from, to);
  const query = {
    timestamp: { $gte: fromDate, $lte: toDate },
  };

  if (department && department !== "all") query.department = department;
  if (building && building !== "all") query.building = building;

  return query;
}

function deriveSustainabilityScore({ energy, water, waste, carbon }) {
  const energyPenalty = Math.min(40, energy / 60);
  const waterPenalty = Math.min(30, water / 40);
  const wastePenalty = Math.min(20, waste / 18);
  const carbonBoost = Math.min(30, carbon / 25);
  const score = 100 - energyPenalty - waterPenalty - wastePenalty + carbonBoost;
  return Math.max(0, Math.min(100, Number(score.toFixed(1))));
}

async function getFilterMetadata(from, to) {
  const { fromDate, toDate } = toDateRange(from, to);
  const [departments, buildings] = await Promise.all([
    SustainabilityRecord.distinct("department", { timestamp: { $gte: fromDate, $lte: toDate } }),
    SustainabilityRecord.distinct("building", { timestamp: { $gte: fromDate, $lte: toDate } }),
  ]);

  return {
    departments: departments.sort(),
    buildings: buildings.sort(),
  };
}

async function getDashboardData(filters) {
  const query = buildFilter(filters);

  const [records, departmentComparison, dailyTrend] = await Promise.all([
    SustainabilityRecord.find(query).sort({ timestamp: 1 }).lean(),
    SustainabilityRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$department",
          energyUsage: { $sum: "$energyUsage" },
          waterUsage: { $sum: "$waterUsage" },
          wasteMetric: { $sum: "$wasteMetric" },
          carbonSaved: { $sum: "$carbonSaved" },
        },
      },
      { $sort: { energyUsage: -1 } },
    ]),
    SustainabilityRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          energyUsage: { $sum: "$energyUsage" },
          waterUsage: { $sum: "$waterUsage" },
          wasteMetric: { $sum: "$wasteMetric" },
          carbonSaved: { $sum: "$carbonSaved" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]),
  ]);

  const totals = records.reduce(
    (acc, item) => {
      acc.energyUsage += item.energyUsage;
      acc.waterUsage += item.waterUsage;
      acc.wasteMetric += item.wasteMetric;
      acc.carbonSaved += item.carbonSaved;
      return acc;
    },
    { energyUsage: 0, waterUsage: 0, wasteMetric: 0, carbonSaved: 0 }
  );

  const kpis = {
    totalEnergyConsumption: Number(totals.energyUsage.toFixed(2)),
    waterUsage: Number(totals.waterUsage.toFixed(2)),
    carbonEmissionsSaved: Number(totals.carbonSaved.toFixed(2)),
    sustainabilityScore: deriveSustainabilityScore({
      energy: totals.energyUsage,
      water: totals.waterUsage,
      waste: totals.wasteMetric,
      carbon: totals.carbonSaved,
    }),
  };

  const trends = dailyTrend.map((item) => ({
    date: `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day).padStart(2, "0")}`,
    energyUsage: Number(item.energyUsage.toFixed(2)),
    waterUsage: Number(item.waterUsage.toFixed(2)),
    wasteMetric: Number(item.wasteMetric.toFixed(2)),
    carbonSaved: Number(item.carbonSaved.toFixed(2)),
  }));

  const comparison = departmentComparison.map((item) => ({
    department: item._id,
    energyUsage: Number(item.energyUsage.toFixed(2)),
    waterUsage: Number(item.waterUsage.toFixed(2)),
    carbonSaved: Number(item.carbonSaved.toFixed(2)),
    sustainabilityScore: deriveSustainabilityScore({
      energy: item.energyUsage,
      water: item.waterUsage,
      waste: item.wasteMetric,
      carbon: item.carbonSaved,
    }),
  }));

  const resourceDistribution = [
    { name: "Energy", value: Number(totals.energyUsage.toFixed(2)) },
    { name: "Water", value: Number(totals.waterUsage.toFixed(2)) },
    { name: "Waste", value: Number(totals.wasteMetric.toFixed(2)) },
  ];

  const alerts = trends
    .filter((entry) => entry.energyUsage > (kpis.totalEnergyConsumption / Math.max(trends.length, 1)) * 1.25)
    .slice(-5)
    .map((entry) => ({
      date: entry.date,
      severity: "medium",
      message: `High energy consumption observed on ${entry.date}.`,
    }));

  return {
    kpis,
    trends,
    comparison,
    resourceDistribution,
    alerts,
    totalRecords: records.length,
  };
}

async function getPredictionData(filters) {
  const query = buildFilter(filters);

  const dailyEnergy = await SustainabilityRecord.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          year: { $year: "$timestamp" },
          month: { $month: "$timestamp" },
          day: { $dayOfMonth: "$timestamp" },
        },
        energyUsage: { $sum: "$energyUsage" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  const values = dailyEnergy.map((entry) => entry.energyUsage);
  const labels = dailyEnergy.map(
    (entry) => `${entry._id.year}-${String(entry._id.month).padStart(2, "0")}-${String(entry._id.day).padStart(2, "0")}`
  );

  const movingAvg = movingAverage(values, 5);
  const expSmoothing = exponentialSmoothing(values, 0.35);
  const linear = linearRegressionForecast(values, 7);
  const ensemble = ensembleForecast(linear, expSmoothing.slice(-7));

  const forecast = ensemble.map((value, index) => ({
    dayOffset: index + 1,
    predictedEnergyUsage: Number(value.toFixed(2)),
  }));

  return {
    sourceSeries: labels.map((date, index) => ({
      date,
      actual: Number(values[index].toFixed(2)),
      movingAverage: Number((movingAvg[index] || 0).toFixed(2)),
      exponentialSmoothing: Number((expSmoothing[index] || 0).toFixed(2)),
    })),
    forecast,
  };
}

async function getDrilldownData(filters) {
  const query = buildFilter(filters);
  const treeData = await SustainabilityRecord.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          campus: "$campus",
          department: "$department",
          building: "$building",
        },
        energyUsage: { $sum: "$energyUsage" },
        waterUsage: { $sum: "$waterUsage" },
        wasteMetric: { $sum: "$wasteMetric" },
        carbonSaved: { $sum: "$carbonSaved" },
      },
    },
    { $sort: { "_id.campus": 1, "_id.department": 1, "_id.building": 1 } },
  ]);

  return treeData.map((node) => ({
    campus: node._id.campus,
    department: node._id.department,
    building: node._id.building,
    energyUsage: Number(node.energyUsage.toFixed(2)),
    waterUsage: Number(node.waterUsage.toFixed(2)),
    wasteMetric: Number(node.wasteMetric.toFixed(2)),
    carbonSaved: Number(node.carbonSaved.toFixed(2)),
    sustainabilityScore: deriveSustainabilityScore({
      energy: node.energyUsage,
      water: node.waterUsage,
      waste: node.wasteMetric,
      carbon: node.carbonSaved,
    }),
  }));
}

module.exports = {
  getDashboardData,
  getPredictionData,
  getDrilldownData,
  getFilterMetadata,
};
