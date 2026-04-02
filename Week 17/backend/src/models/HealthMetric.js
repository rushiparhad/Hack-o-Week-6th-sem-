const mongoose = require('mongoose');

const encryptedFieldSchema = new mongoose.Schema(
  {
    iv: { type: String, required: true },
    content: { type: String, required: true },
    tag: { type: String, required: true }
  },
  { _id: false }
);

const healthMetricSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    bpmEncrypted: {
      type: encryptedFieldSchema,
      required: true
    },
    isAnomaly: {
      type: Boolean,
      default: false,
      index: true
    },
    severity: {
      type: String,
      enum: ['normal', 'high', 'critical'],
      default: 'normal'
    },
    anomalyReason: {
      type: String,
      default: 'Within expected BPM range'
    },
    measuredAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthMetric', healthMetricSchema);
