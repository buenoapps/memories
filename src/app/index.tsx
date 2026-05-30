import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MemoryRow } from '@/components/memory-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useMemories } from '@/hooks/use-memories';

function todayLabel() {
  return new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

function CenteredMessage({ title, body }: { title: string; body: string }) {
  return (
    <ThemedView style={styles.centered}>
      <ThemedText type="subtitle" style={styles.centerText}>
        {title}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.centerText}>
        {body}
      </ThemedText>
    </ThemedView>
  );
}

export default function MemoriesScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const memories = useMemories();

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  if (memories.status === 'loading') {
    return <CenteredMessage title="Looking back…" body="Finding your photos from this day." />;
  }

  if (memories.status === 'unsupported') {
    return (
      <CenteredMessage
        title="Open on your phone"
        body="Memories reads photos from your device library, so it runs on iOS and Android."
      />
    );
  }

  if (memories.status === 'denied') {
    return (
      <CenteredMessage
        title="Photo access needed"
        body={
          memories.canAskAgain
            ? 'Allow access to your photos so Memories can show what you captured on this day.'
            : 'Enable photo access for Memories in your device settings to see your photos from this day.'
        }
      />
    );
  }

  if (memories.groups.length === 0) {
    return (
      <CenteredMessage
        title="No memories yet"
        body={`You have no photos taken on ${todayLabel()} in previous years — check back another day.`}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + Spacing.four, paddingBottom: insets.bottom },
      ]}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">On This Day</ThemedText>
          <ThemedText themeColor="textSecondary">{todayLabel()} through the years</ThemedText>
        </ThemedView>

        {memories.groups.map((group) => (
          <MemoryRow key={group.year} group={group} />
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  titleContainer: {
    gap: Spacing.one,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
});
