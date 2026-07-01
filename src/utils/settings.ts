/**
 * Pure helpers and types for the user-configurable settings: the time window
 * that defines a memory "day", the hour the daily reminder is sent, and the UI
 * language. Kept free of React and native modules so they are easy to unit test;
 * the persistence and React wiring live in `hooks/use-settings`.
 */
import { SYSTEM_LANGUAGE, isSupportedLanguage } from '@/i18n';

/** Value meaning "follow the device language" — the default language setting. */
export const DEFAULT_LANGUAGE = SYSTEM_LANGUAGE;

/** Hour (local time) a memory "day" starts at when nothing is configured. */
export const DEFAULT_DAY_START_HOUR = 4;

/**
 * Hour (local time) a memory "day" ends at, on the *following* calendar day,
 * when nothing is configured. Combined with the start hour this means a day runs
 * from 4am until 4am the next morning by default, so photos taken shortly after
 * midnight still count towards the previous day.
 */
export const DEFAULT_DAY_END_HOUR = 4;

/** Hour (local time) the daily "On This Day" reminder is sent when unconfigured. */
export const DEFAULT_NOTIFICATION_HOUR = 9;

export type Settings = {
  /** Hour (0–23) the memory day starts on the selected calendar day. */
  dayStartHour: number;
  /** Hour (0–23) the memory day ends, on the following calendar day. */
  dayEndHour: number;
  /** Hour (0–23) the daily reminder notification is sent. */
  notificationHour: number;
  /**
   * UI language: either `'system'` to follow the device language, or a
   * supported language code (e.g. `'de'`). Anything unrecognised falls back to
   * `'system'`.
   */
  language: string;
};

export const DEFAULT_SETTINGS: Settings = {
  dayStartHour: DEFAULT_DAY_START_HOUR,
  dayEndHour: DEFAULT_DAY_END_HOUR,
  notificationHour: DEFAULT_NOTIFICATION_HOUR,
  language: DEFAULT_LANGUAGE,
};

/** Coerces any value to a valid language setting: `'system'` or a supported code. */
export function sanitizeLanguage(value: unknown): string {
  if (typeof value === 'string' && (value === SYSTEM_LANGUAGE || isSupportedLanguage(value))) {
    return value;
  }
  return DEFAULT_LANGUAGE;
}

/** Coerces any value to a whole hour in the 0–23 range, falling back to `fallback`. */
export function clampHour(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(23, Math.max(0, Math.floor(n)));
}

/** Merges a partial/untrusted settings object onto the defaults, clamping hours. */
export function sanitizeSettings(partial: Partial<Settings> | null | undefined): Settings {
  return {
    dayStartHour: clampHour(partial?.dayStartHour, DEFAULT_SETTINGS.dayStartHour),
    dayEndHour: clampHour(partial?.dayEndHour, DEFAULT_SETTINGS.dayEndHour),
    notificationHour: clampHour(partial?.notificationHour, DEFAULT_SETTINGS.notificationHour),
    language: sanitizeLanguage(partial?.language),
  };
}

/** Formats a 0–23 hour as a friendly 12-hour label, e.g. 0 → "12:00 AM", 16 → "4:00 PM". */
export function formatHour(hour: number): string {
  const h = clampHour(hour, 0);
  const period = h < 12 ? 'AM' : 'PM';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:00 ${period}`;
}
