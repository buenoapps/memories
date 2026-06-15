import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { MemoriesStatus } from '@/components/memories-status';
import { MemoriesView } from '@/components/memories-view';
import { useMemories } from '@/hooks/use-memories';
import { formatDayLabel } from '@/utils/memories';

export default function YearScreen() {
  const params = useLocalSearchParams<{ year: string; date?: string }>();
  const year = Number(params.year);
  const date = useMemo(() => {
    const time = params.date ? Number(params.date) : NaN;
    return Number.isFinite(time) ? new Date(time) : new Date();
  }, [params.date]);

  const memories = useMemories({ date, year });
  const dayLabel = formatDayLabel(date);

  if (memories.status !== 'ready') {
    return <MemoriesStatus state={memories} emptyBody="" />;
  }

  return (
    <MemoriesView
      groups={memories.groups}
      title={String(year)}
      date={date}
      onBack={() => router.back()}
      emptyHint={`No photos from ${dayLabel}, ${year}.`}
    />
  );
}
