const mongoose = require('mongoose');

const exportLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    format: {
      type: String,
      enum: ['csv', 'pdf'],
      required: true
    },
    dateFrom: Date,
    dateTo: Date,
    severity: {
      type: String,
      enum: ['all', 'normal', 'high', 'critical'],
      default: 'all'
    },
    recordsExported: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExportLog', exportLogSchema);
