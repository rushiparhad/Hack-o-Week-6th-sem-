function linearRegressionForecast(values, horizon = 7) {
  if (!values.length) return [];

  const n = values.length;
  const xs = Array.from({ length: n }, (_, index) => index + 1);
  const sumX = xs.reduce((acc, value) => acc + value, 0);
  const sumY = values.reduce((acc, value) => acc + value, 0);
  const sumXY = xs.reduce((acc, value, index) => acc + value * values[index], 0);
  const sumXX = xs.reduce((acc, value) => acc + value * value, 0);

  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return Array.from({ length: horizon }, (_, index) => {
    const x = n + index + 1;
    return Math.max(0, intercept + slope * x);
  });
}

function movingAverage(values, windowSize = 5) {
  if (!values.length) return [];
  return values.map((_, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const chunk = values.slice(start, index + 1);
    return chunk.reduce((acc, value) => acc + value, 0) / chunk.length;
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

function blendForecast(regressionForecast, smoothedForecast) {
  return regressionForecast.map((value, index) => {
    const smoothValue = smoothedForecast[index] ?? value;
    return 0.6 * value + 0.4 * smoothValue;
  });
}

module.exports = {
  linearRegressionForecast,
  movingAverage,
  exponentialSmoothing,
  blendForecast,
};