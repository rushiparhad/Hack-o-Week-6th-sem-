import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportDashboardPdf(kpis, trends, filters) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Campus-Wide Sustainability Tracker", 14, 18);
  doc.setFontSize(11);
  doc.text(`From: ${filters.from || "Default"}  To: ${filters.to || "Today"}`, 14, 26);

  autoTable(doc, {
    startY: 32,
    head: [["Metric", "Value"]],
    body: [
      ["Total Energy Consumption", String(kpis.totalEnergyConsumption || 0)],
      ["Water Usage", String(kpis.waterUsage || 0)],
      ["Carbon Emissions Saved", String(kpis.carbonEmissionsSaved || 0)],
      ["Sustainability Score", String(kpis.sustainabilityScore || 0)],
    ],
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [["Date", "Energy", "Water", "Waste", "Carbon Saved"]],
    body: trends.slice(-12).map((row) => [row.date, row.energyUsage, row.waterUsage, row.wasteMetric, row.carbonSaved]),
  });

  doc.save("sustainability-report.pdf");
}
