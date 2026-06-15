import {
  AssetField,
  getPermissionsAsync,
  MediaType,
  Query,
  requestPermissionsAsync,
} from 'expo-media-library';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { buildSingleYear, buildYears, dayRange, YEARS_BACK } from '@/utils/memories';

/** A photo (or video) resolved to the fields the UI needs to render it. */
export type MemoryPhoto = {
  id: string;
  /**
   * URI used as the image source. This is the asset's own identifier URI
   * (`ph://…` on iOS, `content://…` on Android), which `expo-image` loads
   * directly. We deliberately avoid `Asset.getUri()` here: it extracts the
   * full-size original via `PHContentEditingInput` without network access, so
   * it throws "Missing content editing input for image" for iCloud photos that
   * aren't downloaded locally. Loading by `id` lets expo-image fetch a
   * display-sized (and, if needed, iCloud-backed) version instead.
   */
  uri: string;
  /** True when the asset is a video rather than a still image. */
  isVideo: boolean;
};

/** A single year's worth of photos taken on the chosen calendar day. */
export type MemoryGroup = {
  /** Calendar year the photos were taken, e.g. 2021. */
  year: number;
  /** How many years ago that was relative to the anchor date (0 = this year). */
  yearsAgo: number;
  photos: MemoryPhoto[];
};

export type MemoriesState =
  | { status: 'loading'; progress: number }
  | { status: 'unsupported' }
  | { status: 'denied'; canAskAgain: boolean; requestPermission: () => Promise<void> }
  | { status: 'error'; message: string; retry: () => Promise<void> }
  | { status: 'ready'; groups: MemoryGroup[]; refresh: () => Promise<void> };

export type UseMemoriesOptions = {
  /** The calendar day (month + day) to look back on. Defaults to today. */
  date?: Date;
  /** When set, only memories from this single year are returned. */
  year?: number;
};

/**
 * Returns photos and videos from the user's library that were taken on the
 * chosen month/day in the current and previous years – the classic "On This
 * Day" memory.
 *
 * Rather than scanning the whole library, we run narrow queries per year
 * bounded to that single calendar day, reporting progress as we go. Passing a
 * `year` narrows the result to one year, which powers the per-year detail page.
 */
export function useMemories(options?: UseMemoriesOptions): MemoriesState {
  const [state, setState] = useState<MemoriesState>({ status: 'loading', progress: 0 });
  const mountedRef = useRef(true);

  // Derive stable primitive dependencies so the effect only re-runs when the
  // actual day/year being viewed changes, not on every render.
  const anchorTime = options?.date?.getTime();
  const onlyYear = options?.year;

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
      const anchor = anchorTime != null ? new Date(anchorTime) : new Date();
      const month = anchor.getMonth();
      const day = anchor.getDate();
      const years =
        onlyYear != null ? buildSingleYear(anchor, onlyYear) : buildYears(anchor, YEARS_BACK);
      const groups: MemoryGroup[] = [];

      for (let i = 0; i < years.length; i++) {
        const { year, yearsAgo } = years[i];
        const { start, end } = dayRange(year, month, day);

        // One query for everything visible (images + videos) in shot order, and
        // a second, cheap query for just the videos so we can flag them without
        // an async round-trip per asset.
        const assets = await new Query()
          .within(AssetField.MEDIA_TYPE, [MediaType.IMAGE, MediaType.VIDEO])
          .gte(AssetField.CREATION_TIME, start)
          .lte(AssetField.CREATION_TIME, end)
          .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
          .exe();

        if (assets.length > 0) {
          const videos = await new Query()
            .eq(AssetField.MEDIA_TYPE, MediaType.VIDEO)
            .gte(AssetField.CREATION_TIME, start)
            .lte(AssetField.CREATION_TIME, end)
            .exe();
          const videoIds = new Set(videos.map((asset) => asset.id));

          const photos = assets.map((asset) => ({
            id: asset.id,
            uri: asset.id,
            isVideo: videoIds.has(asset.id),
          }));
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
  }, [anchorTime, onlyYear, setSafe]);

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

/** Flattens every group's photos into a single ordered list (newest year first). */
export function useFlatPhotos(groups: MemoryGroup[]): MemoryPhoto[] {
  return useMemo(() => groups.flatMap((group) => group.photos), [groups]);
}
