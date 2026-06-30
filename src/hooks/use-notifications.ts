import { AssetField, MediaType, Query } from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { loadSettings } from '@/hooks/use-settings';
import { dayRange } from '@/utils/memories';
import { buildLookaheadDays, LOOKAHEAD_DAYS, notificationBody } from '@/utils/notifications-schedule';
import { type Settings } from '@/utils/settings';

/** How many years back the morning scan looks when counting a day's memories. */
const NOTIF_YEARS_BACK = 10;

/** Caps per-year counting so a huge day doesn't run an unbounded query. */
const COUNT_LIMIT = 50;

/**
 * Ensures the app has permission to post notifications, asking once if allowed.
 * Returns whether notifications can be shown.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  if (!settings.canAskAgain) return false;
  const request = await Notifications.requestPermissionsAsync();
  return request.granted;
}

/** Counts how many memories exist for a given month/day across recent years. */
async function countMemoriesForDay(
  month: number,
  day: number,
  fromYear: number,
  startHour: number,
  endHour: number,
): Promise<number> {
  let total = 0;
  for (let year = fromYear - 1; year >= fromYear - NOTIF_YEARS_BACK; year--) {
    const { start, end } = dayRange(year, month, day, startHour, endHour);
    const assets = await new Query()
      .within(AssetField.MEDIA_TYPE, [MediaType.IMAGE, MediaType.VIDEO])
      .gte(AssetField.CREATION_TIME, start)
      .lte(AssetField.CREATION_TIME, end)
      .limit(COUNT_LIMIT)
      .exe();
    total += assets.length;
  }
  return total;
}

/**
 * Re-builds the schedule of morning "you have memories today" notifications for
 * the next ~30 days, scanning the library for each upcoming day and only
 * scheduling days that actually have memories. Returns how many were scheduled.
 */
export async function refreshMemoryNotifications(
  now: Date = new Date(),
  settings?: Settings,
): Promise<number> {
  // The scheduler runs outside React (at startup and from the settings screen),
  // so it reads the persisted settings directly unless they are passed in.
  const { dayStartHour, dayEndHour, notificationHour } = settings ?? (await loadSettings());

  await Notifications.cancelAllScheduledNotificationsAsync();

  const mornings = buildLookaheadDays(now, LOOKAHEAD_DAYS, notificationHour);
  let scheduled = 0;

  for (const morning of mornings) {
    const count = await countMemoriesForDay(
      morning.getMonth(),
      morning.getDate(),
      morning.getFullYear(),
      dayStartHour,
      dayEndHour,
    );
    if (count > 0) {
      await Notifications.scheduleNotificationAsync({
        content: { title: 'On This Day 📸', body: notificationBody(count) },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: morning },
      });
      scheduled += 1;
    }
  }

  return scheduled;
}

/**
 * Runs the notification scan once at startup (native only). Failures are
 * swallowed: without photo or notification permission there is simply nothing
 * to schedule, and the next launch can try again.
 */
export function useMemoryNotifications() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let cancelled = false;

    (async () => {
      try {
        const allowed = await ensureNotificationPermission();
        if (!allowed || cancelled) return;
        await refreshMemoryNotifications();
      } catch {
        // No permission yet or library unavailable; try again next launch.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}
