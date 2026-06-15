import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { IconButton } from '@/components/icon-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { usePlayback } from '@/context/playback';
import {
  clampIndex,
  DEFAULT_SPEED_INDEX,
  nextIndex,
  prevIndex,
  SLIDESHOW_SPEEDS,
} from '@/utils/slideshow';

export default function SlideshowScreen() {
  const insets = useSafeAreaInsets();
  const { photos } = usePlayback();

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speedIndex, setSpeedIndex] = useState(DEFAULT_SPEED_INDEX);
  const [chromeVisible, setChromeVisible] = useState(true);
  const indexRef = useRef(index);
  indexRef.current = index;

  // Drive the slideshow on an interval while playing.
  useEffect(() => {
    if (!playing || photos.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((current) => nextIndex(current, photos.length));
    }, SLIDESHOW_SPEEDS[speedIndex].intervalMs);
    return () => clearInterval(interval);
  }, [playing, speedIndex, photos.length]);

  const current = photos[clampIndex(index, photos.length)];

  if (!current) {
    return (
      <View style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
          <IconButton
            name="close"
            color="#fff"
            accessibilityLabel="Close"
            onPress={() => router.back()}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Pressable style={styles.flex} onPress={() => setChromeVisible((value) => !value)}>
        <Animated.View
          key={current.id}
          entering={FadeIn.duration(700)}
          exiting={FadeOut.duration(700)}
          style={StyleSheet.absoluteFill}>
          <Image source={{ uri: current.uri }} style={styles.image} contentFit="contain" />
        </Animated.View>
      </Pressable>

      {chromeVisible && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
          <IconButton
            name="close"
            color="#fff"
            accessibilityLabel="Close"
            onPress={() => router.back()}
          />
          <ThemedText style={styles.counter}>
            {index + 1} of {photos.length}
          </ThemedText>
          <View style={styles.headerSpacer} />
        </Animated.View>
      )}

      {chromeVisible && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={[styles.controls, { paddingBottom: insets.bottom + Spacing.four }]}>
          <View style={styles.speedRow}>
            {SLIDESHOW_SPEEDS.map((speed, i) => (
              <Pressable
                key={speed.label}
                accessibilityRole="button"
                onPress={() => setSpeedIndex(i)}
                style={[styles.speedChip, i === speedIndex && styles.speedChipActive]}>
                <ThemedText type="small" style={styles.speedLabel}>
                  {speed.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <View style={styles.transport}>
            <IconButton
              name="previous"
              size={28}
              color="#fff"
              accessibilityLabel="Previous"
              onPress={() => setIndex((current) => prevIndex(current, photos.length))}
            />
            <IconButton
              name={playing ? 'pause' : 'play'}
              size={36}
              color="#fff"
              accessibilityLabel={playing ? 'Pause' : 'Play'}
              onPress={() => setPlaying((value) => !value)}
            />
            <IconButton
              name="next"
              size={28}
              color="#fff"
              accessibilityLabel="Next"
              onPress={() => setIndex((current) => nextIndex(current, photos.length))}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  flex: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: '100%',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  counter: {
    color: '#fff',
    fontWeight: '600',
  },
  headerSpacer: {
    width: 30,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  speedRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  speedChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  speedChipActive: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  speedLabel: {
    color: '#fff',
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.five,
  },
});
