import { router } from 'expo-router';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import type { MemoryPhoto } from '@/hooks/use-memories';

/**
 * Holds the photo list the full-screen viewer and slideshow are currently
 * showing. The lists can be large, so rather than serialising them through
 * navigation params we stash them here and navigate with a simple route.
 */
type PlaybackValue = {
  photos: MemoryPhoto[];
  initialIndex: number;
  /** Opens the full-screen viewer at `index` within `photos`. */
  openViewer: (photos: MemoryPhoto[], index: number) => void;
  /** Opens the slideshow for `photos`, optionally starting at `index`. */
  openSlideshow: (photos: MemoryPhoto[], index?: number) => void;
};

const PlaybackContext = createContext<PlaybackValue | null>(null);

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<MemoryPhoto[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);
  // Keep the latest list in a ref too so callbacks stay stable.
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const openViewer = useCallback((next: MemoryPhoto[], index: number) => {
    setPhotos(next);
    setInitialIndex(index);
    router.push('/viewer');
  }, []);

  const openSlideshow = useCallback((next: MemoryPhoto[], index = 0) => {
    // Slideshows only make sense for still images; skip videos.
    const stills = next.filter((photo) => !photo.isVideo);
    setPhotos(stills.length > 0 ? stills : next);
    setInitialIndex(index);
    router.push('/slideshow');
  }, []);

  const value = useMemo(
    () => ({ photos, initialIndex, openViewer, openSlideshow }),
    [photos, initialIndex, openViewer, openSlideshow],
  );

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlayback(): PlaybackValue {
  const value = useContext(PlaybackContext);
  if (!value) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return value;
}
