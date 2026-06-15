import { Image } from 'expo-image';
import { Dimensions, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { MemoryGroup } from '@/hooks/use-memories';
import { photoCountLabel, yearsAgoLabel } from '@/utils/memories';

/** Usable width of a memory row, matching the screen's content padding. */
const ROW_WIDTH = Math.min(Dimensions.get('window').width - Spacing.four * 2, 520);

/** Height of the lead (first) photo in a memory row. */
const HERO_HEIGHT = ROW_WIDTH * 0.75;

/** Square size of each thumbnail, sized to fit three across with gaps between. */
const THUMB_SIZE = (ROW_WIDTH - Spacing.two * 2) / 3;

/** Renders one year's memories: a headline plus the day's photos. */
export function MemoryRow({ group }: { group: MemoryGroup }) {
  const [hero, ...rest] = group.photos;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">{group.year}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {yearsAgoLabel(group.yearsAgo)} · {photoCountLabel(group.photos.length)}
        </ThemedText>
      </ThemedView>

      <Image source={{ uri: hero.uri }} style={styles.hero} contentFit="cover" transition={200} />

      {rest.length > 0 && (
        <View style={styles.grid}>
          {rest.map((photo) => (
            <Image
              key={photo.id}
              source={{ uri: photo.uri }}
              style={styles.thumb}
              contentFit="cover"
              transition={200}
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
    gap: Spacing.half,
  },
  hero: {
    width: '100%',
    height: HERO_HEIGHT,
    borderRadius: Spacing.three,
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
  },
});
