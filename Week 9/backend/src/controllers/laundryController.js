const dayjs = require("dayjs");

const LaundryLog = require("../models/LaundryLog");
const asyncHandler = require("../utils/asyncHandler");
const { categorizeUsage } = require("../services/naiveBayesService");
const { runProphetForecast } = require("../services/prophetService");

const buildFilter = (query) => {
  const filter = {};

  if (query.block) {
    filter.hostelBlock = query.block;
  }

  if (query.startDate || query.endDate) {
    filter.timestamp = {};
    if (query.startDate) {
      filter.timestamp.$gte = dayjs(query.startDate).startOf("day").toDate();
    }
    if (query.endDate) {
      filter.timestamp.$lte = dayjs(query.endDate).endOf("day").toDate();
    }
  }

  return filter;
};

const getHistoricalData = async (query) => {
  const filter = buildFilter(query);
  const limit = Math.min(Number(query.limit || 2000), 10000);

  const rows = await LaundryLog.find(filter)
    .sort({ timestamp: 1 })
    .limit(limit)
    .lean();

  return rows.map((row) => ({
    id: row._id,
    timestamp: row.timestamp,
    loadCount: row.loadCount,
    hostelBlock: row.hostelBlock,
    machineType: row.machineType,
    dayOfWeek: row.dayOfWeek,
    hourOfDay: row.hourOfDay,
  }));
};

const history = asyncHandler(async (req, res) => {
  const data = await getHistoricalData(req.query);

  res.json({
    success: true,
    count: data.length,
    data,
  });
});

const categorized = asyncHandler(async (req, res) => {
  const data = await getHistoricalData(req.query);
  const result = categorizeUsage(data);

  res.json({
    success: true,
    data: result,
  });
});

const forecast = asyncHandler(async (req, res) => {
  const data = await getHistoricalData(req.query);

  if (!data.length) {
    res.status(404);
    throw new Error("No usage data found for forecast with current filters.");
  }

  const horizon = Number(req.query.horizon || 48);
  const loadFactor = Number(req.query.loadFactor || 1);

  const result = await runProphetForecast(data, { horizon, loadFactor });

  res.json({
    success: true,
    data: result,
  });
});

const dashboard = asyncHandler(async (req, res) => {
  const data = await getHistoricalData(req.query);

  if (!data.length) {
    res.status(404);
    throw new Error("No usage data found for dashboard with current filters.");
  }

  const categorizedData = categorizeUsage(data);
  const forecastData = await runProphetForecast(data, {
    horizon: Number(req.query.horizon || 48),
    loadFactor: Number(req.query.loadFactor || 1),
  });

  const totalUsage = data.reduce((sum, row) => sum + row.loadCount, 0);
  const avgLoad = Number((totalUsage / data.length).toFixed(2));

  const hourlyMap = data.reduce((acc, row) => {
    acc[row.hourOfDay] = (acc[row.hourOfDay] || 0) + row.loadCount;
    return acc;
  }, {});

  const peakHours = Object.entries(hourlyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour]) => Number(hour));

  const kpis = {
    totalUsage,
    peakHours,
    avgLoad,
    predictionAccuracy: categorizedData.accuracy,
  };

  res.json({
    success: true,
    data: {
      kpis,
      history: data,
      categorized: categorizedData,
      forecast: forecastData,
    },
  });
});

module.exports = {
  history,
  categorized,
  forecast,
  dashboard,
};
