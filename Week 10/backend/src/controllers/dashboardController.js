const { Parser } = require("json2csv");
const asyncHandler = require("../utils/asyncHandler");
const {
  getDashboardData,
  getPredictionData,
  getDrilldownData,
  getFilterMetadata,
} = require("../services/analyticsService");

const getDashboard = asyncHandler(async (req, res) => {
  const data = await getDashboardData(req.query);
  res.json({ success: true, data });
});

const getPredictions = asyncHandler(async (req, res) => {
  const data = await getPredictionData(req.query);
  res.json({ success: true, data });
});

const getDrilldown = asyncHandler(async (req, res) => {
  const data = await getDrilldownData(req.query);
  res.json({ success: true, data });
});

const getFilters = asyncHandler(async (req, res) => {
  const data = await getFilterMetadata(req.query.from, req.query.to);
  res.json({ success: true, data });
});

const exportCsv = asyncHandler(async (req, res) => {
  const { trends } = await getDashboardData(req.query);
  const parser = new Parser({
    fields: ["date", "energyConsumption", "waterUsage", "carbonEmissions", "wasteGenerated", "smoothedEnergy"],
  });
  const csv = parser.parse(trends);

  res.header("Content-Type", "text/csv");
  res.attachment("campus-sustainability-report.csv");
  res.send(csv);
});

const streamData = asyncHandler(async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendUpdate = async () => {
    const payload = await getDashboardData(req.query);
    res.write(`data: ${JSON.stringify(payload.kpis)}\n\n`);
  };

  await sendUpdate();
  const timer = setInterval(sendUpdate, 12000);

  req.on("close", () => {
    clearInterval(timer);
    res.end();
  });
});

module.exports = {
  getDashboard,
  getPredictions,
  getDrilldown,
  getFilters,
  exportCsv,
  streamData,
};