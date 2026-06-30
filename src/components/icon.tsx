import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'expo-symbols';
import { Platform, type StyleProp, Text, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** The set of icons the app uses, mapped to platform-specific glyphs. */
export type IconName =
  | 'share'
  | 'more'
  | 'play'
  | 'pause'
  | 'close'
  | 'calendar'
  | 'settings'
  | 'check'
  | 'back'
  | 'chevronRight'
  | 'slideshow'
  | 'star'
  | 'next'
  | 'previous'
  | 'video'
  | 'clock'
  | 'bell';

/** SF Symbol names (iOS) and Unicode fallbacks (Android/web) for each icon. */
const ICONS: Record<IconName, { sf: SFSymbol; glyph: string }> = {
  share: { sf: 'square.and.arrow.up', glyph: '􀈂' },
  more: { sf: 'ellipsis.circle', glyph: '⋯' },
  play: { sf: 'play.fill', glyph: '▶' },
  pause: { sf: 'pause.fill', glyph: '❙❙' },
  close: { sf: 'xmark', glyph: '✕' },
  calendar: { sf: 'calendar', glyph: '📅' },
  settings: { sf: 'gearshape', glyph: '⚙' },
  check: { sf: 'checkmark.circle.fill', glyph: '✓' },
  back: { sf: 'chevron.left', glyph: '‹' },
  chevronRight: { sf: 'chevron.right', glyph: '›' },
  slideshow: { sf: 'play.rectangle', glyph: '▷' },
  star: { sf: 'star.fill', glyph: '★' },
  next: { sf: 'forward.fill', glyph: '⏭' },
  previous: { sf: 'backward.fill', glyph: '⏮' },
  video: { sf: 'video.fill', glyph: '🎬' },
  clock: { sf: 'clock', glyph: '🕐' },
  bell: { sf: 'bell', glyph: '🔔' },
};

export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

/**
 * Renders an SF Symbol on iOS and a Unicode glyph fallback elsewhere, so the
 * app stays usable on Android and web without bundling a vector-icon font.
 */
export function Icon({ name, size = 22, color, style }: IconProps) {
  const theme = useTheme();
  const tint = color ?? theme.text;
  const icon = ICONS[name];

  if (Platform.OS === 'ios') {
    return <SymbolView name={icon.sf} size={size} tintColor={tint} style={style} />;
  }

  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[{ color: tint, fontSize: size * 0.9, lineHeight: size }, style]}>
      {icon.glyph}
    </Text>
  );
}
