import { useState } from 'react';

import { MemoriesStatus } from '@/components/memories-status';
import { MemoriesView } from '@/components/memories-view';
import { useMemories } from '@/hooks/use-memories';
import { formatDayLabel, isSameMonthDay } from '@/utils/memories';

export default function MemoriesScreen() {
  const [date, setDate] = useState(() => new Date());
  const memories = useMemories({ date });

  const today = isSameMonthDay(date, new Date());
  const title = today ? 'On This Day' : formatDayLabel(date);
  const dayLabel = formatDayLabel(date);

  if (memories.status !== 'ready') {
    return <MemoriesStatus state={memories} emptyBody="" />;
  }

  return (
    <MemoriesView
      groups={memories.groups}
      title={title}
      date={date}
      onChangeDate={setDate}
      enableYearLinks
      showSettings
      emptyHint={`No photos from ${dayLabel} in earlier years. Pick another day to look back on.`}
    />
  );
}
