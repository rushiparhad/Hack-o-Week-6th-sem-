export const users = {
  u1: { id: 'u1', name: 'Ava Admin', role: 'admin' },
  u2: { id: 'u2', name: 'Sam Security', role: 'security_analyst' },
  u3: { id: 'u3', name: 'Dee Developer', role: 'engineer' },
  u4: { id: 'u4', name: 'Ria ReadOnly', role: 'viewer' }
};

export const encryptedDataAuditLogs = [
  {
    id: 'log-1001',
    timestamp: '2026-04-02T08:15:00.000Z',
    actorId: 'u2',
    actorRole: 'security_analyst',
    action: 'decrypt_read',
    resource: 'customer_profiles.enc',
    keyId: 'kms-key-prod-07',
    result: 'success',
    ipAddress: '10.11.1.22',
    reason: 'Fraud investigation case #F-401'
  },
  {
    id: 'log-1002',
    timestamp: '2026-04-02T08:23:00.000Z',
    actorId: 'u3',
    actorRole: 'engineer',
    action: 'decrypt_read',
    resource: 'salary_records.enc',
    keyId: 'kms-key-fin-01',
    result: 'denied',
    ipAddress: '10.11.3.41',
    reason: 'Role not permitted for this dataset'
  },
  {
    id: 'log-1003',
    timestamp: '2026-04-02T09:10:00.000Z',
    actorId: 'u1',
    actorRole: 'admin',
    action: 'decrypt_export',
    resource: 'backup_bundle_2026_03.enc',
    keyId: 'kms-key-backup-03',
    result: 'success',
    ipAddress: '10.11.0.5',
    reason: 'Approved disaster recovery drill'
  },
  {
    id: 'log-1004',
    timestamp: '2026-04-02T09:50:00.000Z',
    actorId: 'u4',
    actorRole: 'viewer',
    action: 'decrypt_read',
    resource: 'incident_notes.enc',
    keyId: 'kms-key-sec-04',
    result: 'denied',
    ipAddress: '10.11.8.12',
    reason: 'Viewer role cannot decrypt secured records'
  }
];

export const anomalyReports = [
  {
    id: 'an-501',
    detectedAt: '2026-04-02T09:11:30.000Z',
    severity: 'high',
    category: 'access_frequency_spike',
    summary: 'Decrypt operations exceeded baseline by 320% in 15 minutes.',
    affectedResource: 'customer_profiles.enc',
    status: 'open'
  },
  {
    id: 'an-502',
    detectedAt: '2026-04-02T09:22:10.000Z',
    severity: 'medium',
    category: 'geo_ip_deviation',
    summary: 'Access request originated from atypical IP block for actor profile.',
    affectedResource: 'salary_records.enc',
    status: 'investigating'
  },
  {
    id: 'an-503',
    detectedAt: '2026-04-02T09:56:42.000Z',
    severity: 'critical',
    category: 'denied_attempt_burst',
    summary: '12 denied decrypt attempts against incident notes in 6 minutes.',
    affectedResource: 'incident_notes.enc',
    status: 'open'
  }
];
