import { Pressable, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { Spacing } from '@/constants/theme';

export type IconButtonProps = {
  name: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
};

/** A circular, accessible tap target wrapping a single {@link Icon}. */
export function IconButton({
  name,
  onPress,
  accessibilityLabel,
  size = 22,
  color,
  style,
  hitSlop = Spacing.two,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={hitSlop}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}>
      <Icon name={name} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
});
