import {
  buildLookaheadDays,
  morningOf,
  MORNING_HOUR,
  notificationBody,
} from '@/utils/notifications-schedule';

describe('morningOf', () => {
  it('pins a date to the morning reminder hour', () => {
    const morning = morningOf(new Date(2026, 5, 15, 18, 30));
    expect(morning.getHours()).toBe(MORNING_HOUR);
    expect(morning.getMinutes()).toBe(0);
    expect(morning.getDate()).toBe(15);
  });
});

describe('buildLookaheadDays', () => {
  it('returns one morning per upcoming day', () => {
    const now = new Date(2026, 5, 15, 6, 0); // before the morning hour
    const days = buildLookaheadDays(now, 5);
    expect(days).toHaveLength(5);
    expect(days[0].getDate()).toBe(15);
    expect(days.every((day) => day.getHours() === MORNING_HOUR)).toBe(true);
  });

  it('skips today when its reminder time has already passed', () => {
    const now = new Date(2026, 5, 15, 12, 0); // after the morning hour
    const days = buildLookaheadDays(now, 5);
    expect(days).toHaveLength(4);
    expect(days[0].getDate()).toBe(16);
  });
});

describe('notificationBody', () => {
  it('pluralises the memory count', () => {
    expect(notificationBody(1)).toContain('1 memory');
    expect(notificationBody(4)).toContain('4 memories');
  });
});
