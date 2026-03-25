const express = require("express");
const {
  getDashboard,
  getPredictions,
  getDrilldown,
  getFilters,
  exportCsv,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/dashboard", getDashboard);
router.get("/predictions", getPredictions);
router.get("/drilldown", getDrilldown);
router.get("/filters", getFilters);
router.get("/export/csv", exportCsv);

module.exports = router;
