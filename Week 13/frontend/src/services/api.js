import { decryptData } from './decrypt';

// When using Vite's proxy, keep API_BASE empty so requests go to /api/...
// Set VITE_API_BASE=http://localhost:5000 only if you disable the proxy
const envApiBase = (import.meta.env.VITE_API_BASE ?? '').trim().replace(/\/+$/, '');
const isLocalDevHost =
  typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_BASE = envApiBase || (isLocalDevHost ? 'http://localhost:5000' : '');

function getCandidateUrls() {
  const candidates = [];

  if (API_BASE) {
    candidates.push(`${API_BASE}/api/activity`);
  }

  // Prefer proxy path first when no explicit API base is configured.
  if (!envApiBase) {
    candidates.push('/api/activity');
  }

  if (isLocalDevHost) {
    candidates.push('http://localhost:5000/api/activity');
    candidates.push('http://localhost:5001/api/activity');
  }

  return [...new Set(candidates)];
}

/**
 * Fetches encrypted activity data from the backend and returns the decrypted array.
 * @returns {Promise<Array>}
 */
export async function fetchActivity() {
  const candidates = getCandidateUrls();
  let lastError = null;

  for (const url of candidates) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        lastError = new Error(`API error ${response.status}: ${response.statusText}`);
        continue;
      }

      const encrypted = await response.json();
      return decryptData(encrypted);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Failed to fetch activity data');
}
