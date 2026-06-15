import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MemoryRow } from '@/components/memory-row';
import { ProgressBar } from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useMemories } from '@/hooks/use-memories';
import { useTheme } from '@/hooks/use-theme';
import { formatDayLabel, formatPercent } from '@/utils/memories';

function CenteredMessage({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <ThemedView style={styles.centered}>
      <ThemedText type="subtitle" style={styles.centerText}>
        {title}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.centerText}>
        {body}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

function RetryButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <ThemedText type="smallBold">Try again</ThemedText>
    </Pressable>
  );
}

export default function MemoriesScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const memories = useMemories();
  const today = formatDayLabel(new Date());

  if (memories.status === 'loading') {
    return (
      <CenteredMessage title="Looking back…" body="Finding your photos from this day.">
        <ThemedView style={styles.progressWrapper}>
          <ProgressBar progress={memories.progress} />
          <ThemedText type="small" themeColor="textSecondary">
            {formatPercent(memories.progress)}
          </ThemedText>
        </ThemedView>
      </CenteredMessage>
    );
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
        }>
        {memories.canAskAgain && <RetryButton onPress={memories.requestPermission} />}
      </CenteredMessage>
    );
  }

  if (memories.status === 'error') {
    return (
      <CenteredMessage title="Something went wrong" body={memories.message}>
        <RetryButton onPress={memories.retry} />
      </CenteredMessage>
    );
  }

  if (memories.groups.length === 0) {
    return (
      <CenteredMessage
        title="No memories yet"
        body={`You have no photos taken on ${today} in earlier years — check back another day.`}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={safeAreaInsets}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: safeAreaInsets.top + Spacing.four,
          paddingBottom: safeAreaInsets.bottom + Spacing.four,
        },
      ]}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">On This Day</ThemedText>
          <ThemedText themeColor="textSecondary">{today} through the years</ThemedText>
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
  progressWrapper: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
    alignSelf: 'stretch',
  },
  button: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
});
