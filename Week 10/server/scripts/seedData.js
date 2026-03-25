require("dotenv").config();
const { connectDB } = require("../src/config/db");
const SustainabilityRecord = require("../src/models/SustainabilityRecord");
const generateSampleData = require("../data/sampleData");

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is missing. Add it to your .env file before seeding.");
  }

  await connectDB(uri);
  await SustainabilityRecord.deleteMany({});

  const docs = generateSampleData(210);
  await SustainabilityRecord.insertMany(docs);

  console.log(`Seeded ${docs.length} sustainability records.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
