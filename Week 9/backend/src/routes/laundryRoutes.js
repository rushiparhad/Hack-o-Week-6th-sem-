const express = require("express");

const {
  history,
  categorized,
  forecast,
  dashboard,
} = require("../controllers/laundryController");

const router = express.Router();

router.get("/history", history);
router.get("/categorized", categorized);
router.get("/forecast", forecast);
router.get("/dashboard", dashboard);

module.exports = router;
