import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-settings';
import { useTheme } from '@/hooks/use-theme';
import { SUPPORTED_LANGUAGES, SYSTEM_LANGUAGE } from '@/i18n';

export type LanguagePickerModalProps = {
  visible: boolean;
  /** The current language setting: `'system'` or a supported language code. */
  value: string;
  /** Called with the chosen value (`'system'` or a language code). */
  onSelect: (value: string) => void;
  onClose: () => void;
};

/** One selectable row: the language name plus a check when it's the current choice. */
function LanguageRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.backgroundSelected }]}>
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      {selected && <Icon name="check" size={18} color={theme.text} />}
    </Pressable>
  );
}

/**
 * A bottom-sheet list for picking the app language. Offers "System default"
 * (follow the device language) followed by every supported language shown in its
 * own endonym, so it is recognisable regardless of the current UI language.
 */
export function LanguagePickerModal({ visible, value, onSelect, onClose }: LanguagePickerModalProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const choose = (next: string) => {
    onSelect(next);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.backgroundElement }]}
          onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>
              {t('settings.chooseLanguage')}
            </ThemedText>
            <Pressable accessibilityRole="button" onPress={onClose} hitSlop={Spacing.two}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                {t('common.done')}
              </ThemedText>
            </Pressable>
          </View>
          <ScrollView style={styles.list}>
            <LanguageRow
              label={t('settings.systemDefault')}
              selected={value === SYSTEM_LANGUAGE}
              onPress={() => choose(SYSTEM_LANGUAGE)}
            />
            {SUPPORTED_LANGUAGES.map((language) => (
              <LanguageRow
                key={language.code}
                label={language.label}
                selected={value === language.code}
                onPress={() => choose(language.code)}
              />
            ))}
          </ScrollView>
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
    // Cap the sheet so the long language list stays a scrollable panel.
    maxHeight: '80%',
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
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
  rowLabel: {
    flex: 1,
  },
});
