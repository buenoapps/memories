/**
 * Pure helpers for the "On This Day" memories feature. Kept free of React and
 * native modules so they are easy to unit test. User-facing labels are
 * translated against the active locale via `translate`; date labels use the
 * active locale's month/weekday names.
 */
import { getActiveLocale, plural, translate } from '@/i18n';

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

/**
 * Builds the search list narrowed to a single year, keeping `yearsAgo` relative
 * to the anchor date. Used by the per-year detail page.
 */
export function buildSingleYear(anchor: Date, year: number): MemoryYear[] {
  return [{ year, yearsAgo: anchor.getFullYear() - year }];
}

/**
 * Returns the inclusive [start, end] epoch-ms range for a memory "day".
 *
 * A day starts at `startHour` on the given calendar day and runs until
 * `endHour` on the *following* day, so photos taken shortly after midnight can
 * still be grouped with the previous day. With the default hours (0 → 0) this
 * collapses to a single calendar day: 00:00:00.000 to 23:59:59.999.
 */
export function dayRange(
  year: number,
  month: number,
  day: number,
  startHour: number = 0,
  endHour: number = 0,
): { start: number; end: number } {
  return {
    start: new Date(year, month, day, startHour, 0, 0, 0).getTime(),
    // The window is exclusive of the exact end hour so it never overlaps the
    // following day's window; subtract a millisecond to keep `lte` inclusive.
    end: new Date(year, month, day + 1, endHour, 0, 0, 0).getTime() - 1,
  };
}

/** Human label for how long ago a year was, e.g. "Today", "1 year ago". */
export function yearsAgoLabel(yearsAgo: number): string {
  if (yearsAgo <= 0) return translate('memory.today');
  if (yearsAgo === 1) return translate('memory.yearAgoOne');
  return translate('memory.yearsAgoOther', { count: yearsAgo });
}

/** Formats a count of photos with the correct pluralisation. */
export function photoCountLabel(count: number): string {
  return translate(plural('memory.photo', count), { count });
}

/** Formats the day-of-year label shown in the header, e.g. "June 15". */
export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(getActiveLocale(), { month: 'long', day: 'numeric' });
}

/** True when two dates fall on the same calendar month and day (year ignored). */
export function isSameMonthDay(a: Date, b: Date): boolean {
  return a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * A short label for the day a memory set is showing, used in headers and
 * buttons. Returns "Today" when the date is today's month/day.
 */
export function formatRelativeDayLabel(date: Date, now: Date = new Date()): string {
  return isSameMonthDay(date, now) ? translate('memory.today') : formatDayLabel(date);
}

/** Clamps a 0..1 progress value and renders it as a whole-number percentage. */
export function formatPercent(progress: number): string {
  const clamped = Math.max(0, Math.min(1, progress));
  return `${Math.round(clamped * 100)}%`;
}
