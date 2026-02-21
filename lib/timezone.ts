// lib/timezone.ts
// Israel timezone helper - use this everywhere instead of startOfDay/endOfDay

const ISRAEL_TZ = 'Asia/Jerusalem';

/**
 * Given a date string like "2026-02-22" or ISO string,
 * returns the start of that day in Israel time as a UTC Date
 */
export function israelStartOfDay(dateStr: string): Date {
  // Extract just the date part
  const dateOnly = dateStr.split('T')[0]; // "2026-02-22"
  // Midnight Israel time = stored as UTC-2 or UTC-3 depending on DST
  // We use the Intl API to get the correct offset
  const midnight = new Date(`${dateOnly}T00:00:00`);
  const offset = getIsraelOffset(midnight);
  return new Date(midnight.getTime() - offset * 60 * 1000);
}

/**
 * Given a date string, returns the end of that day in Israel time as UTC Date
 */
export function israelEndOfDay(dateStr: string): Date {
  const dateOnly = dateStr.split('T')[0];
  const endOfDay = new Date(`${dateOnly}T23:59:59`);
  const offset = getIsraelOffset(endOfDay);
  return new Date(endOfDay.getTime() - offset * 60 * 1000);
}

/**
 * Convert "HH:mm" time string + date string to UTC Date
 */
export function israelTimeToUTC(dateStr: string, timeStr: string): Date {
  const dateOnly = dateStr.split('T')[0];
  const local = new Date(`${dateOnly}T${timeStr}:00`);
  const offset = getIsraelOffset(local);
  return new Date(local.getTime() - offset * 60 * 1000);
}

/**
 * Get Israel UTC offset in minutes for a given date (handles DST)
 */
function getIsraelOffset(date: Date): number {
  // Use Intl to get Israel time parts
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: ISRAEL_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(date);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0');
  
  const israelDate = new Date(Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second')));
  return (israelDate.getTime() - date.getTime()) / 60000;
}