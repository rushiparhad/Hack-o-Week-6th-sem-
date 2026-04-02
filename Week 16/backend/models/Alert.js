/**
 * Alert Model
 * Represents an alert triggered by anomaly detection
 */

export class Alert {
  constructor(data = {}) {
    this.id = data.id || Date.now();
    this.timestamp = data.timestamp || new Date().toISOString();
    this.severity = data.severity || 'normal'; // 'normal', 'warning', 'critical'
    this.message = data.message || '';
    this.value = data.value || null; // The value that triggered alert
    this.type = data.type || 'GENERIC'; // Alert type (e.g., BPM_ANOMALY)
    this.read = data.read || false;
    this.metadata = data.metadata || {};
  }

  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      severity: this.severity,
      message: this.message,
      value: this.value,
      type: this.type,
      read: this.read,
      metadata: this.metadata,
    };
  }
}

/**
 * Mock database for storing alerts
 * In production, this would be MongoDB
 */
export class AlertStore {
  constructor() {
    this.alerts = [];
  }

  add(alertData) {
    const alert = new Alert(alertData);
    this.alerts.push(alert);
    return alert;
  }

  getAll(filter = {}) {
    let result = [...this.alerts];

    if (filter.severity) {
      result = result.filter((a) => a.severity === filter.severity);
    }

    if (filter.limit) {
      result = result.slice(-filter.limit);
    }

    return result;
  }

  getById(id) {
    return this.alerts.find((a) => a.id === id);
  }

  markAsRead(id) {
    const alert = this.getById(id);
    if (alert) alert.read = true;
    return alert;
  }

  clear() {
    this.alerts = [];
  }
}
