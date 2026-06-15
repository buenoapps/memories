import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPercent } from '@/utils/memories';

export type ProgressBarProps = {
  /** Progress from 0 to 1. */
  progress: number;
};

/** A thin determinate progress bar driven by a 0..1 value. */
export function ProgressBar({ progress }: ProgressBarProps) {
  const theme = useTheme();
  const width = formatPercent(progress);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(progress * 100), min: 0, max: 100 }}
      style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
      <View
        testID="progress-bar-fill"
        style={[styles.fill, { width: width as `${number}%`, backgroundColor: theme.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    maxWidth: 240,
    height: Spacing.one,
    borderRadius: Spacing.half,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Spacing.half,
  },
});
