import { Image } from 'expo-image';
import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionMenu } from '@/components/action-menu';
import { IconButton } from '@/components/icon-button';
import { ThemedText } from '@/components/themed-text';
import { VideoPage } from '@/components/video-page';
import { Spacing } from '@/constants/theme';
import type { MemoryPhoto } from '@/hooks/use-memories';
import { shareAssets } from '@/utils/share';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/** Vertical drag distance / velocity past which a swipe dismisses the viewer. */
const DISMISS_DISTANCE = 140;
const DISMISS_VELOCITY = 900;

export type ImageViewerProps = {
  photos: MemoryPhoto[];
  initialIndex: number;
  onClose: () => void;
};

/**
 * A native-feeling full-screen media viewer: horizontal paging between items,
 * a vertical swipe to dismiss (with the backdrop fading as you drag), and a tap
 * to toggle the chrome. Videos play inline with native controls.
 */
export function ImageViewer({ photos, initialIndex, onClose }: ImageViewerProps) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(initialIndex);
  const [chromeVisible, setChromeVisible] = useState(true);
  const listRef = useRef<FlatList<MemoryPhoto>>(null);

  // Drives the swipe-to-dismiss interaction. Shared by whichever page is on
  // screen (only one is visible at a time).
  const dragY = useSharedValue(0);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(dragY.value), [0, DISMISS_DISTANCE * 2], [1, 0], 'clamp'),
  }));

  const pageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: dragY.value },
      { scale: interpolate(Math.abs(dragY.value), [0, DISMISS_DISTANCE * 2], [1, 0.8], 'clamp') },
    ],
  }));

  const toggleChrome = useCallback(() => setChromeVisible((value) => !value), []);

  const panGesture = Gesture.Pan()
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
          Math.sign(event.translationY || 1) * SCREEN_H,
          { duration: 200 },
          () => runOnJS(onClose)(),
        );
      } else {
        dragY.value = withSpring(0, { damping: 20 });
      }
    });

  const onMomentumEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / SCREEN_W));
  }, []);

  const renderItem = useCallback(
    ({ item, index: itemIndex }: ListRenderItemInfo<MemoryPhoto>) => (
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.page, pageStyle]}>
          <Pressable style={styles.pagePress} onPress={toggleChrome}>
            {item.isVideo ? (
              <VideoPage id={item.id} active={itemIndex === index} />
            ) : (
              <Image
                source={{ uri: item.uri }}
                style={styles.image}
                contentFit="contain"
                transition={150}
              />
            )}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    ),
    [panGesture, pageStyle, toggleChrome, index],
  );

  const current = photos[index];

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.backdrop, backdropStyle]} />

      <Animated.View entering={FadeIn.duration(220)} style={styles.flex}>
        <FlatList
          ref={listRef}
          data={photos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({ length: SCREEN_W, offset: SCREEN_W * i, index: i })}
          onMomentumScrollEnd={onMomentumEnd}
        />
      </Animated.View>

      {chromeVisible && (
        <Animated.View
          entering={FadeIn}
          style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
          <IconButton name="close" color="#fff" accessibilityLabel="Close" onPress={onClose} />
          <ThemedText style={styles.counter}>
            {photos.length > 0 ? `${index + 1} of ${photos.length}` : ''}
          </ThemedText>
          {current ? (
            <ActionMenu
              tintColor="#fff"
              actions={[
                {
                  label: 'Share',
                  icon: 'share',
                  onPress: () => {
                    void shareAssets([current.id]);
                  },
                },
              ]}
            />
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  page: {
    width: SCREEN_W,
    height: SCREEN_H,
  },
  pagePress: {
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
});
