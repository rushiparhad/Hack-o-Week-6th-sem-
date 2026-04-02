const campusShape = [
  { department: "Engineering", buildings: ["Innovation Block", "Robotics Center"] },
  { department: "Sciences", buildings: ["Bio Sciences", "Physics Tower"] },
  { department: "Administration", buildings: ["Admin Hub", "Finance Annex"] },
  { department: "Hostels", buildings: ["North Hostel", "South Hostel"] },
  { department: "Sports", buildings: ["Sports Complex", "Aquatic Center"] },
];

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateSampleData(days = 365) {
  const output = [];
  const today = new Date();

  for (let dayOffset = days; dayOffset >= 0; dayOffset -= 1) {
    const timestamp = new Date(today);
    timestamp.setDate(today.getDate() - dayOffset);

    campusShape.forEach((entry, departmentIndex) => {
      entry.buildings.forEach((building, buildingIndex) => {
        const seed = dayOffset * 19 + departmentIndex * 23 + buildingIndex * 31;
        const rand = seededRandom(seed);

        const seasonal = 1 + Math.sin(((days - dayOffset) * 2 * Math.PI) / 30) * 0.11;
        const weekly = timestamp.getDay() === 0 || timestamp.getDay() === 6 ? 0.88 : 1.08;

        const energyConsumption =
          (450 + departmentIndex * 70 + buildingIndex * 35) * seasonal * weekly * (0.88 + rand * 0.26);
        const waterUsage = (280 + departmentIndex * 55 + buildingIndex * 16) * seasonal * (0.9 + rand * 0.24);
        const carbonEmissions = energyConsumption * (0.41 + rand * 0.04);
        const wasteGenerated = (98 + departmentIndex * 18 + buildingIndex * 11) * (0.85 + rand * 0.32);

        output.push({
          timestamp,
          campus: "Main Campus",
          department: entry.department,
          building,
          energyConsumption: Number(energyConsumption.toFixed(2)),
          waterUsage: Number(waterUsage.toFixed(2)),
          carbonEmissions: Number(carbonEmissions.toFixed(2)),
          wasteGenerated: Number(wasteGenerated.toFixed(2)),
        });
      });
    });
  }

  return output;
}

module.exports = generateSampleData;