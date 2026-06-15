import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { resolveShareUri } from '@/utils/share';

/**
 * Renders a single video asset full-screen with native playback controls.
 * The playable file URI is resolved lazily (downloading from iCloud if needed)
 * because the raw asset id is not always directly playable.
 */
export function VideoPage({ id, active }: { id: string; active: boolean }) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    resolveShareUri(id)
      .then((resolved) => {
        if (!cancelled) setUri(resolved);
      })
      .catch(() => {
        if (!cancelled) setUri(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false;
  });

  // Pause when this page scrolls out of view.
  useEffect(() => {
    if (!active) player.pause();
  }, [active, player]);

  if (!uri) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <VideoView style={styles.video} player={player} contentFit="contain" nativeControls />
  );
}

const styles = StyleSheet.create({
  video: {
    flex: 1,
    width: '100%',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
