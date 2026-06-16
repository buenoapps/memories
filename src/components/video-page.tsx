import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { resolveShareUri } from '@/utils/share';

const DISMISS_DISTANCE = 140;
const DISMISS_VELOCITY = 900;

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; uri: string }
  | { status: 'error' };

type VideoPageProps = {
  id: string;
  active: boolean;
  width: number;
  height: number;
  dragY: SharedValue<number>;
  onClose: () => void;
};

/**
 * Renders a single video asset full-screen with native playback controls. The
 * playable file URI is resolved lazily (downloading from iCloud if needed)
 * because the raw asset id is not always directly playable; if it can't be
 * resolved we show a short message rather than spinning forever. The video plays
 * automatically while its page is on screen and pauses when scrolled away.
 */
export function VideoPage({ id, active, width, height, dragY, onClose }: VideoPageProps) {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setLoad({ status: 'loading' });
    resolveShareUri(id)
      .then((resolved) => {
        if (cancelled) return;
        setLoad(resolved ? { status: 'ready', uri: resolved } : { status: 'error' });
      })
      .catch(() => {
        if (!cancelled) setLoad({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const uri = load.status === 'ready' ? load.uri : null;
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false;
  });

  // Play while this page is the active one; pause (and rewind) when it isn't.
  useEffect(() => {
    if (!player) return;
    if (active && uri) {
      player.play();
    } else {
      player.pause();
      player.currentTime = 0;
    }
  }, [active, uri, player]);

  // Swipe down to dismiss. A single finger and a vertical activation threshold
  // keep this from interfering with the video's native controls.
  const panDismiss = Gesture.Pan()
    .maxPointers(1)
    .activeOffsetY([-15, 15])
    .failOffsetX([-15, 15])
    .onUpdate((event) => {
      dragY.value = event.translationY;
    })
    .onEnd((event) => {
      const dismiss =
        Math.abs(event.translationY) > DISMISS_DISTANCE ||
        Math.abs(event.velocityY) > DISMISS_VELOCITY;
      if (dismiss) {
        dragY.value = withTiming(
          Math.sign(event.translationY || 1) * height,
          { duration: 200 },
          () => runOnJS(onClose)(),
        );
      } else {
        dragY.value = withSpring(0, { damping: 20 });
      }
    });

  const pageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: dragY.value },
      { scale: interpolate(Math.abs(dragY.value), [0, DISMISS_DISTANCE * 2], [1, 0.8], 'clamp') },
    ],
  }));

  return (
    <GestureDetector gesture={panDismiss}>
      <Animated.View style={[styles.page, { width, height }, pageStyle]}>
        {load.status === 'loading' && <ActivityIndicator color="#fff" />}
        {load.status === 'error' && (
          <ThemedText style={styles.error}>This video can’t be played.</ThemedText>
        )}
        {load.status === 'ready' && (
          <VideoView style={styles.video} player={player} contentFit="contain" nativeControls />
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  page: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    flex: 1,
    width: '100%',
  },
  error: {
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
