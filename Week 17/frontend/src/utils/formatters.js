import { format } from 'date-fns';

export function formatTimestamp(value) {
  if (!value) return 'N/A';
  return format(new Date(value), 'MMM dd, yyyy HH:mm');
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
