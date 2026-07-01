/**
 * Pure helpers for scheduling the "you have memories today" morning
 * notifications. The native scheduling lives in `use-notifications`; the date
 * maths lives here so it can be unit tested without the notifications module.
 */
import { plural, translate } from '@/i18n';

/** Hour of the day (local time) the morning reminder fires at. */
export const MORNING_HOUR = 9;

/** How many days ahead we look for upcoming memories. */
export const LOOKAHEAD_DAYS = 30;

/** Returns a new date set to the morning reminder time on the same calendar day. */
export function morningOf(date: Date, hour: number = MORNING_HOUR): Date {
  const morning = new Date(date);
  morning.setHours(hour, 0, 0, 0);
  return morning;
}

/**
 * Builds the list of upcoming calendar days to check for memories, each pinned
 * to the morning reminder time. Days whose reminder time has already passed are
 * skipped so we never schedule a notification in the past.
 */
export function buildLookaheadDays(
  now: Date,
  days: number = LOOKAHEAD_DAYS,
  hour: number = MORNING_HOUR,
): Date[] {
  const result: Date[] = [];
  for (let offset = 0; offset < days; offset++) {
    const day = new Date(now);
    day.setDate(now.getDate() + offset);
    const morning = morningOf(day, hour);
    if (morning.getTime() > now.getTime()) {
      result.push(morning);
    }
  }
  return result;
}

/** Builds the notification copy shown for a day with `count` memories. */
export function notificationBody(count: number): string {
  return translate(plural('notification.body', count), { count });
}

/** The notification title, translated into the active locale. */
export function notificationTitle(): string {
  return translate('notification.title');
}
