import { Image } from 'expo-image';
import { Dimensions, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { MemoryGroup } from '@/hooks/use-memories';

/** Width of the lead (first) photo in a memory row. */
const HERO_SIZE = Math.min(Dimensions.get('window').width - Spacing.four * 2, 520);

function yearsAgoLabel(yearsAgo: number) {
  return yearsAgo === 1 ? '1 year ago' : `${yearsAgo} years ago`;
}

/** Renders one year's memories: a headline plus the day's photos. */
export function MemoryRow({ group }: { group: MemoryGroup }) {
  const [hero, ...rest] = group.photos;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">{group.year}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {yearsAgoLabel(group.yearsAgo)} · {group.photos.length}{' '}
          {group.photos.length === 1 ? 'photo' : 'photos'}
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
    height: HERO_SIZE * 0.75,
    borderRadius: Spacing.three,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  thumb: {
    width: '31%',
    aspectRatio: 1,
    flexGrow: 1,
    borderRadius: Spacing.two,
  },
});
