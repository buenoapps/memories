import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { IconButton } from '@/components/icon-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type Action = {
  label: string;
  icon: IconName;
  onPress: () => void;
  /** Renders the action in a destructive (red) style, e.g. delete. */
  destructive?: boolean;
};

export type ActionMenuProps = {
  actions: Action[];
  /** Icon for the trigger button. Defaults to the "more" ellipsis. */
  triggerIcon?: IconName;
  accessibilityLabel?: string;
  tintColor?: string;
};

/**
 * A header dropdown: tapping the trigger opens a small anchored menu of
 * actions. Built on a transparent Modal so it floats above the screen and
 * dismisses on outside tap. New actions (delete, favourite, …) can be added by
 * extending the `actions` array.
 */
export function ActionMenu({
  actions,
  triggerIcon = 'more',
  accessibilityLabel = 'More actions',
  tintColor,
}: ActionMenuProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        name={triggerIcon}
        color={tintColor}
        accessibilityLabel={accessibilityLabel}
        onPress={() => setOpen(true)}
      />

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.menu, { backgroundColor: theme.backgroundElement }]}>
            {actions.map((action, index) => (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                onPress={() => {
                  setOpen(false);
                  action.onPress();
                }}
                style={({ pressed }) => [
                  styles.item,
                  index > 0 && { borderTopColor: theme.background, borderTopWidth: StyleSheet.hairlineWidth },
                  pressed && { backgroundColor: theme.backgroundSelected },
                ]}>
                <ThemedText themeColor={action.destructive ? undefined : 'text'} style={action.destructive ? styles.destructive : undefined}>
                  {action.label}
                </ThemedText>
                <Icon
                  name={action.icon}
                  size={18}
                  color={action.destructive ? '#FF3B30' : theme.text}
                />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: Spacing.six,
    paddingHorizontal: Spacing.three,
  },
  menu: {
    minWidth: 200,
    borderRadius: Spacing.three,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  destructive: {
    color: '#FF3B30',
  },
});
