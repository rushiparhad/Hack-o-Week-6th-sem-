require("dotenv").config({ path: `${__dirname}/../.env` });

const connectDB = require("../src/config/db");
const SustainabilityRecord = require("../src/models/SustainabilityRecord");
const generateSampleData = require("../data/sampleData");

async function seed() {
  try {
    await connectDB();
    await SustainabilityRecord.deleteMany({});
    const records = generateSampleData(365);
    await SustainabilityRecord.insertMany(records);
    console.log(`Seeded ${records.length} sustainability records.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
}

seed();
