import * as Application from 'expo-application';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icon';
import { IconButton } from '@/components/icon-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TimePickerModal } from '@/components/time-picker-modal';
import { APP_REVIEW_URL, APP_SHARE_MESSAGE, APP_SHARE_URL } from '@/constants/app';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { refreshMemoryNotifications } from '@/hooks/use-notifications';
import { useSettings } from '@/hooks/use-settings';
import { formatHour, type Settings } from '@/utils/settings';

const version = Application.nativeApplicationVersion ?? '1.0.0';
const build = Application.nativeBuildVersion;

function SettingsRow({
  icon,
  label,
  detail,
  onPress,
  loading = false,
  showChevron = true,
}: {
  icon: IconName;
  label: string;
  detail?: string;
  onPress?: () => void;
  loading?: boolean;
  showChevron?: boolean;
}) {
  const theme = useTheme();

  const renderAccessory = () => {
    if (detail) {
      return (
        <ThemedText type="small" themeColor="textSecondary">
          {detail}
        </ThemedText>
      );
    }
    if (loading) {
      return <ActivityIndicator size="small" color={theme.textSecondary} />;
    }
    if (onPress && showChevron) {
      return <Icon name="chevronRight" size={16} color={theme.textSecondary} />;
    }
    return null;
  };

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={20} color={theme.text} />
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      {renderAccessory()}
    </Pressable>
  );
}

/** Which time setting the picker is currently editing. */
type TimeField = 'dayStartHour' | 'dayEndHour' | 'notificationHour';

const TIME_PICKER_TITLES: Record<TimeField, string> = {
  dayStartHour: 'Day starts at',
  dayEndHour: 'Day ends at',
  notificationHour: 'Reminder time',
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const { settings, update } = useSettings();
  const [activeField, setActiveField] = useState<TimeField | null>(null);
  // Mirror the latest settings synchronously so closing the picker can reschedule
  // with the new values even on Android, where change + close fire in one event
  // before the async persist has flushed.
  const latestSettings = useRef(settings);
  latestSettings.current = settings;
  // Set while a picker is open if the user actually changes its value, so we
  // only rebuild the (expensive) notification schedule when something changed.
  const pickerDirty = useRef(false);

  const handlePickHour = (field: TimeField, hour: number) => {
    if (hour === latestSettings.current[field]) return;
    pickerDirty.current = true;
    const next: Settings = { ...latestSettings.current, [field]: hour };
    latestSettings.current = next;
    update({ [field]: hour } as Partial<Settings>);
  };

  const closePicker = () => {
    setActiveField(null);
    if (pickerDirty.current) {
      pickerDirty.current = false;
      // Reschedule with the new times; best effort, ignore missing permissions.
      refreshMemoryNotifications(new Date(), latestSettings.current).catch(() => {});
    }
  };

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
    setRefreshing(true);
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
    } finally {
      setRefreshing(false);
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
            MEMORY DAY
          </ThemedText>
          <SettingsRow
            icon="clock"
            label="Day starts at"
            detail={formatHour(settings.dayStartHour)}
            onPress={() => setActiveField('dayStartHour')}
          />
          <SettingsRow
            icon="clock"
            label="Day ends at"
            detail={formatHour(settings.dayEndHour)}
            onPress={() => setActiveField('dayEndHour')}
          />
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionHint}>
            Photos are grouped from the start time on a day until the end time the next morning, so
            late-night shots still show with the right day.
          </ThemedText>

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
            REMINDERS
          </ThemedText>
          <SettingsRow
            icon="bell"
            label="Reminder time"
            detail={formatHour(settings.notificationHour)}
            onPress={() => setActiveField('notificationHour')}
          />
          <SettingsRow
            icon="calendar"
            label="Refresh daily reminders"
            onPress={refreshNotifications}
            loading={refreshing}
            showChevron={false}
          />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
            SUPPORT THE APP
          </ThemedText>
          <SettingsRow icon="share" label="Share this app" onPress={shareApp} showChevron={false} />
          <SettingsRow icon="star" label="Rate this app" onPress={rateApp} showChevron={false} />

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

      <TimePickerModal
        visible={activeField !== null}
        title={activeField ? TIME_PICKER_TITLES[activeField] : ''}
        hour={activeField ? settings[activeField] : 0}
        onChangeHour={(hour) => activeField && handlePickHour(activeField, hour)}
        onClose={closePicker}
      />
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
  sectionHint: {
    marginTop: Spacing.one,
    marginHorizontal: Spacing.two,
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
