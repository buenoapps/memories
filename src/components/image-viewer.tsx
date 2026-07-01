import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  interpolate,
  runOnJS,
  type SharedValue,
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
import { useFreeOrientationWhileMounted } from '@/hooks/use-orientation';
import { useTranslation } from '@/hooks/use-settings';
import { shareAssets } from '@/utils/share';

/** Vertical drag distance / velocity past which a swipe dismisses the viewer. */
const DISMISS_DISTANCE = 140;
const DISMISS_VELOCITY = 900;
/** How far you can zoom a still image with pinch or a double-tap. */
const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;

export type ImageViewerProps = {
  photos: MemoryPhoto[];
  initialIndex: number;
  onClose: () => void;
};

/**
 * A native-feeling full-screen media viewer: horizontal paging between items,
 * pinch / double-tap to zoom on stills, a vertical swipe to dismiss (with the
 * backdrop fading as you drag), and a tap to toggle the chrome. Videos play
 * inline with native controls. The screen rotates freely so landscape media can
 * be viewed full-bleed.
 */
export function ImageViewer({ photos, initialIndex, onClose }: ImageViewerProps) {
  useFreeOrientationWhileMounted();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);
  const [chromeVisible, setChromeVisible] = useState(true);
  // Paging is disabled whenever the current still is zoomed in, so the pan
  // gesture moves the image instead of flicking to the next one.
  const [pagerScrollEnabled, setPagerScrollEnabled] = useState(true);
  const listRef = useRef<FlatList<MemoryPhoto>>(null);

  // Drives the swipe-to-dismiss interaction. Shared by whichever page is on
  // screen (only one is visible at a time).
  const dragY = useSharedValue(0);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(dragY.value), [0, DISMISS_DISTANCE * 2], [1, 0], 'clamp'),
  }));

  const toggleChrome = useCallback(() => setChromeVisible((value) => !value), []);

  // Keep the current page aligned after an orientation change resizes the pages.
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: index * width, animated: false });
  }, [width, index]);

  const onMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
    },
    [width],
  );

  const renderItem = useCallback(
    ({ item, index: itemIndex }: ListRenderItemInfo<MemoryPhoto>) => {
      const active = itemIndex === index;
      return (
        <View style={{ width, height }}>
          {item.isVideo ? (
            <VideoPage
              id={item.id}
              active={active}
              width={width}
              height={height}
              dragY={dragY}
              onClose={onClose}
            />
          ) : (
            <ZoomableImage
              uri={item.uri}
              active={active}
              width={width}
              height={height}
              dragY={dragY}
              onToggleChrome={toggleChrome}
              onZoomChange={(zoomed) => setPagerScrollEnabled(!zoomed)}
              onClose={onClose}
            />
          )}
        </View>
      );
    },
    [index, width, height, dragY, toggleChrome, onClose],
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
          scrollEnabled={pagerScrollEnabled}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onMomentumScrollEnd={onMomentumEnd}
        />
      </Animated.View>

      {chromeVisible && (
        <Animated.View
          entering={FadeIn}
          style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
          <IconButton
            name="close"
            color="#fff"
            accessibilityLabel={t('common.close')}
            onPress={onClose}
          />
          <ThemedText style={styles.counter}>
            {photos.length > 0
              ? t('slideshow.counter', { index: index + 1, total: photos.length })
              : ''}
          </ThemedText>
          {current ? (
            <ActionMenu
              tintColor="#fff"
              actions={[
                {
                  label: t('common.share'),
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

type ZoomableImageProps = {
  uri: string;
  active: boolean;
  width: number;
  height: number;
  dragY: SharedValue<number>;
  onToggleChrome: () => void;
  onZoomChange: (zoomed: boolean) => void;
  onClose: () => void;
};

/**
 * A single, zoomable still. Pinch or double-tap to zoom; pan to move around when
 * zoomed in, or swipe down to dismiss when at rest. Reports its zoom state up so
 * the pager can disable horizontal scrolling while the image is enlarged.
 */
function ZoomableImage({
  uri,
  active,
  width,
  height,
  dragY,
  onToggleChrome,
  onZoomChange,
  onClose,
}: ZoomableImageProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const [zoomed, setZoomed] = useState(false);

  const setZoomedState = useCallback(
    (value: boolean) => {
      setZoomed(value);
      onZoomChange(value);
    },
    [onZoomChange],
  );

  const resetZoom = useCallback(() => {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    runOnJS(setZoomedState)(false);
  }, [scale, savedScale, translateX, translateY, savedTranslateX, savedTranslateY, setZoomedState]);

  // When this page scrolls off-screen, snap it back to its un-zoomed state so it
  // looks right the next time it appears.
  useEffect(() => {
    if (!active && zoomed) resetZoom();
  }, [active, zoomed, resetZoom]);

  // Clamp the pan so the image can't be dragged off into empty space.
  const clampTranslation = useCallback(() => {
    'worklet';
    const maxX = (width * (scale.value - 1)) / 2;
    const maxY = (height * (scale.value - 1)) / 2;
    translateX.value = Math.min(Math.max(translateX.value, -maxX), maxX);
    translateY.value = Math.min(Math.max(translateY.value, -maxY), maxY);
  }, [width, height, scale, translateX, translateY]);

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(Math.max(savedScale.value * event.scale, 0.85), MAX_ZOOM);
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        resetZoom();
      } else {
        savedScale.value = scale.value;
        clampTranslation();
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
        runOnJS(setZoomedState)(true);
      }
    });

  // Pan the image while zoomed in.
  const panZoom = Gesture.Pan()
    .enabled(zoomed)
    .averageTouches(true)
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      clampTranslation();
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Swipe down to dismiss while at rest. A single finger only, so it never
  // fights a two-finger pinch, and it yields horizontal drags to the pager.
  const panDismiss = Gesture.Pan()
    .enabled(!zoomed)
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

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        resetZoom();
      } else {
        scale.value = withTiming(DOUBLE_TAP_ZOOM);
        savedScale.value = DOUBLE_TAP_ZOOM;
        runOnJS(setZoomedState)(true);
      }
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      runOnJS(onToggleChrome)();
    });

  const composed = Gesture.Simultaneous(
    pinch,
    panZoom,
    panDismiss,
    Gesture.Exclusive(doubleTap, singleTap),
  );

  const imageStyle = useAnimatedStyle(() => {
    const dismissScale = interpolate(
      Math.abs(dragY.value),
      [0, DISMISS_DISTANCE * 2],
      [1, 0.8],
      'clamp',
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + dragY.value },
        { scale: scale.value * dismissScale },
      ],
    };
  });

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.page, { width, height }, imageStyle]}>
        <Image source={{ uri }} style={styles.image} contentFit="contain" transition={150} />
      </Animated.View>
    </GestureDetector>
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
    alignItems: 'center',
    justifyContent: 'center',
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
