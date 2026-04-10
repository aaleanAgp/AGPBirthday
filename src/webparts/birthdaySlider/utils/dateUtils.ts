/**
 * Formats a birthday for display as "15 de Marzo".
 */
export function formatBirthdayDate(day: number, month: number): string {
  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  return `${monthNames[month - 1].toUpperCase()}., ${day}`;
}

/**
 * Parses a SharePoint ISO date string into day/month/year components.
 * SharePoint returns dates as "YYYY-MM-DDTHH:mm:ssZ".
 * Returns null if the string is invalid or empty.
 */
export function parseSPDate(dateStr: string): { day: number; month: number; year: number } | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return {
      day: date.getUTCDate(),
      month: date.getUTCMonth() + 1,
      year: date.getUTCFullYear()
    };
  } catch {
    return null;
  }
}

/**
 * Returns true if today (local time) matches the given day and month.
 */
export function isTodayBirthday(day: number, month: number): boolean {
  const today = new Date();
  return today.getDate() === day && today.getMonth() + 1 === month;
}

/**
 * Returns the number of calendar days from today until the next
 * occurrence of the given birthday (day + month). Returns 0 if today.
 */
export function daysUntilBirthday(day: number, month: number): number {
  const today = new Date();
  const year = today.getFullYear();
  let target = new Date(year, month - 1, day);
  const todayNormalized = new Date(year, today.getMonth(), today.getDate());

  if (target < todayNormalized) {
    target = new Date(year + 1, month - 1, day);
  }

  return Math.round((target.getTime() - todayNormalized.getTime()) / (1000 * 60 * 60 * 24));
}
