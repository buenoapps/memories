/**
 * Pure helpers for the "On This Day" memories feature. Kept free of React and
 * native modules so they are easy to unit test.
 */

/** How many years back to look for memories (in addition to the current year). */
export const YEARS_BACK = 50;

/** One calendar year to look at, relative to today. */
export type MemoryYear = {
  year: number;
  /** 0 = this year, 1 = last year, … */
  yearsAgo: number;
};

/**
 * Builds the list of years to search, starting with today's year and walking
 * back `yearsBack` years.
 */
export function buildYears(now: Date, yearsBack: number = YEARS_BACK): MemoryYear[] {
  const currentYear = now.getFullYear();
  const years: MemoryYear[] = [];
  for (let yearsAgo = 0; yearsAgo <= yearsBack; yearsAgo++) {
    years.push({ year: currentYear - yearsAgo, yearsAgo });
  }
  return years;
}

/** Returns the inclusive [start, end] epoch-ms range for a single calendar day. */
export function dayRange(year: number, month: number, day: number): { start: number; end: number } {
  return {
    start: new Date(year, month, day, 0, 0, 0, 0).getTime(),
    end: new Date(year, month, day, 23, 59, 59, 999).getTime(),
  };
}

/** Human label for how long ago a year was, e.g. "Today", "1 year ago". */
export function yearsAgoLabel(yearsAgo: number): string {
  if (yearsAgo <= 0) return 'Today';
  if (yearsAgo === 1) return '1 year ago';
  return `${yearsAgo} years ago`;
}

/** Formats a count of photos with the correct pluralisation. */
export function photoCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'photo' : 'photos'}`;
}

/** Formats the day-of-year label shown in the header, e.g. "June 15". */
export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

/** Clamps a 0..1 progress value and renders it as a whole-number percentage. */
export function formatPercent(progress: number): string {
  const clamped = Math.max(0, Math.min(1, progress));
  return `${Math.round(clamped * 100)}%`;
}
