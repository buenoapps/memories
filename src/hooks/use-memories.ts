import {
  AssetField,
  getPermissionsAsync,
  MediaType,
  Query,
  requestPermissionsAsync,
} from 'expo-media-library';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { buildYears, dayRange, YEARS_BACK } from '@/utils/memories';

/** A photo resolved to the fields the UI needs to render it. */
export type MemoryPhoto = {
  id: string;
  uri: string;
};

/** A single year's worth of photos taken on the current calendar day. */
export type MemoryGroup = {
  /** Calendar year the photos were taken, e.g. 2021. */
  year: number;
  /** How many years ago that was relative to today (0 = this year). */
  yearsAgo: number;
  photos: MemoryPhoto[];
};

export type MemoriesState =
  | { status: 'loading'; progress: number }
  | { status: 'unsupported' }
  | { status: 'denied'; canAskAgain: boolean; requestPermission: () => Promise<void> }
  | { status: 'error'; message: string; retry: () => Promise<void> }
  | { status: 'ready'; groups: MemoryGroup[]; refresh: () => Promise<void> };

/**
 * Returns photos from the user's library that were taken on today's
 * month/day in the current and previous years – the classic "On This Day"
 * memory.
 *
 * Rather than scanning the whole library, we run one narrow query per
 * year bounded to that single calendar day, reporting progress as we go.
 */
export function useMemories(): MemoriesState {
  const [state, setState] = useState<MemoriesState>({ status: 'loading', progress: 0 });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setSafe = useCallback((next: MemoriesState) => {
    if (mountedRef.current) setState(next);
  }, []);

  const loadGroups = useCallback(async () => {
    setSafe({ status: 'loading', progress: 0 });
    try {
      const now = new Date();
      const month = now.getMonth();
      const day = now.getDate();
      const years = buildYears(now, YEARS_BACK);
      const groups: MemoryGroup[] = [];

      for (let i = 0; i < years.length; i++) {
        const { year, yearsAgo } = years[i];
        const { start, end } = dayRange(year, month, day);

        const assets = await new Query()
          .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
          .gte(AssetField.CREATION_TIME, start)
          .lte(AssetField.CREATION_TIME, end)
          .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
          .exe();

        if (assets.length > 0) {
          const photos = await Promise.all(
            assets.map(async (asset) => ({ id: asset.id, uri: await asset.getUri() })),
          );
          groups.push({ year, yearsAgo, photos });
        }

        setSafe({ status: 'loading', progress: (i + 1) / years.length });
      }

      setSafe({ status: 'ready', groups, refresh: loadGroups });
    } catch (error) {
      setSafe({
        status: 'error',
        message: error instanceof Error ? error.message : 'Could not load your photos.',
        retry: loadGroups,
      });
    }
  }, [setSafe]);

  const requestPermission = useCallback(async () => {
    try {
      const { granted, canAskAgain } = await requestPermissionsAsync();
      if (granted) {
        await loadGroups();
      } else {
        setSafe({ status: 'denied', canAskAgain, requestPermission });
      }
    } catch (error) {
      setSafe({
        status: 'error',
        message: error instanceof Error ? error.message : 'Could not request photo access.',
        retry: requestPermission,
      });
    }
  }, [loadGroups, setSafe]);

  useEffect(() => {
    async function init() {
      // expo-media-library has no web implementation.
      if (Platform.OS === 'web') {
        setSafe({ status: 'unsupported' });
        return;
      }

      try {
        const permission = await getPermissionsAsync();
        if (!mountedRef.current) return;

        if (permission.granted) {
          await loadGroups();
        } else if (permission.canAskAgain) {
          await requestPermission();
        } else {
          setSafe({ status: 'denied', canAskAgain: false, requestPermission });
        }
      } catch (error) {
        setSafe({
          status: 'error',
          message: error instanceof Error ? error.message : 'Could not access your photos.',
          retry: loadGroups,
        });
      }
    }

    init();
  }, [loadGroups, requestPermission, setSafe]);

  return state;
}
