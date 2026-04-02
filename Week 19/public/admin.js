const params = new URLSearchParams(window.location.search);
const userId = params.get('userId') || '';

const statusEl = document.getElementById('status');
const sessionPill = document.getElementById('sessionPill');
const auditLogBody = document.getElementById('auditLogBody');
const anomalyCards = document.getElementById('anomalyCards');

function showStatus(type, message) {
  statusEl.className = `status ${type}`;
  statusEl.textContent = message;
}

function formatTime(value) {
  return new Date(value).toLocaleString();
}

function buildHeaders() {
  return {
    'x-user-id': userId
  };
}

async function loadSession() {
  const res = await fetch('/api/me', { headers: buildHeaders() });
  if (!res.ok) {
    throw new Error('Unable to authenticate. Please choose a valid user profile.');
  }

  return res.json();
}

async function loadAuditLogs() {
  const res = await fetch('/api/admin/audit-logs', { headers: buildHeaders() });
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('Access denied: only admin users can view encrypted-access audit logs.');
    }
    throw new Error('Unable to load encrypted-access audit logs.');
  }

  return res.json();
}

async function loadAnomalies() {
  const res = await fetch('/api/admin/anomaly-reports', { headers: buildHeaders() });
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('Access denied: only admin users can view anomaly reports.');
    }
    throw new Error('Unable to load anomaly reports.');
  }

  return res.json();
}

function renderAuditLogs(records) {
  auditLogBody.innerHTML = '';

  for (const log of records) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatTime(log.timestamp)}</td>
      <td>${log.actorId}</td>
      <td><span class="tag">${log.actorRole}</span></td>
      <td>${log.action}</td>
      <td>${log.resource}</td>
      <td><span class="tag ${log.result === 'denied' ? 'denied' : 'success'}">${log.result}</span></td>
      <td>${log.ipAddress}</td>
      <td>${log.reason}</td>
    `;
    auditLogBody.appendChild(row);
  }
}

function renderAnomalies(records) {
  anomalyCards.innerHTML = '';

  for (const report of records) {
    const article = document.createElement('article');
    article.className = `anomaly-card severity-${report.severity}`;
    article.innerHTML = `
      <h3>${report.category}</h3>
      <p>${report.summary}</p>
      <p><strong>Resource:</strong> ${report.affectedResource}</p>
      <p><strong>Detected:</strong> ${formatTime(report.detectedAt)}</p>
      <p><strong>Status:</strong> ${report.status}</p>
      <p><strong>Severity:</strong> ${report.severity}</p>
    `;
    anomalyCards.appendChild(article);
  }
}

async function init() {
  if (!userId) {
    showStatus('error', 'Missing userId. Return to the home screen and pick a profile.');
    sessionPill.textContent = 'No Session';
    return;
  }

  try {
    const me = await loadSession();
    sessionPill.textContent = `${me.name} (${me.role})`;

    const [audit, anomalies] = await Promise.all([loadAuditLogs(), loadAnomalies()]);
    renderAuditLogs(audit.records);
    renderAnomalies(anomalies.records);
    showStatus('ok', `Loaded ${audit.count} audit events and ${anomalies.count} anomaly reports.`);
  } catch (error) {
    showStatus('error', error.message);
    auditLogBody.innerHTML = '';
    anomalyCards.innerHTML = '';
  }
}

init();
