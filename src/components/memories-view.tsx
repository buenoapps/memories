import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DatePickerModal } from '@/components/date-picker-modal';
import { Icon } from '@/components/icon';
import { IconButton } from '@/components/icon-button';
import { MemoryRow } from '@/components/memory-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { usePlayback } from '@/context/playback';
import { useFlatPhotos, type MemoryGroup, type MemoryPhoto } from '@/hooks/use-memories';
import { useTranslation } from '@/hooks/use-settings';
import { useTheme } from '@/hooks/use-theme';
import { shareAssets } from '@/utils/share';
import { isAllSelected, selectionTitle, toggleId, toggleSelectAll } from '@/utils/selection';

export type MemoriesViewProps = {
  groups: MemoryGroup[];
  title: string;
  /** The day being shown; used to seed the date picker. */
  date: Date;
  /** When provided, the title and date become buttons that open a date picker. */
  onChangeDate?: (date: Date) => void;
  /** When true, year headers link to the per-year detail page. */
  enableYearLinks?: boolean;
  /** When true, a settings button is shown in the action bar. */
  showSettings?: boolean;
  /** Message shown in place of rows when there are no memories for the day. */
  emptyHint?: string;
  /** When provided, a back button is shown at the start of the action bar. */
  onBack?: () => void;
};

/**
 * The shared "ready" content for the home and year screens: a scrollable list
 * of memory rows with multi-select, a slideshow entry point, an optional date
 * picker, and per-year navigation.
 */
export function MemoriesView({
  groups,
  title,
  date,
  onChangeDate,
  enableYearLinks = false,
  showSettings = false,
  emptyHint,
  onBack,
}: MemoriesViewProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t, locale } = useTranslation();
  const { openViewer, openSlideshow } = usePlayback();
  const flatPhotos = useFlatPhotos(groups);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const allIds = flatPhotos.map((photo) => photo.id);

  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds([]);
  }, []);

  const handlePressPhoto = useCallback(
    (photo: MemoryPhoto) => {
      if (selectionMode) {
        setSelectedIds((ids) => toggleId(ids, photo.id));
        return;
      }
      const index = flatPhotos.findIndex((entry) => entry.id === photo.id);
      openViewer(flatPhotos, Math.max(0, index));
    },
    [selectionMode, flatPhotos, openViewer],
  );

  const handleLongPressPhoto = useCallback((photo: MemoryPhoto) => {
    setSelectionMode(true);
    setSelectedIds((ids) => (ids.includes(photo.id) ? ids : [...ids, photo.id]));
  }, []);

  const handlePressHeader = useCallback(
    (group: MemoryGroup) => {
      router.push({
        pathname: '/year/[year]',
        params: { year: String(group.year), date: String(date.getTime()) },
      });
    },
    [date],
  );

  return (
    <ThemedView style={styles.flex}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: insets.top + Spacing.three,
            paddingBottom: insets.bottom + Spacing.four,
          },
        ]}>
        <ThemedView style={styles.content}>
          {selectionMode ? (
            <View style={styles.actionBar}>
              <Pressable accessibilityRole="button" onPress={exitSelection} hitSlop={Spacing.two}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  {t('common.cancel')}
                </ThemedText>
              </Pressable>
              <ThemedText type="smallBold">{selectionTitle(selectedIds.length)}</ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={() => setSelectedIds((ids) => toggleSelectAll(ids, allIds))}
                hitSlop={Spacing.two}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  {isAllSelected(selectedIds, allIds) ? t('selection.clear') : t('selection.selectAll')}
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.actionBar}>
              <View style={styles.actionIcons}>
                {onBack && (
                  <IconButton name="back" accessibilityLabel={t('common.back')} onPress={onBack} />
                )}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSelectionMode(true)}
                  hitSlop={Spacing.two}>
                  <ThemedText type="smallBold" themeColor="textSecondary">
                    {t('selection.select')}
                  </ThemedText>
                </Pressable>
              </View>
              <View style={styles.actionIcons}>
                {flatPhotos.length > 0 && (
                  <IconButton
                    name="slideshow"
                    accessibilityLabel={t('actions.startSlideshow')}
                    onPress={() => openSlideshow(flatPhotos)}
                  />
                )}
                {showSettings && (
                  <IconButton
                    name="settings"
                    accessibilityLabel={t('actions.settings')}
                    onPress={() => router.push('/settings')}
                  />
                )}
              </View>
            </View>
          )}

          <ThemedView style={styles.titleContainer}>
            {onChangeDate ? (
              <Pressable accessibilityRole="button" onPress={() => setPickerOpen(true)}>
                <View style={styles.titleRow}>
                  <ThemedText type="title">{title}</ThemedText>
                  <Icon name="calendar" size={24} color={theme.textSecondary} />
                </View>
                <ThemedText type="link" themeColor="textSecondary">
                  {date.toLocaleDateString(locale, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </ThemedText>
              </Pressable>
            ) : (
              <ThemedText type="title">{title}</ThemedText>
            )}
          </ThemedView>

          {groups.length === 0 && emptyHint ? (
            <ThemedText themeColor="textSecondary" style={styles.emptyHint}>
              {emptyHint}
            </ThemedText>
          ) : (
            groups.map((group) => (
              <MemoryRow
                key={group.year}
                group={group}
                selectionMode={selectionMode}
                selectedIds={selectedIds}
                onPressPhoto={handlePressPhoto}
                onLongPressPhoto={handleLongPressPhoto}
                onPressHeader={enableYearLinks ? handlePressHeader : undefined}
              />
            ))
          )}
        </ThemedView>
      </ScrollView>

      {selectionMode && (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: insets.bottom + Spacing.two, backgroundColor: theme.backgroundElement },
          ]}>
          <Pressable
            accessibilityRole="button"
            disabled={selectedIds.length === 0}
            onPress={() => {
              void shareAssets(selectedIds);
            }}
            style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}>
            <Icon
              name="share"
              size={22}
              color={selectedIds.length === 0 ? theme.textSecondary : theme.text}
            />
            <ThemedText
              type="smallBold"
              themeColor={selectedIds.length === 0 ? 'textSecondary' : 'text'}>
              {t('common.share')}
            </ThemedText>
          </Pressable>
        </View>
      )}

      {onChangeDate && (
        <DatePickerModal
          visible={pickerOpen}
          value={date}
          onClose={() => setPickerOpen(false)}
          onChange={(next) => {
            onChangeDate(next);
            setPickerOpen(false);
          }}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  titleContainer: {
    gap: Spacing.one,
  },
  emptyHint: {
    marginTop: Spacing.two,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.6,
  },
});
