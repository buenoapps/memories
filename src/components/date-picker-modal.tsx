import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type DatePickerModalProps = {
  visible: boolean;
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
};

/**
 * A date picker used to browse memories from another day. On Android the native
 * dialog is shown directly; on iOS we present an inline calendar inside a
 * bottom sheet with a "Done" button.
 */
export function DatePickerModal({ visible, value, onChange, onClose }: DatePickerModalProps) {
  const theme = useTheme();

  const handleNativeChange = (event: DateTimePickerEvent, date?: Date) => {
    // Android fires once and dismisses itself; mirror that for the caller.
    if (event.type === 'dismissed') {
      onClose();
      return;
    }
    if (date) onChange(date);
    if (Platform.OS !== 'ios') onClose();
  };

  if (Platform.OS === 'android') {
    if (!visible) return null;
    return (
      <DateTimePicker
        value={value}
        mode="date"
        display="calendar"
        maximumDate={new Date()}
        onChange={handleNativeChange}
      />
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.backgroundElement }]}
          onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>
              Pick a day
            </ThemedText>
            <Pressable accessibilityRole="button" onPress={onClose} hitSlop={Spacing.two}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Done
              </ThemedText>
            </Pressable>
          </View>
          <DateTimePicker
            value={value}
            mode="date"
            display="inline"
            maximumDate={new Date()}
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
