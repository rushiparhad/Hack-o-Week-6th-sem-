const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

function formatRows(metrics) {
  return metrics.map((metric) => ({
    timestamp: new Date(metric.measuredAt).toISOString(),
    bpm: metric.bpm,
    anomalyStatus: metric.isAnomaly ? 'Anomaly' : 'Normal',
    severity: metric.severity,
    note: metric.anomalyReason
  }));
}

function generateCsv(rows) {
  const parser = new Parser({
    fields: ['timestamp', 'bpm', 'anomalyStatus', 'severity', 'note']
  });

  return parser.parse(rows);
}

function generatePdf(rows, options) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc
      .fontSize(20)
      .fillColor('#0F172A')
      .text('User Data Export Report', { align: 'left' })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor('#334155')
      .text(`Generated: ${new Date().toISOString()}`)
      .text(`Date From: ${options.dateFrom || 'N/A'}`)
      .text(`Date To: ${options.dateTo || 'N/A'}`)
      .text(`Severity: ${options.severity || 'all'}`)
      .moveDown();

    doc.fontSize(11).fillColor('#0F172A').text('Metrics', { underline: true }).moveDown(0.5);

    rows.forEach((row, index) => {
      const color = row.anomalyStatus === 'Anomaly' ? '#DC2626' : '#16A34A';
      doc
        .fontSize(10)
        .fillColor('#0F172A')
        .text(`${index + 1}. ${row.timestamp} | BPM: ${row.bpm}`)
        .fillColor(color)
        .text(`Status: ${row.anomalyStatus} (${row.severity})`)
        .fillColor('#334155')
        .text(`Reason: ${row.note}`)
        .moveDown(0.5);

      if (doc.y > 740) {
        doc.addPage();
      }
    });

    doc.end();
  });
}

module.exports = {
  formatRows,
  generateCsv,
  generatePdf
};
