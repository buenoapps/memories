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
import { LanguagePickerModal } from '@/components/language-picker-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TimePickerModal } from '@/components/time-picker-modal';
import { APP_REVIEW_URL, APP_SHARE_MESSAGE, APP_SHARE_URL } from '@/constants/app';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { SUPPORTED_LANGUAGES, SYSTEM_LANGUAGE } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { refreshMemoryNotifications } from '@/hooks/use-notifications';
import { useSettings, useTranslation } from '@/hooks/use-settings';
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

/** Translation key for each time field's picker title. */
const TIME_PICKER_TITLE_KEYS: Record<TimeField, string> = {
  dayStartHour: 'settings.dayStartsAt',
  dayEndHour: 'settings.dayEndsAt',
  notificationHour: 'settings.reminderTime',
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const { settings, update } = useSettings();
  const [activeField, setActiveField] = useState<TimeField | null>(null);
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);
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
        t('settings.remindersUpdatedTitle'),
        count > 0
          ? t(count === 1 ? 'settings.remindersScheduledOne' : 'settings.remindersScheduledOther', {
              count,
            })
          : t('settings.remindersNone'),
      );
    } catch {
      Alert.alert(t('settings.remindersErrorTitle'), t('settings.remindersError'));
    } finally {
      setRefreshing(false);
    }
  };

  // Label shown next to the Language row: the current choice in its own name.
  const currentLanguageLabel =
    settings.language === SYSTEM_LANGUAGE
      ? t('settings.systemDefault')
      : (SUPPORTED_LANGUAGES.find((language) => language.code === settings.language)?.label ??
        t('settings.systemDefault'));

  return (
    <ThemedView style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <IconButton name="back" accessibilityLabel={t('common.back')} onPress={() => router.back()} />
        <ThemedText type="subtitle" style={styles.headerTitle}>
          {t('settings.title')}
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
            {t('settings.sectionMemoryDay')}
          </ThemedText>
          <SettingsRow
            icon="clock"
            label={t('settings.dayStartsAt')}
            detail={formatHour(settings.dayStartHour)}
            onPress={() => setActiveField('dayStartHour')}
          />
          <SettingsRow
            icon="clock"
            label={t('settings.dayEndsAt')}
            detail={formatHour(settings.dayEndHour)}
            onPress={() => setActiveField('dayEndHour')}
          />
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionHint}>
            {t('settings.memoryDayHint')}
          </ThemedText>

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
            {t('settings.sectionReminders')}
          </ThemedText>
          <SettingsRow
            icon="bell"
            label={t('settings.reminderTime')}
            detail={formatHour(settings.notificationHour)}
            onPress={() => setActiveField('notificationHour')}
          />
          <SettingsRow
            icon="calendar"
            label={t('settings.refreshReminders')}
            onPress={refreshNotifications}
            loading={refreshing}
            showChevron={false}
          />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
            {t('settings.sectionLanguage')}
          </ThemedText>
          <SettingsRow
            icon="globe"
            label={t('settings.language')}
            detail={currentLanguageLabel}
            onPress={() => setLanguagePickerOpen(true)}
          />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
            {t('settings.sectionSupport')}
          </ThemedText>
          <SettingsRow
            icon="share"
            label={t('settings.shareApp')}
            onPress={shareApp}
            showChevron={false}
          />
          <SettingsRow
            icon="star"
            label={t('settings.rateApp')}
            onPress={rateApp}
            showChevron={false}
          />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
            {t('settings.sectionAbout')}
          </ThemedText>
          <SettingsRow
            icon="settings"
            label={t('settings.version')}
            detail={build ? `${version} (${build})` : version}
          />
        </View>
      </ScrollView>

      <TimePickerModal
        visible={activeField !== null}
        title={activeField ? t(TIME_PICKER_TITLE_KEYS[activeField]) : ''}
        hour={activeField ? settings[activeField] : 0}
        onChangeHour={(hour) => activeField && handlePickHour(activeField, hour)}
        onClose={closePicker}
      />

      <LanguagePickerModal
        visible={languagePickerOpen}
        value={settings.language}
        onSelect={(language) => update({ language })}
        onClose={() => setLanguagePickerOpen(false)}
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
