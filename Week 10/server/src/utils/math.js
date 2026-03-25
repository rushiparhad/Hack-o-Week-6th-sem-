function linearRegressionForecast(values, horizon = 7) {
  if (!values.length) return [];
  const n = values.length;
  const xs = Array.from({ length: n }, (_, i) => i + 1);

  const sumX = xs.reduce((acc, v) => acc + v, 0);
  const sumY = values.reduce((acc, v) => acc + v, 0);
  const sumXY = xs.reduce((acc, v, i) => acc + v * values[i], 0);
  const sumXX = xs.reduce((acc, v) => acc + v * v, 0);

  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = n === 0 ? 0 : (sumY - slope * sumX) / n;

  return Array.from({ length: horizon }, (_, i) => {
    const x = n + i + 1;
    return Math.max(0, intercept + slope * x);
  });
}

function movingAverage(values, windowSize = 3) {
  if (!values.length) return [];
  return values.map((_, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const chunk = values.slice(start, index + 1);
    const avg = chunk.reduce((acc, item) => acc + item, 0) / chunk.length;
    return avg;
  });
}

function exponentialSmoothing(values, alpha = 0.35) {
  if (!values.length) return [];
  const smoothed = [values[0]];
  for (let i = 1; i < values.length; i += 1) {
    smoothed[i] = alpha * values[i] + (1 - alpha) * smoothed[i - 1];
  }
  return smoothed;
}

function ensembleForecast(baseForecast, trailingSmoothed) {
  return baseForecast.map((value, index) => {
    const smoothAnchor = trailingSmoothed[index % trailingSmoothed.length] ?? value;
    return (value + smoothAnchor) / 2;
  });
}

module.exports = {
  linearRegressionForecast,
  movingAverage,
  exponentialSmoothing,
  ensembleForecast,
};
