import { useState } from 'react';

import { MemoriesStatus } from '@/components/memories-status';
import { MemoriesView } from '@/components/memories-view';
import { useMemories } from '@/hooks/use-memories';
import { useTranslation } from '@/hooks/use-settings';
import { formatDayLabel, isSameMonthDay } from '@/utils/memories';

export default function MemoriesScreen() {
  const [date, setDate] = useState(() => new Date());
  const memories = useMemories({ date });
  const { t } = useTranslation();

  const today = isSameMonthDay(date, new Date());
  const dayLabel = formatDayLabel(date);
  const title = today ? t('home.onThisDay') : dayLabel;

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
      emptyHint={t('home.emptyHint', { day: dayLabel })}
    />
  );
}
