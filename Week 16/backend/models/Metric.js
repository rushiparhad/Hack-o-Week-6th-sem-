/**
 * Metric Model
 * Represents a health metric data point
 */

export class Metric {
  constructor(data = {}) {
    this.id = data.id || Date.now();
    this.timestamp = data.timestamp || new Date().toISOString();
    this.bpm = data.bpm || 0; // Beats per minute
    this.heart_rate = data.heart_rate || 0;
    this.oxygen = data.oxygen || 95; // SpO2 percentage
    this.temperature = data.temperature || 36.5; // Celsius
  }

  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      bpm: this.bpm,
      heart_rate: this.heart_rate,
      oxygen: this.oxygen,
      temperature: this.temperature,
    };
  }
}

/**
 * Mock database for storing metrics
 * In production, this would be MongoDB
 */
export class MetricStore {
  constructor() {
    this.metrics = [];
  }

  add(metricData) {
    const metric = new Metric(metricData);
    this.metrics.push(metric);
    return metric;
  }

  getAll(limit = 100) {
    return this.metrics.slice(-limit);
  }

  getLatest() {
    return this.metrics[this.metrics.length - 1] || null;
  }

  getRange(startTime, endTime) {
    return this.metrics.filter(
      (m) =>
        new Date(m.timestamp) >= new Date(startTime) &&
        new Date(m.timestamp) <= new Date(endTime)
    );
  }

  clear() {
    this.metrics = [];
  }
}
