import {
  AssetField,
  getPermissionsAsync,
  MediaType,
  Query,
  requestPermissionsAsync,
} from 'expo-media-library';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

/** A photo resolved to the fields the UI needs to render it. */
export type MemoryPhoto = {
  id: string;
  uri: string;
};

/** A single year's worth of photos taken on the current calendar day. */
export type MemoryGroup = {
  /** Calendar year the photos were taken, e.g. 2021. */
  year: number;
  /** How many years ago that was relative to today. */
  yearsAgo: number;
  photos: MemoryPhoto[];
};

export type MemoriesState =
  | { status: 'loading' }
  | { status: 'unsupported' }
  | { status: 'denied'; canAskAgain: boolean; requestPermission: () => Promise<void> }
  | { status: 'ready'; groups: MemoryGroup[]; refresh: () => Promise<void> };

/** How many years back to look for memories. */
const YEARS_BACK = 15;

/**
 * Returns photos from the user's library that were taken on today's
 * month/day in previous years – the classic "On This Day" memory.
 *
 * Rather than scanning the whole library, we run one narrow query per
 * past year bounded to that single calendar day.
 */
export function useMemories(): MemoriesState {
  const [state, setState] = useState<MemoriesState>({ status: 'loading' });

  const loadGroups = useCallback(async () => {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    const groups: MemoryGroup[] = [];

    for (let yearsAgo = 1; yearsAgo <= YEARS_BACK; yearsAgo++) {
      const year = now.getFullYear() - yearsAgo;
      const dayStart = new Date(year, month, day, 0, 0, 0, 0).getTime();
      const dayEnd = new Date(year, month, day, 23, 59, 59, 999).getTime();

      const assets = await new Query()
        .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
        .gte(AssetField.CREATION_TIME, dayStart)
        .lte(AssetField.CREATION_TIME, dayEnd)
        .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
        .exe();

      if (assets.length === 0) {
        continue;
      }

      const photos = await Promise.all(
        assets.map(async (asset) => ({ id: asset.id, uri: await asset.getUri() })),
      );

      groups.push({ year, yearsAgo, photos });
    }

    setState({ status: 'ready', groups, refresh: loadGroups });
  }, []);

  const requestPermission = useCallback(async () => {
    const { granted, canAskAgain } = await requestPermissionsAsync();
    if (granted) {
      setState({ status: 'loading' });
      await loadGroups();
    } else {
      setState({ status: 'denied', canAskAgain, requestPermission });
    }
  }, [loadGroups]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // expo-media-library has no web implementation.
      if (Platform.OS === 'web') {
        setState({ status: 'unsupported' });
        return;
      }

      const permission = await getPermissionsAsync();
      if (cancelled) return;

      if (permission.granted) {
        await loadGroups();
      } else if (permission.canAskAgain) {
        await requestPermission();
      } else {
        setState({ status: 'denied', canAskAgain: false, requestPermission });
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [loadGroups, requestPermission]);

  return state;
}
