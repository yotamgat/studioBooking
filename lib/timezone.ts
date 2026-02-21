// lib/timezone.ts
// Israel timezone helper

/**
 * Get current Israel UTC offset in hours (+2 winter, +3 summer DST)
 */
function getIsraelOffsetHours(): number {
  const now = new Date();
  const israelTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jerusalem',
    hour: 'numeric',
    hour12: false,
  }).format(now);
  const utcHour = now.getUTCHours();
  const israelHour = parseInt(israelTime) % 24;
  let diff = israelHour - utcHour;
  if (diff < 0) diff += 24;
  if (diff > 12) diff -= 24;
  return diff;
}

/**
 * Returns the Israel timezone offset string e.g. "+02:00" or "+03:00"
 */
function israelOffsetStr(): string {
  const offset = getIsraelOffsetHours();
  return `+0${offset}:00`;
}

/**
 * Given a date string like "2026-02-22" or ISO string,
 * returns the start of that day in Israel time as a UTC Date
 */
export function israelStartOfDay(dateStr: string): Date {
  const dateOnly = dateStr.split('T')[0];
  return new Date(`${dateOnly}T00:00:00${israelOffsetStr()}`);
}

/**
 * Given a date string, returns the end of that day in Israel time as UTC Date
 */
export function israelEndOfDay(dateStr: string): Date {
  const dateOnly = dateStr.split('T')[0];
  return new Date(`${dateOnly}T23:59:59${israelOffsetStr()}`);
}

/**
 * Convert "HH:mm" time string + date string to UTC Date using Israel timezone
 */
export function israelTimeToUTC(dateStr: string, timeStr: string): Date {
  const dateOnly = dateStr.split('T')[0];
  return new Date(`${dateOnly}T${timeStr}:00${israelOffsetStr()}`);
}