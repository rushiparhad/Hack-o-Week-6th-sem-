/**
 * Data Simulator Service
 * Simulates realistic health metric data streams
 */

/**
 * Realistic BPM data generator
 * Simulates normal heart rate with occasional spikes
 */
export class BPMSimulator {
  constructor() {
    this.baseBPM = 75; // Normal resting heart rate
    this.currentBPM = this.baseBPM;
    this.trend = 0; // Trending up or down
  }

  /**
   * Generate next BPM value with realistic variation
   * @returns {number} - BPM value
   */
  getNext() {
    // Add trend component
    this.trend += (Math.random() - 0.5) * 5;
    this.trend = Math.max(-10, Math.min(10, this.trend)); // Limit trend

    // Base variation
    const randomVariation = (Math.random() - 0.5) * 15;

    // Current BPM with trend
    let bpm = this.baseBPM + this.trend + randomVariation;

    // Simulate anomalies (15% chance)
    if (Math.random() < 0.15) {
      bpm = 100 + Math.random() * 45; // Spike to 100-145 BPM
    }

    // Keep within physiological limits
    bpm = Math.max(40, Math.min(180, bpm));
    this.currentBPM = Math.round(bpm);

    return this.currentBPM;
  }

  reset() {
    this.currentBPM = this.baseBPM;
    this.trend = 0;
  }
}

/**
 * Realistic oxygen saturation data generator
 */
export class OxygenSimulator {
  constructor(baseOxygen = 97) {
    this.baseOxygen = baseOxygen;
  }

  getNext() {
    const variation = (Math.random() - 0.5) * 4;
    let oxygen = this.baseOxygen + variation;

    // 5% chance of low oxygen
    if (Math.random() < 0.05) {
      oxygen = 88 + Math.random() * 5;
    }

    return Math.max(80, Math.min(100, Math.round(oxygen * 10) / 10));
  }
}

/**
 * Realistic temperature data generator
 */
export class TemperatureSimulator {
  constructor(baseTemp = 36.7) {
    this.baseTemp = baseTemp;
  }

  getNext() {
    const variation = (Math.random() - 0.5) * 1;
    let temp = this.baseTemp + variation;

    // 3% chance of fever
    if (Math.random() < 0.03) {
      temp = 37.5 + Math.random() * 2;
    }

    return Math.round(temp * 10) / 10;
  }
}

/**
 * Start continuous data simulation
 * Emits data at specified interval
 */
export const startDataSimulation = (interval = 1000, onData = () => {}) => {
  const bpmSim = new BPMSimulator();
  const o2Sim = new OxygenSimulator();
  const tempSim = new TemperatureSimulator();

  const simulationInterval = setInterval(() => {
    const data = {
      timestamp: new Date().toISOString(),
      bpm: bpmSim.getNext(),
      oxygen: o2Sim.getNext(),
      temperature: tempSim.getNext(),
    };

    onData(data);
  }, interval);

  // Return function to stop simulation
  return () => clearInterval(simulationInterval);
};

export default {
  BPMSimulator,
  OxygenSimulator,
  TemperatureSimulator,
  startDataSimulation,
};
