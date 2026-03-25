const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const laundryRoutes = require("./routes/laundryRoutes");
const authRoutes = require("./routes/authRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ success: true, status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/laundry", laundryRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
