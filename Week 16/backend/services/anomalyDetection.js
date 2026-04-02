/**
 * Anomaly Detection Service
 * Detects anomalies in health metrics
 */

/**
 * Configuration thresholds for different metrics
 */
const THRESHOLDS = {
  BPM_LOW: 50,
  BPM_HIGH: 100, // Alert threshold
  BPM_CRITICAL: 120, // Critical threshold
  OXYGEN_LOW: 90,
  TEMPERATURE_HIGH: 38.5,
  TEMPERATURE_LOW: 35,
};

/**
 * Detect anomaly in BPM reading
 * @param {number} bpm - Beats per minute value
 * @returns {object} - { isAnomaly, severity, message }
 */
export const detectAnomaly = (bpm) => {
  // Check for critical high BPM
  if (bpm >= THRESHOLDS.BPM_CRITICAL) {
    return {
      isAnomaly: true,
      severity: 'critical',
      message: `🔴 CRITICAL: Heart rate dangerously high at ${bpm} BPM!`,
      threshold: THRESHOLDS.BPM_CRITICAL,
    };
  }

  // Check for warning high BPM
  if (bpm >= THRESHOLDS.BPM_HIGH) {
    return {
      isAnomaly: true,
      severity: 'warning',
      message: `🟡 WARNING: Heart rate elevated at ${bpm} BPM`,
      threshold: THRESHOLDS.BPM_HIGH,
    };
  }

  // Check for low BPM
  if (bpm <= THRESHOLDS.BPM_LOW) {
    return {
      isAnomaly: true,
      severity: 'warning',
      message: `🟡 WARNING: Heart rate abnormally low at ${bpm} BPM`,
      threshold: THRESHOLDS.BPM_LOW,
    };
  }

  // Normal range
  return {
    isAnomaly: false,
    severity: 'normal',
    message: `✅ Heart rate normal at ${bpm} BPM`,
  };
};

/**
 * Detect anomaly in oxygen levels
 * @param {number} oxygen - SpO2 percentage
 * @returns {object} - { isAnomaly, severity, message }
 */
export const detectOxygenAnomaly = (oxygen) => {
  if (oxygen < THRESHOLDS.OXYGEN_LOW) {
    return {
      isAnomaly: true,
      severity: oxygen < 88 ? 'critical' : 'warning',
      message: `Oxygen level low: ${oxygen}%`,
      threshold: THRESHOLDS.OXYGEN_LOW,
    };
  }

  return {
    isAnomaly: false,
    severity: 'normal',
    message: `Oxygen level normal: ${oxygen}%`,
  };
};

/**
 * Detect anomaly in temperature
 * @param {number} temperature - Temperature in Celsius
 * @returns {object} - { isAnomaly, severity, message }
 */
export const detectTemperatureAnomaly = (temperature) => {
  if (temperature >= THRESHOLDS.TEMPERATURE_HIGH) {
    return {
      isAnomaly: true,
      severity: temperature >= 39.5 ? 'critical' : 'warning',
      message: `High fever: ${temperature}°C`,
      threshold: THRESHOLDS.TEMPERATURE_HIGH,
    };
  }

  if (temperature <= THRESHOLDS.TEMPERATURE_LOW) {
    return {
      isAnomaly: true,
      severity: 'warning',
      message: `Low temperature: ${temperature}°C`,
      threshold: THRESHOLDS.TEMPERATURE_LOW,
    };
  }

  return {
    isAnomaly: false,
    severity: 'normal',
    message: `Temperature normal: ${temperature}°C`,
  };
};

/**
 * Comprehensive anomaly detection across all metrics
 * @param {object} metrics - Object containing bpm, oxygen, temperature, etc.
 * @returns {array} - Array of detected anomalies
 */
export const detectMultipleAnomalies = (metrics) => {
  const anomalies = [];

  if (metrics.bpm !== undefined) {
    const bpmAnomaly = detectAnomaly(metrics.bpm);
    if (bpmAnomaly.isAnomaly) anomalies.push(bpmAnomaly);
  }

  if (metrics.oxygen !== undefined) {
    const oxygenAnomaly = detectOxygenAnomaly(metrics.oxygen);
    if (oxygenAnomaly.isAnomaly) anomalies.push(oxygenAnomaly);
  }

  if (metrics.temperature !== undefined) {
    const tempAnomaly = detectTemperatureAnomaly(metrics.temperature);
    if (tempAnomaly.isAnomaly) anomalies.push(tempAnomaly);
  }

  return anomalies;
};

/**
 * Get severity color for UI rendering
 * @param {string} severity - 'normal', 'warning', 'critical'
 * @returns {string} - Color code or class name
 */
export const getSeverityColor = (severity) => {
  const colors = {
    normal: '#10b981', // Green
    warning: '#f59e0b', // Yellow/Amber
    critical: '#ef4444', // Red
  };
  return colors[severity] || colors.normal;
};

export default {
  detectAnomaly,
  detectOxygenAnomaly,
  detectTemperatureAnomaly,
  detectMultipleAnomalies,
  getSeverityColor,
  THRESHOLDS,
};
