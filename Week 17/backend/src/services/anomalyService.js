function detectAnomaly(bpm) {
  if (bpm > 120) {
    return { isAnomaly: true, severity: 'critical', reason: 'BPM greater than 120' };
  }

  if (bpm > 100) {
    return { isAnomaly: true, severity: 'high', reason: 'BPM greater than 100' };
  }

  return { isAnomaly: false, severity: 'normal', reason: 'Within expected BPM range' };
}

module.exports = { detectAnomaly };
