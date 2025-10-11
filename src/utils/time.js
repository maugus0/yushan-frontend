// Format timestamps like "5 minutes ago" without external deps.
export function formatCommentTime(input) {
  const ts = new Date(input).getTime();
  if (!Number.isFinite(ts)) return '';
  const diff = ts - Date.now(); // negative for past
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const SEC = 1000;
  const MIN = 60 * SEC;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;

  const abs = Math.abs(diff);
  if (abs >= YEAR) return rtf.format(Math.round(diff / YEAR), 'year');
  if (abs >= MONTH) return rtf.format(Math.round(diff / MONTH), 'month');
  if (abs >= DAY) return rtf.format(Math.round(diff / DAY), 'day');
  if (abs >= HOUR) return rtf.format(Math.round(diff / HOUR), 'hour');
  if (abs >= MIN) return rtf.format(Math.round(diff / MIN), 'minute');
  return rtf.format(Math.round(diff / SEC), 'second');
}
