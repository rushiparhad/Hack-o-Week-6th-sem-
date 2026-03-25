require("dotenv").config({ path: `${__dirname}/../.env` });

const connectDB = require("../src/config/db");
const LaundryLog = require("../src/models/LaundryLog");

const blocks = ["A", "B", "C", "D", "E"];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seasonalLoad = (hour, dayOfWeek) => {
  const morningPeak = hour >= 7 && hour <= 10 ? 15 : 0;
  const eveningPeak = hour >= 18 && hour <= 22 ? 18 : 0;
  const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 8 : 0;
  const nightDip = hour <= 5 ? -6 : 0;
  return morningPeak + eveningPeak + weekendBoost + nightDip;
};

const generateRecords = () => {
  const records = [];
  const start = new Date();
  start.setDate(start.getDate() - 60);
  start.setMinutes(0, 0, 0);

  for (let day = 0; day <= 60; day += 1) {
    for (let hour = 0; hour < 24; hour += 1) {
      const timestamp = new Date(start);
      timestamp.setDate(start.getDate() + day);
      timestamp.setHours(hour);

      const dayOfWeek = timestamp.getDay();

      blocks.forEach((block) => {
        const blockFactor = block.charCodeAt(0) % 5;
        const base = 10 + blockFactor * 2;
        const seasonal = seasonalLoad(hour, dayOfWeek);
        const noise = randomInt(-3, 6);
        const loadCount = Math.max(0, base + seasonal + noise);

        records.push({
          timestamp,
          loadCount,
          hostelBlock: block,
          machineType: Math.random() > 0.35 ? "washer" : "dryer",
          dayOfWeek,
          hourOfDay: hour,
        });
      });
    }
  }

  return records;
};

const seed = async () => {
  try {
    await connectDB();
    await LaundryLog.deleteMany({});
    const records = generateRecords();
    await LaundryLog.insertMany(records);
    console.log(`Seeded ${records.length} laundry records.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seed();
