const mongoose = require("mongoose");

const laundryLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    loadCount: {
      type: Number,
      required: true,
      min: 0,
    },
    hostelBlock: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D", "E"],
      index: true,
    },
    machineType: {
      type: String,
      enum: ["washer", "dryer"],
      default: "washer",
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    hourOfDay: {
      type: Number,
      required: true,
      min: 0,
      max: 23,
    },
  },
  {
    timestamps: true,
  }
);

laundryLogSchema.index({ hostelBlock: 1, timestamp: 1 });
laundryLogSchema.index({ timestamp: 1, loadCount: 1 });

module.exports = mongoose.model("LaundryLog", laundryLogSchema);
