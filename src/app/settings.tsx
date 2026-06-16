import * as Application from 'expo-application';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icon';
import { IconButton } from '@/components/icon-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { APP_REVIEW_URL, APP_SHARE_MESSAGE, APP_SHARE_URL } from '@/constants/app';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { refreshMemoryNotifications } from '@/hooks/use-notifications';

const version = Application.nativeApplicationVersion ?? '1.0.0';
const build = Application.nativeBuildVersion;

function SettingsRow({
  icon,
  label,
  detail,
  onPress,
}: {
  icon: IconName;
  label: string;
  detail?: string;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={20} color={theme.text} />
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      {detail ? (
        <ThemedText type="small" themeColor="textSecondary">
          {detail}
        </ThemedText>
      ) : (
        onPress && <Icon name="chevronRight" size={16} color={theme.textSecondary} />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  const shareApp = async () => {
    try {
      await Share.share({ message: `${APP_SHARE_MESSAGE} ${APP_SHARE_URL}`, url: APP_SHARE_URL });
    } catch {
      // User dismissed the share sheet.
    }
  };

  const rateApp = async () => {
    const canOpen = await Linking.canOpenURL(APP_REVIEW_URL);
    Linking.openURL(canOpen ? APP_REVIEW_URL : APP_SHARE_URL).catch(() => {});
  };

  const refreshNotifications = async () => {
    try {
      const count = await refreshMemoryNotifications();
      Alert.alert(
        'Reminders updated',
        count > 0
          ? `Scheduled ${count} morning reminder${count === 1 ? '' : 's'} for upcoming memories.`
          : 'No upcoming memories found in the next 30 days.',
      );
    } catch {
      Alert.alert('Reminders', 'Could not update reminders. Check photo and notification access.');
    }
  };

  return (
    <ThemedView style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <IconButton name="back" accessibilityLabel="Back" onPress={() => router.back()} />
        <ThemedText type="subtitle" style={styles.headerTitle}>
          Settings
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + Spacing.five },
        ]}>
        <View style={styles.content}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
            REMINDERS
          </ThemedText>
          <SettingsRow
            icon="calendar"
            label="Refresh daily reminders"
            onPress={refreshNotifications}
          />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
            SUPPORT THE APP
          </ThemedText>
          <SettingsRow icon="share" label="Share this app" onPress={shareApp} />
          <SettingsRow icon="star" label="Rate this app" onPress={rateApp} />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
            ABOUT
          </ThemedText>
          <SettingsRow
            icon="settings"
            label="Version"
            detail={build ? `${version} (${build})` : version}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  headerSpacer: {
    width: 30,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  sectionTitle: {
    marginTop: Spacing.four,
    marginBottom: Spacing.one,
    marginLeft: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  rowLabel: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
