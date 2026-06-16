import { router } from 'expo-router';

import { ImageViewer } from '@/components/image-viewer';
import { usePlayback } from '@/context/playback';

export default function ViewerScreen() {
  const { photos, initialIndex } = usePlayback();

  return (
    <ImageViewer
      photos={photos}
      initialIndex={initialIndex}
      onClose={() => {
        if (router.canGoBack()) router.back();
      }}
    />
  );
}
