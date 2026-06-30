import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMemo } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TimePickerModalProps = {
  visible: boolean;
  /** Title shown above the picker on iOS, e.g. "Day starts at". */
  title: string;
  /** Currently selected hour (0–23). */
  hour: number;
  /** Called with the newly chosen whole hour (0–23). Minutes are ignored. */
  onChangeHour: (hour: number) => void;
  onClose: () => void;
};

/**
 * An hour picker modelled on `DatePickerModal`: on Android the native time
 * dialog is shown directly; on iOS a spinner is presented inside a bottom sheet
 * with a "Done" button. Only the hour is significant – the settings store whole
 * hours – so the chosen minutes are discarded.
 */
export function TimePickerModal({
  visible,
  title,
  hour,
  onChangeHour,
  onClose,
}: TimePickerModalProps) {
  const theme = useTheme();

  // Represent the hour as a Date for the native picker; the calendar day is
  // irrelevant because only the hour is read back out.
  const value = useMemo(() => {
    const date = new Date(2000, 0, 1);
    date.setHours(hour, 0, 0, 0);
    return date;
  }, [hour]);

  const handleNativeChange = (event: DateTimePickerEvent, date?: Date) => {
    // Android fires once and dismisses itself; mirror that for the caller.
    if (event.type === 'dismissed') {
      onClose();
      return;
    }
    if (date) onChangeHour(date.getHours());
    if (Platform.OS !== 'ios') onClose();
  };

  if (Platform.OS === 'android') {
    if (!visible) return null;
    return <DateTimePicker value={value} mode="time" display="clock" onChange={handleNativeChange} />;
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.backgroundElement }]}
          onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>
              {title}
            </ThemedText>
            <Pressable accessibilityRole="button" onPress={onClose} hitSlop={Spacing.two}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Done
              </ThemedText>
            </Pressable>
          </View>
          <DateTimePicker
            value={value}
            mode="time"
            display="spinner"
            minuteInterval={30}
            onChange={handleNativeChange}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.three,
    paddingBottom: Spacing.five,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
});
