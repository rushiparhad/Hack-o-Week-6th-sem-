const departments = [
  {
    name: "Engineering",
    buildings: ["Innovation Block", "Lab Complex"],
  },
  {
    name: "Sciences",
    buildings: ["Bio Sciences", "Physics Tower"],
  },
  {
    name: "Administration",
    buildings: ["Admin Main", "Finance Annex"],
  },
  {
    name: "Hostels",
    buildings: ["North Hostel", "South Hostel"],
  },
];

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateSampleData(days = 180) {
  const dataset = [];
  const today = new Date();

  for (let dayOffset = days; dayOffset >= 0; dayOffset -= 1) {
    const timestamp = new Date(today);
    timestamp.setDate(today.getDate() - dayOffset);

    departments.forEach((department, depIndex) => {
      department.buildings.forEach((building, buildIndex) => {
        const seed = dayOffset * 11 + depIndex * 17 + buildIndex * 29;
        const seasonality = 1 + Math.sin((2 * Math.PI * (days - dayOffset)) / 30) * 0.08;
        const rand = seededRandom(seed);

        const energyUsage = (320 + depIndex * 80 + buildIndex * 35) * seasonality * (0.9 + rand * 0.2);
        const waterUsage = (190 + depIndex * 45 + buildIndex * 20) * seasonality * (0.88 + rand * 0.24);
        const wasteMetric = (75 + depIndex * 12 + buildIndex * 8) * (0.9 + rand * 0.22);
        const carbonSaved = (130 + depIndex * 26 + buildIndex * 14) * (0.85 + rand * 0.28);

        dataset.push({
          timestamp,
          campus: "Main Campus",
          department: department.name,
          building,
          energyUsage: Number(energyUsage.toFixed(2)),
          waterUsage: Number(waterUsage.toFixed(2)),
          wasteMetric: Number(wasteMetric.toFixed(2)),
          carbonSaved: Number(carbonSaved.toFixed(2)),
        });
      });
    });
  }

  return dataset;
}

module.exports = generateSampleData;
