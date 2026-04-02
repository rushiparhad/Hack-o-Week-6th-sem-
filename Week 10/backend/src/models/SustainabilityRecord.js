const mongoose = require("mongoose");

const sustainabilityRecordSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true, index: true },
    campus: { type: String, required: true, default: "Main Campus", index: true },
    department: { type: String, required: true, index: true },
    building: { type: String, required: true, index: true },
    energyConsumption: { type: Number, required: true },
    waterUsage: { type: Number, required: true },
    carbonEmissions: { type: Number, required: true },
    wasteGenerated: { type: Number, required: true },
  },
  { timestamps: true }
);

sustainabilityRecordSchema.index({ timestamp: 1, campus: 1, department: 1, building: 1 });

module.exports = mongoose.model("SustainabilityRecord", sustainabilityRecordSchema);