import { Pressable, StyleSheet } from 'react-native';

import { ProgressBar } from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { MemoriesState } from '@/hooks/use-memories';
import { useTheme } from '@/hooks/use-theme';
import { formatPercent } from '@/utils/memories';

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

/**
 * Renders the non-content states (loading, permission, error, empty) shared by
 * the home and year screens. Returns `null` when the state is `ready`, so the
 * caller can render the real content instead.
 */
export function MemoriesStatus({
  state,
  emptyBody,
}: {
  state: MemoriesState;
  emptyBody: string;
}) {
  if (state.status === 'loading') {
    return (
      <CenteredMessage title="Looking back…" body="Finding your photos from this day.">
        <ThemedView style={styles.progressWrapper}>
          <ProgressBar progress={state.progress} />
          <ThemedText type="small" themeColor="textSecondary">
            {formatPercent(state.progress)}
          </ThemedText>
        </ThemedView>
      </CenteredMessage>
    );
  }

  if (state.status === 'unsupported') {
    return (
      <CenteredMessage
        title="Open on your phone"
        body="Memories reads photos from your device library, so it runs on iOS and Android."
      />
    );
  }

  if (state.status === 'denied') {
    return (
      <CenteredMessage
        title="Photo access needed"
        body={
          state.canAskAgain
            ? 'Allow access to your photos so Memories can show what you captured on this day.'
            : 'Enable photo access for Memories in your device settings to see your photos from this day.'
        }>
        {state.canAskAgain && <RetryButton onPress={state.requestPermission} />}
      </CenteredMessage>
    );
  }

  if (state.status === 'error') {
    return (
      <CenteredMessage title="Something went wrong" body={state.message}>
        <RetryButton onPress={state.retry} />
      </CenteredMessage>
    );
  }

  if (state.status === 'ready' && state.groups.length === 0) {
    return <CenteredMessage title="No memories yet" body={emptyBody} />;
  }

  return null;
}

const styles = StyleSheet.create({
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
