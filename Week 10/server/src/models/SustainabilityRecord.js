const mongoose = require("mongoose");

const SustainabilityRecordSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true, index: true },
    campus: { type: String, required: true, default: "Main Campus" },
    department: { type: String, required: true, index: true },
    building: { type: String, required: true, index: true },
    energyUsage: { type: Number, required: true },
    waterUsage: { type: Number, required: true },
    wasteMetric: { type: Number, required: true },
    carbonSaved: { type: Number, required: true },
  },
  { timestamps: true }
);

SustainabilityRecordSchema.index({ timestamp: 1, department: 1, building: 1 });

module.exports = mongoose.model("SustainabilityRecord", SustainabilityRecordSchema);
