import { Image } from 'expo-image';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { MemoryGroup, MemoryPhoto } from '@/hooks/use-memories';
import { useTheme } from '@/hooks/use-theme';
import { photoCountLabel, yearsAgoLabel } from '@/utils/memories';

/** Usable width of a memory row, matching the screen's content padding. */
const ROW_WIDTH = Math.min(Dimensions.get('window').width - Spacing.four * 2, 520);

/** Height of the lead (first) photo in a memory row. */
const HERO_HEIGHT = ROW_WIDTH * 0.75;

/** Square size of each thumbnail, sized to fit three across with gaps between. */
const THUMB_SIZE = (ROW_WIDTH - Spacing.two * 2) / 3;

export type MemoryRowProps = {
  group: MemoryGroup;
  /** When true, taps select instead of opening, and checkmarks are shown. */
  selectionMode?: boolean;
  selectedIds?: string[];
  onPressPhoto?: (photo: MemoryPhoto) => void;
  onLongPressPhoto?: (photo: MemoryPhoto) => void;
  /** When provided, the year header becomes a button (e.g. open the year page). */
  onPressHeader?: (group: MemoryGroup) => void;
};

function VideoBadge() {
  return (
    <View style={styles.videoBadge}>
      <Icon name="play" size={12} color="#fff" />
    </View>
  );
}

function SelectionMark({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.selectMark, selected && styles.selectMarkOn]}>
      {selected && <Icon name="check" size={20} color="#fff" />}
    </View>
  );
}

function PhotoTile({
  photo,
  style,
  selectionMode,
  selected,
  onPress,
  onLongPress,
}: {
  photo: MemoryPhoto;
  style: object;
  selectionMode: boolean;
  selected: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      accessibilityRole="imagebutton"
      style={({ pressed }) => [style, pressed && styles.pressed]}>
      <Image
        source={{ uri: photo.uri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />
      {photo.isVideo && <VideoBadge />}
      {selectionMode && <SelectionMark selected={selected} />}
    </Pressable>
  );
}

/** Renders one year's memories: a headline plus the day's photos. */
export function MemoryRow({
  group,
  selectionMode = false,
  selectedIds = [],
  onPressPhoto,
  onLongPressPhoto,
  onPressHeader,
}: MemoryRowProps) {
  const theme = useTheme();
  const [hero, ...rest] = group.photos;
  const selectedSet = new Set(selectedIds);

  const headerContent = (
    <>
      <View style={styles.headerText}>
        <ThemedText type="subtitle">{group.year}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {yearsAgoLabel(group.yearsAgo)} · {photoCountLabel(group.photos.length)}
        </ThemedText>
      </View>
      {onPressHeader && <Icon name="chevronRight" size={18} color={theme.textSecondary} />}
    </>
  );

  return (
    <ThemedView style={styles.container}>
      {onPressHeader ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onPressHeader(group)}
          style={({ pressed }) => [styles.header, pressed && styles.pressed]}>
          {headerContent}
        </Pressable>
      ) : (
        <ThemedView style={styles.header}>{headerContent}</ThemedView>
      )}

      {hero && (
        <PhotoTile
          photo={hero}
          style={styles.hero}
          selectionMode={selectionMode}
          selected={selectedSet.has(hero.id)}
          onPress={onPressPhoto ? () => onPressPhoto(hero) : undefined}
          onLongPress={onLongPressPhoto ? () => onLongPressPhoto(hero) : undefined}
        />
      )}

      {rest.length > 0 && (
        <View style={styles.grid}>
          {rest.map((photo) => (
            <PhotoTile
              key={photo.id}
              photo={photo}
              style={styles.thumb}
              selectionMode={selectionMode}
              selected={selectedSet.has(photo.id)}
              onPress={onPressPhoto ? () => onPressPhoto(photo) : undefined}
              onLongPress={onLongPressPhoto ? () => onLongPressPhoto(photo) : undefined}
            />
          ))}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headerText: {
    gap: Spacing.half,
  },
  hero: {
    width: '100%',
    height: HERO_HEIGHT,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.7,
  },
  videoBadge: {
    position: 'absolute',
    bottom: Spacing.one,
    left: Spacing.one,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectMark: {
    position: 'absolute',
    top: Spacing.one,
    right: Spacing.one,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectMarkOn: {
    backgroundColor: '#208AEF',
    borderColor: '#208AEF',
  },
});
