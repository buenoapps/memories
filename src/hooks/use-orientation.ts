import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { Platform } from 'react-native';

/** Best-effort lock; swallows web/unsupported rejections so callers stay simple. */
function lock(orientation: ScreenOrientation.OrientationLock) {
  if (Platform.OS === 'web') return;
  ScreenOrientation.lockAsync(orientation).catch(() => {});
}

/** Keeps the app pinned to portrait. Call once from the root so every regular
 * screen stays upright regardless of how the device is held. */
export function lockPortrait() {
  lock(ScreenOrientation.OrientationLock.PORTRAIT_UP);
}

/**
 * Allows the device to rotate freely (including landscape) while the calling
 * screen is mounted, then restores the portrait lock on unmount. Used by the
 * full-screen media viewer and slideshow so landscape photos and videos can be
 * viewed full-bleed without rotating the rest of the app.
 */
export function useFreeOrientationWhileMounted() {
  useEffect(() => {
    lock(ScreenOrientation.OrientationLock.ALL);
    return () => {
      lock(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);
}
