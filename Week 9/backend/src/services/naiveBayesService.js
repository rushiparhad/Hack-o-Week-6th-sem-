const EPSILON = 1e-6;

const gaussianPdf = (x, mean, variance) => {
  const adjustedVar = Math.max(variance, EPSILON);
  const coeff = 1 / Math.sqrt(2 * Math.PI * adjustedVar);
  const exponent = -((x - mean) ** 2) / (2 * adjustedVar);
  return coeff * Math.exp(exponent);
};

const quantile = (values, q) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.floor((sorted.length - 1) * q);
  return sorted[index];
};

const labelByThreshold = (value, lowThreshold, highThreshold) => {
  if (value <= lowThreshold) return "low";
  if (value <= highThreshold) return "medium";
  return "high";
};

const splitData = (records, ratio = 0.8) => {
  const splitIndex = Math.max(1, Math.floor(records.length * ratio));
  return {
    train: records.slice(0, splitIndex),
    test: records.slice(splitIndex),
  };
};

const trainGaussianNB = (records, lowThreshold, highThreshold) => {
  const grouped = {
    low: [],
    medium: [],
    high: [],
  };

  records.forEach((item) => {
    const label = labelByThreshold(item.loadCount, lowThreshold, highThreshold);
    grouped[label].push(item);
  });

  const total = records.length || 1;

  return Object.entries(grouped).reduce((acc, [label, items]) => {
    const prior = items.length / total;

    const meanLoad = items.reduce((sum, x) => sum + x.loadCount, 0) / (items.length || 1);
    const meanHour = items.reduce((sum, x) => sum + x.hourOfDay, 0) / (items.length || 1);

    const varLoad = items.reduce((sum, x) => sum + (x.loadCount - meanLoad) ** 2, 0) / (items.length || 1);
    const varHour = items.reduce((sum, x) => sum + (x.hourOfDay - meanHour) ** 2, 0) / (items.length || 1);

    acc[label] = {
      prior: Math.max(prior, EPSILON),
      stats: {
        loadCount: { mean: meanLoad, variance: varLoad },
        hourOfDay: { mean: meanHour, variance: varHour },
      },
    };

    return acc;
  }, {});
};

const predictOne = (model, item) => {
  const scores = Object.entries(model).map(([label, params]) => {
    const loadProb = gaussianPdf(item.loadCount, params.stats.loadCount.mean, params.stats.loadCount.variance);
    const hourProb = gaussianPdf(item.hourOfDay, params.stats.hourOfDay.mean, params.stats.hourOfDay.variance);
    const score = Math.log(params.prior) + Math.log(Math.max(loadProb, EPSILON)) + Math.log(Math.max(hourProb, EPSILON));

    return { label, score };
  });

  scores.sort((a, b) => b.score - a.score);

  const maxScore = scores[0]?.score || 0;
  const expScores = scores.map((s) => ({ label: s.label, value: Math.exp(s.score - maxScore) }));
  const denom = expScores.reduce((sum, x) => sum + x.value, 0) || 1;

  const probabilities = expScores.reduce((acc, entry) => {
    acc[entry.label] = Number((entry.value / denom).toFixed(4));
    return acc;
  }, {});

  return {
    predictedLabel: scores[0]?.label || "low",
    probabilities,
  };
};

const categorizeUsage = (records) => {
  if (!records.length) {
    return {
      records: [],
      distribution: { low: 0, medium: 0, high: 0 },
      thresholds: { lowThreshold: 0, highThreshold: 0 },
      accuracy: 0,
    };
  }

  const loadValues = records.map((r) => r.loadCount);
  const lowThreshold = quantile(loadValues, 0.33);
  const highThreshold = quantile(loadValues, 0.66);

  const prepared = records.map((r) => ({
    ...r,
    trueLabel: labelByThreshold(r.loadCount, lowThreshold, highThreshold),
  }));

  const { train, test } = splitData(prepared);
  const model = trainGaussianNB(train, lowThreshold, highThreshold);

  const classified = prepared.map((item) => {
    const predicted = predictOne(model, item);
    return {
      ...item,
      category: predicted.predictedLabel,
      probabilities: predicted.probabilities,
    };
  });

  const evaluatedSet = test.length ? test : train;
  const correct = evaluatedSet.reduce((sum, item) => {
    const predicted = predictOne(model, item).predictedLabel;
    return sum + Number(predicted === item.trueLabel);
  }, 0);

  const accuracy = Number(((correct / (evaluatedSet.length || 1)) * 100).toFixed(2));

  const distribution = classified.reduce(
    (acc, item) => {
      acc[item.category] += 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0 }
  );

  return {
    records: classified,
    distribution,
    thresholds: { lowThreshold, highThreshold },
    accuracy,
  };
};

module.exports = {
  categorizeUsage,
};
