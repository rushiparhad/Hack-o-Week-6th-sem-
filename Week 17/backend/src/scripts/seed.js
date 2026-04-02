const mongoose = require('mongoose');
const env = require('../config/env');
const { connectDb } = require('../config/db');
const User = require('../models/User');
const HealthMetric = require('../models/HealthMetric');
const { encryptValue } = require('../services/cryptoService');
const { detectAnomaly } = require('../services/anomalyService');

async function runSeed() {
  await connectDb();

  let admin = await User.findOne({ email: env.seedAdminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'System Admin',
      email: env.seedAdminEmail,
      password: env.seedAdminPassword,
      role: 'admin'
    });
  }

  let user = await User.findOne({ email: 'demo.user@example.com' });
  if (!user) {
    user = await User.create({
      name: 'Demo User',
      email: 'demo.user@example.com',
      password: 'User@12345',
      role: 'user'
    });
  }

  const existingCount = await HealthMetric.countDocuments({ userId: user._id });
  if (existingCount < 60) {
    const now = Date.now();
    const docs = Array.from({ length: 90 }).map((_, index) => {
      const bpm = Math.floor(Math.random() * (136 - 60 + 1)) + 60;
      const anomaly = detectAnomaly(bpm);

      return {
        userId: user._id,
        bpmEncrypted: encryptValue(String(bpm)),
        isAnomaly: anomaly.isAnomaly,
        severity: anomaly.severity,
        anomalyReason: anomaly.reason,
        measuredAt: new Date(now - (90 - index) * 60 * 1000)
      };
    });

    await HealthMetric.insertMany(docs);
  }

  console.log('Seed complete');
  await mongoose.connection.close();
}

runSeed().catch(async (error) => {
  console.error('Seed failed', error);
  await mongoose.connection.close();
  process.exit(1);
});
